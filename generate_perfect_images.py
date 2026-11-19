import os
from PIL import Image, ImageFilter, ImageDraw

src_dir = r"C:\Users\Admin\.gemini\antigravity\brain\82fb4d20-cb2b-4014-a1f0-d73b0f64ed5f\.user_uploaded"
dest_dir = r"c:\Users\Admin\.gemini\antigravity\scratch\zionfoundation\assets\images"

# 1. VERONICA SOLOMON
# Raw: media_1795108002367_2381daa3.jpg, size 576 x 1024
# Let's inspect her face vertical coordinates:
# Hair top: ~120
# Eyes: ~320
# Mouth/smile: ~450
# Chin: ~530
# Blouse collar: ~650
# Bottom of visible blouse: ~920
# If we take box (0, 60, 576, 850) -> width=576, height=790
# That includes her full hair, full face, chin, neck, collar, and black blouse!
v_raw_path = os.path.join(src_dir, "media_1795108002367_2381daa3.jpg")
im_v = Image.open(v_raw_path).convert('RGB')
print("Veronica raw opened:", im_v.size)

# Target 16:9 canvas: 1280 x 720
target_w, target_h = 1280, 720

# Let's crop Veronica from y=70 to y=870 (height 800)
# Scale to height 720: scale = 720 / 800 = 0.90
# Width becomes 576 * 0.90 = 518
# In 1280 wide canvas, paste_x = (1280 - 518) // 2 = 381
v_crop = im_v.crop((0, 70, 576, 870))
v_scaled = v_crop.resize((int(round(576 * 720 / 800)), 720), Image.Resampling.LANCZOS)
sub_w, sub_h = v_scaled.size
paste_x = (target_w - sub_w) // 2

# Background extension:
# Veronica's background has a floral curtain on the right and soft beige wall/curtain on the left
# We can create a 1280 x 720 background using a horizontally mirrored and blurred copy of the scaled image
bg = v_scaled.resize((target_w, target_h), Image.Resampling.BILINEAR).filter(ImageFilter.GaussianBlur(35))
canvas_v = bg.copy()
# Paste the crisp subject in center with soft feathered mask at the vertical borders
mask = Image.new('L', (sub_w, sub_h), 255)
# Feather left 25px and right 25px
draw = ImageDraw.Draw(mask)
for i in range(25):
    alpha = int(255 * (i / 25.0))
    draw.line([(i, 0), (i, sub_h)], fill=alpha)
    draw.line([(sub_w - 1 - i, 0), (sub_w - 1 - i, sub_h)], fill=alpha)

canvas_v.paste(v_scaled, (paste_x, 0), mask)
canvas_v.save(os.path.join(dest_dir, "veronica-solomon.jpg"), quality=95)
print("Saved veronica-solomon.jpg:", canvas_v.size)

# 2. SAI KIRAN
# Raw: media_1795108002337_75941e53.jpg, size 642 x 765
s_raw_path = os.path.join(src_dir, "media_1795108002337_75941e53.jpg")
im_s = Image.open(s_raw_path).convert('RGB')
# First, remove/heal the bottom-left glare on his shirt:
# Glare area is around x=60..150, y=550..680
# We can blend it with authentic plaid from x=180..270, y=550..680
plaid_patch = im_s.crop((180, 560, 270, 680)).filter(ImageFilter.GaussianBlur(1))
im_s.paste(plaid_patch, (70, 560))

# Crop from y=40 down to y=700 (avoiding the white text border at y=710+)
s_crop = im_s.crop((10, 30, 632, 700)) # width 622, height 670
s_scaled = s_crop.resize((int(round(622 * 720 / 670)), 720), Image.Resampling.LANCZOS)
sub_w, sub_h = s_scaled.size
paste_x = (target_w - sub_w) // 2

bg_s = s_scaled.resize((target_w, target_h), Image.Resampling.BILINEAR).filter(ImageFilter.GaussianBlur(35))
canvas_s = bg_s.copy()
mask_s = Image.new('L', (sub_w, sub_h), 255)
draw_s = ImageDraw.Draw(mask_s)
for i in range(25):
    alpha = int(255 * (i / 25.0))
    draw_s.line([(i, 0), (i, sub_h)], fill=alpha)
    draw_s.line([(sub_w - 1 - i, 0), (sub_w - 1 - i, sub_h)], fill=alpha)

canvas_s.paste(s_scaled, (paste_x, 0), mask_s)
canvas_s.save(os.path.join(dest_dir, "sai-kiran.jpg"), quality=95)
print("Saved sai-kiran.jpg:", canvas_s.size)

# 3. DAVID WALE OLADUNNI
# Raw: media_1795108002361_e6c779af.jpg, size 770 x 1024
d_raw_path = os.path.join(src_dir, "media_1795108002361_e6c779af.jpg")
im_d = Image.open(d_raw_path).convert('RGB')
# Crop David head and sports jacket from y=180 to y=880 (height 700, width 770)
d_crop = im_d.crop((0, 180, 770, 880))
d_scaled = d_crop.resize((int(round(770 * 720 / 700)), 720), Image.Resampling.LANCZOS)
sub_w, sub_h = d_scaled.size
paste_x = (target_w - sub_w) // 2

bg_d = d_scaled.resize((target_w, target_h), Image.Resampling.BILINEAR).filter(ImageFilter.GaussianBlur(35))
canvas_d = bg_d.copy()
mask_d = Image.new('L', (sub_w, sub_h), 255)
draw_d = ImageDraw.Draw(mask_d)
for i in range(25):
    alpha = int(255 * (i / 25.0))
    draw_d.line([(i, 0), (i, sub_h)], fill=alpha)
    draw_d.line([(sub_w - 1 - i, 0), (sub_w - 1 - i, sub_h)], fill=alpha)

canvas_d.paste(d_scaled, (paste_x, 0), mask_d)
canvas_d.save(os.path.join(dest_dir, "david-oladunni.jpg"), quality=95)
print("Saved david-oladunni.jpg:", canvas_d.size)

# 4. VOLUNTEERS
# Raw: media_1795108002347_794f204c.jpg, size 1024 x 768
vol_raw_path = os.path.join(src_dir, "media_1795108002347_794f204c.jpg")
im_vol = Image.open(vol_raw_path).convert('RGB')
# Crop from y=60 down to y=760 (height 700, width 1024)
vol_crop = im_vol.crop((0, 60, 1024, 760))
vol_scaled = vol_crop.resize((int(round(1024 * 720 / 700)), 720), Image.Resampling.LANCZOS)
sub_w, sub_h = vol_scaled.size
paste_x = (target_w - sub_w) // 2

bg_vol = vol_scaled.resize((target_w, target_h), Image.Resampling.BILINEAR).filter(ImageFilter.GaussianBlur(35))
canvas_vol = bg_vol.copy()
mask_vol = Image.new('L', (sub_w, sub_h), 255)
draw_vol = ImageDraw.Draw(mask_vol)
for i in range(25):
    alpha = int(255 * (i / 25.0))
    draw_vol.line([(i, 0), (i, sub_h)], fill=alpha)
    draw_vol.line([(sub_w - 1 - i, 0), (sub_w - 1 - i, sub_h)], fill=alpha)

canvas_vol.paste(vol_scaled, (paste_x, 0), mask_vol)
canvas_vol.save(os.path.join(dest_dir, "volunteers.jpg"), quality=95)
print("Saved volunteers.jpg:", canvas_vol.size)
