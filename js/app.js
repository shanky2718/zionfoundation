/**
 * Trust Zion Foundation - Web Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileMenu();
  initScrollReveal();
  initStatsCounter();
  initCurrentYear();
  initModalBackdropClicks();
});

// 1. Header scroll effect
function initHeaderScroll() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// 2. Mobile Menu Drawer
function initMobileMenu() {
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const closeBtn = document.getElementById('mobileNavClose');
  const overlay = document.getElementById('mobileNavOverlay');

  if (mobileBtn && overlay) {
    mobileBtn.addEventListener('click', () => {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  if (closeBtn && overlay) {
    closeBtn.addEventListener('click', closeMobileMenu);
  }
}

function closeMobileMenu() {
  const overlay = document.getElementById('mobileNavOverlay');
  if (overlay) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// 3. Scroll Reveal Animations
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach(el => observer.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }
}

// 4. Dynamic Counter for Stats
function initStatsCounter() {
  const statsContainer = document.getElementById('statsContainer');
  if (!statsContainer) return;

  let hasAnimated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        animateStats();
      }
    });
  }, { threshold: 0.3 });

  observer.observe(statsContainer);
}

function animateStats() {
  const statNumbers = document.querySelectorAll('.stat-number');
  statNumbers.forEach(stat => {
    const target = parseInt(stat.getAttribute('data-target'), 10);
    const suffix = stat.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;

    let current = 0;
    const duration = 1800; // ms
    const stepTime = 25;
    const totalSteps = duration / stepTime;
    const increment = target / totalSteps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      stat.textContent = Math.floor(current).toLocaleString('en-US') + suffix;
    }, stepTime);
  });
}

// 5. Donation Tier Selection
let selectedDonationAmount = 60;
let donationFrequency = 'one-time';

const donationTiers = [
  { amount: 25, label: 'Feeds a family for a week' },
  { amount: 60, label: "Sponsors a child's tutoring" },
  { amount: 150, label: 'Funds emergency housing aid' }
];

function selectTier(index) {
  const tierCards = document.querySelectorAll('.tier-card');
  tierCards.forEach((card, i) => {
    if (i === index) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });

  selectedDonationAmount = donationTiers[index].amount;
  updateDonationButtonLabel();
}

function updateDonationButtonLabel() {
  const btn = document.getElementById('btnDynamicDonate');
  if (btn) {
    const freqText = donationFrequency === 'monthly' ? '/ month' : '';
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
      </svg>
      Donate $${selectedDonationAmount}${freqText} Now
    `;
  }
}

// 6. Donation Modal
function openDonateModal(isMonthly = false) {
  const modal = document.getElementById('donateModal');
  const amountInput = document.getElementById('modalDonationAmount');
  const formContent = document.getElementById('donateModalFormContent');
  const successContent = document.getElementById('donateModalSuccessContent');

  if (amountInput) {
    amountInput.value = selectedDonationAmount;
  }

  if (formContent && successContent) {
    formContent.style.display = 'block';
    successContent.style.display = 'none';
  }

  if (isMonthly) {
    setDonationFreq('monthly');
  } else {
    setDonationFreq('one-time');
  }

  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeDonateModal() {
  const modal = document.getElementById('donateModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function setDonationFreq(freq) {
  donationFrequency = freq;
  const onceBtn = document.getElementById('freqOnceBtn');
  const monthlyBtn = document.getElementById('freqMonthlyBtn');

  if (freq === 'monthly') {
    if (monthlyBtn) {
      monthlyBtn.style.background = 'var(--color-primary)';
      monthlyBtn.style.color = 'white';
      monthlyBtn.style.borderColor = 'var(--color-primary)';
    }
    if (onceBtn) {
      onceBtn.style.background = 'transparent';
      onceBtn.style.color = 'inherit';
      onceBtn.style.borderColor = 'var(--color-input)';
    }
  } else {
    if (onceBtn) {
      onceBtn.style.background = 'var(--color-primary)';
      onceBtn.style.color = 'white';
      onceBtn.style.borderColor = 'var(--color-primary)';
    }
    if (monthlyBtn) {
      monthlyBtn.style.background = 'transparent';
      monthlyBtn.style.color = 'inherit';
      monthlyBtn.style.borderColor = 'var(--color-input)';
    }
  }

  updateDonationButtonLabel();
}

function handleDonateSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('dName').value;
  const amount = document.getElementById('modalDonationAmount').value || selectedDonationAmount;
  
  const formContent = document.getElementById('donateModalFormContent');
  const successContent = document.getElementById('donateModalSuccessContent');
  const receiptNumber = document.getElementById('receiptNumber');
  const receiptAmount = document.getElementById('receiptAmount');
  const receiptDonor = document.getElementById('receiptDonor');

  if (receiptNumber) {
    receiptNumber.textContent = `TZF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  if (receiptAmount) {
    receiptAmount.textContent = `$${amount}.00 USD (${donationFrequency})`;
  }
  if (receiptDonor) {
    receiptDonor.textContent = name;
  }

  if (formContent && successContent) {
    formContent.style.display = 'none';
    successContent.style.display = 'block';
  }

  showToast(`Thank you, ${name}! Your gift of $${amount} was received.`);
}

// 7. Event RSVP Modal
function openRsvpModal(title, time, place) {
  const modal = document.getElementById('rsvpModal');
  const modalTitle = document.getElementById('rsvpModalTitle');
  const modalDetails = document.getElementById('rsvpModalDetails');
  const formBlock = document.getElementById('rsvpFormBlock');
  const successBlock = document.getElementById('rsvpSuccessBlock');

  if (modalTitle) modalTitle.textContent = title;
  if (modalDetails) modalDetails.textContent = `${time} · ${place}`;

  if (formBlock && successBlock) {
    formBlock.style.display = 'block';
    successBlock.style.display = 'none';
  }

  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeRsvpModal() {
  const modal = document.getElementById('rsvpModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function handleRsvpSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('rName').value;
  const formBlock = document.getElementById('rsvpFormBlock');
  const successBlock = document.getElementById('rsvpSuccessBlock');

  if (formBlock && successBlock) {
    formBlock.style.display = 'none';
    successBlock.style.display = 'block';
  }

  showToast(`RSVP Confirmed for ${name}!`);
}

// 8. Story Modal
function openStoryModal(title, cat, excerpt, img, body) {
  const modal = document.getElementById('storyModal');
  const mTitle = document.getElementById('storyModalTitle');
  const mCat = document.getElementById('storyModalCat');
  const mImg = document.getElementById('storyModalImg');
  const mBody = document.getElementById('storyModalBody');

  if (mTitle) mTitle.textContent = title;
  if (mCat) mCat.textContent = cat;
  if (mImg) mImg.src = img;
  if (mBody) mBody.textContent = body;

  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeStoryModal() {
  const modal = document.getElementById('storyModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// 9. Volunteer Program helper
function openVolunteerWithProgram(programName) {
  const select = document.getElementById('vInterest');
  if (select) {
    select.value = programName;
  }
  const volunteerSection = document.getElementById('volunteer');
  if (volunteerSection) {
    volunteerSection.scrollIntoView({ behavior: 'smooth' });
  }
}

function handleVolunteerSubmit(event) {
  event.preventDefault();
  const form = document.getElementById('volunteerForm');
  const successBox = document.getElementById('volunteerFormSuccess');
  const name = document.getElementById('vName').value;

  if (form && successBox) {
    form.style.display = 'none';
    successBox.style.display = 'block';
  }

  showToast(`Welcome to Trust Zion, ${name}!`);
}

function resetVolunteerForm() {
  const form = document.getElementById('volunteerForm');
  const successBox = document.getElementById('volunteerFormSuccess');
  if (form && successBox) {
    form.reset();
    form.style.display = 'block';
    successBox.style.display = 'none';
  }
}

// 10. Contact Form
function handleContactSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('cName').value;
  const form = document.getElementById('contactForm');
  if (form) form.reset();
  showToast(`Message sent! Thank you, ${name}.`);
}

// 11. Toast Utility
function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 6 9 17l-5-5"></path>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// 12. Modal backdrop close handler
function initModalBackdropClicks() {
  const backdrops = document.querySelectorAll('.modal-backdrop');
  backdrops.forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  // ESC key listener
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      backdrops.forEach(b => b.classList.remove('open'));
      closeMobileMenu();
      document.body.style.overflow = '';
    }
  });
}

// 13. Dynamic Year
function initCurrentYear() {
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}
