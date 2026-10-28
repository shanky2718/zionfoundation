#!/usr/bin/env python3
"""
Trust Zion Foundation - Backend Server
Supports static serving, secure Razorpay order creation & signature verification,
and animal food donation pledge recording.
"""

import http.server
import socketserver
import json
import os
import urllib.request
import urllib.error
import base64
import hmac
import hashlib
import time
from datetime import datetime

# Load environment variables from .env if present
def load_env():
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, val = line.split('=', 1)
                    os.environ.setdefault(key.strip(), val.strip())

load_env()

PORT = int(os.environ.get('PORT', 8089))
RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', '').strip()
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', '').strip()

# Check if real keys are configured
HAS_REAL_KEYS = bool(
    RAZORPAY_KEY_ID and 
    RAZORPAY_KEY_SECRET and 
    not RAZORPAY_KEY_ID.startswith('rzp_test_placeholder') and
    RAZORPAY_KEY_ID.startswith('rzp_')
)

DATA_DIR = os.path.dirname(__file__)
DONATIONS_FILE = os.path.join(DATA_DIR, 'donations.json')
FOOD_DONATIONS_FILE = os.path.join(DATA_DIR, 'food_donations.json')

def save_json_record(filepath, record):
    records = []
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                records = json.load(f)
        except Exception:
            records = []
    records.append(record)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(records, f, indent=2)

class CustomHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and disable aggressive caching for API
        if self.path.startswith('/api/'):
            self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def send_json(self, status_code, data):
        body = json.dumps(data).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == '/api/config/razorpay-key':
            # Strictly return public Key ID only, never secret!
            key_id = RAZORPAY_KEY_ID if RAZORPAY_KEY_ID else 'rzp_test_simulation'
            self.send_json(200, {
                'keyId': key_id,
                'isTestMode': not HAS_REAL_KEYS,
                'status': 'configured' if HAS_REAL_KEYS else 'simulation_ready'
            })
            return

        super().do_GET()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)

        try:
            payload = json.loads(post_data.decode('utf-8')) if post_data else {}
        except Exception:
            self.send_json(400, {'error': 'Invalid JSON in request body'})
            return

        if self.path == '/api/create-razorpay-order':
            self.handle_create_order(payload)
        elif self.path == '/api/verify-razorpay-payment':
            self.handle_verify_payment(payload)
        elif self.path == '/api/submit-food-donation':
            self.handle_food_donation(payload)
        else:
            self.send_json(404, {'error': 'API endpoint not found'})

    def handle_create_order(self, payload):
        """Creates a Razorpay Order server-side"""
        try:
            amount = float(payload.get('amount', 0))
            if amount <= 0:
                self.send_json(400, {'error': 'Amount must be greater than zero'})
                return

            currency = payload.get('currency', 'INR').upper()
            purpose = payload.get('purpose', 'Donation')
            donor_name = payload.get('donorName', 'Anonymous')
            donor_email = payload.get('donorEmail', '')

            # Razorpay requires amount in smallest currency unit (paise for INR, cents for USD)
            amount_in_smallest_unit = int(round(amount * 100))
            receipt_id = f"tzf_rcpt_{int(time.time())}"

            if HAS_REAL_KEYS:
                # Real Razorpay Order Creation via official API
                order_payload = {
                    "amount": amount_in_smallest_unit,
                    "currency": currency,
                    "receipt": receipt_id,
                    "notes": {
                        "purpose": purpose[:30],
                        "donor_name": donor_name[:30],
                        "organization": "Trust Zion Foundation"
                    }
                }

                req = urllib.request.Request(
                    'https://api.razorpay.com/v1/orders',
                    data=json.dumps(order_payload).encode('utf-8'),
                    headers={'Content-Type': 'application/json'}
                )
                auth_str = f"{RAZORPAY_KEY_ID}:{RAZORPAY_KEY_SECRET}"
                auth_b64 = base64.b64encode(auth_str.encode('utf-8')).decode('utf-8')
                req.add_header('Authorization', f'Basic {auth_b64}')

                try:
                    with urllib.request.urlopen(req, timeout=12) as response:
                        res_data = json.loads(response.read().decode('utf-8'))
                        self.send_json(200, {
                            'orderId': res_data['id'],
                            'amount': res_data['amount'],
                            'currency': res_data['currency'],
                            'keyId': RAZORPAY_KEY_ID,
                            'purpose': purpose
                        })
                        return
                except urllib.error.HTTPError as err:
                    err_msg = err.read().decode('utf-8')
                    print(f"[Razorpay API Error] {err_msg}")
                    # Fallback to test mode simulation order if real key had a permission error
                    order_id = f"order_test_{int(time.time())}_{int(amount)}"
                    self.send_json(200, {
                        'orderId': order_id,
                        'amount': amount_in_smallest_unit,
                        'currency': currency,
                        'keyId': RAZORPAY_KEY_ID or 'rzp_test_simulation',
                        'purpose': purpose,
                        'testMode': True,
                        'notice': 'Order initialized in test fallback mode'
                    })
                    return
            else:
                # Test/Simulation mode order
                order_id = f"order_test_{int(time.time())}_{int(amount)}"
                self.send_json(200, {
                    'orderId': order_id,
                    'amount': amount_in_smallest_unit,
                    'currency': currency,
                    'keyId': RAZORPAY_KEY_ID or 'rzp_test_simulation',
                    'purpose': purpose,
                    'testMode': True
                })
        except Exception as e:
            self.send_json(500, {'error': f'Failed to create order: {str(e)}'})

    def handle_verify_payment(self, payload):
        """Verifies HMAC SHA256 Signature of Razorpay payment"""
        try:
            order_id = payload.get('razorpay_order_id', '')
            payment_id = payload.get('razorpay_payment_id', '')
            signature = payload.get('razorpay_signature', '')
            amount = payload.get('amount', 0)
            currency = payload.get('currency', 'INR')
            purpose = payload.get('purpose', 'Animal Welfare')
            donor_name = payload.get('donorName', 'Anonymous')
            donor_email = payload.get('donorEmail', '')

            if not order_id or not payment_id:
                self.send_json(400, {'success': False, 'error': 'Missing order_id or payment_id'})
                return

            verified = False

            if HAS_REAL_KEYS:
                # Official Razorpay Signature Verification: HMAC SHA256 (order_id + "|" + payment_id, secret)
                msg = f"{order_id}|{payment_id}".encode('utf-8')
                expected_sig = hmac.new(RAZORPAY_KEY_SECRET.encode('utf-8'), msg, hashlib.sha256).hexdigest()
                if hmac.compare_digest(expected_sig, signature):
                    verified = True
                else:
                    self.send_json(400, {'success': False, 'error': 'Invalid Razorpay payment signature'})
                    return
            else:
                # Test simulation verification
                verified = True

            receipt_num = f"TZF-RZP-{datetime.now().strftime('%Y%m%d')}-{int(time.time()) % 10000:04d}"

            # Store donation record safely
            record = {
                'receipt': receipt_num,
                'order_id': order_id,
                'payment_id': payment_id,
                'amount': amount,
                'currency': currency,
                'purpose': purpose,
                'donor_name': donor_name,
                'donor_email': donor_email,
                'timestamp': datetime.now().isoformat(),
                'status': 'VERIFIED_SUCCESS'
            }
            save_json_record(DONATIONS_FILE, record)

            self.send_json(200, {
                'success': True,
                'receipt': receipt_num,
                'orderId': order_id,
                'paymentId': payment_id,
                'purpose': purpose,
                'amount': amount,
                'currency': currency,
                'message': 'Payment verified and donation recorded successfully'
            })
        except Exception as e:
            self.send_json(500, {'success': False, 'error': f'Verification failed: {str(e)}'})

    def handle_food_donation(self, payload):
        """Records physical animal food donation pledge"""
        try:
            donor_name = payload.get('donorName', 'Anonymous')
            donor_email = payload.get('donorEmail', '')
            donor_phone = payload.get('donorPhone', '')
            food_type = payload.get('foodType', 'Dry Dog Kibble')
            quantity = payload.get('quantity', '10 kg')
            delivery_method = payload.get('deliveryMethod', 'Drop-off at Station')
            address = payload.get('address', '')
            notes = payload.get('notes', '')
            purpose = payload.get('purpose', 'Zion Loyals Animal Food Donation')

            pledge_num = f"TZF-FOOD-{datetime.now().strftime('%Y%m')}-{int(time.time()) % 10000:04d}"

            record = {
                'pledge_id': pledge_num,
                'donor_name': donor_name,
                'donor_email': donor_email,
                'donor_phone': donor_phone,
                'food_type': food_type,
                'quantity': quantity,
                'delivery_method': delivery_method,
                'address': address,
                'notes': notes,
                'purpose': purpose,
                'timestamp': datetime.now().isoformat(),
                'status': 'PLEDGE_CONFIRMED'
            }
            save_json_record(FOOD_DONATIONS_FILE, record)

            self.send_json(200, {
                'success': True,
                'pledgeId': pledge_num,
                'foodType': food_type,
                'quantity': quantity,
                'deliveryMethod': delivery_method,
                'message': 'Animal food donation pledge registered successfully'
            })
        except Exception as e:
            self.send_json(500, {'success': False, 'error': f'Failed to register food donation: {str(e)}'})

def run_server():
    os.chdir(DATA_DIR)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), CustomHTTPHandler) as httpd:
        print(f"Trust Zion Foundation Server running on http://localhost:{PORT}")
        print(f"Razorpay Status: {'Live/Test Keys Configured' if HAS_REAL_KEYS else 'Test Mode Simulation Ready'}")
        print("Static Files + Razorpay API: Ready")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")

if __name__ == '__main__':
    run_server()
