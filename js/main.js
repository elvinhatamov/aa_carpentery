/* ===== AA Carpentry – Main JavaScript ===== */

(function () {
  'use strict';

  /* ---------- Header scroll behaviour ---------- */
  const header = document.getElementById('header');

  function onScroll() {
    if (window.scrollY > 60) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load

  /* ---------- Mobile hamburger ---------- */
  const hamburger = document.getElementById('hamburger');
  const nav       = document.getElementById('nav');

  hamburger.addEventListener('click', function () {
    const isOpen = nav.classList.toggle('is-open');
    hamburger.classList.toggle('is-open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close nav when a link is clicked
  nav.querySelectorAll('.nav__link').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('is-open');
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* ---------- Active nav link on scroll ---------- */
  const sections = document.querySelectorAll('section[id]');

  function updateActiveLink() {
    const scrollY = window.scrollY + 100;
    sections.forEach(function (section) {
      const sectionTop    = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const id            = section.getAttribute('id');
      const link          = document.querySelector('.nav__link[href="#' + id + '"]');
      if (!link) return;

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });

  /* ---------- Counter animation ---------- */
  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const step     = 16;
    const steps    = duration / step;
    const increment = target / steps;
    let current    = 0;

    const timer = setInterval(function () {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.round(current);
    }, step);
  }

  // Trigger counters when hero is in view
  const counters = document.querySelectorAll('.stat__number');
  let countersStarted = false;

  const heroObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !countersStarted) {
        countersStarted = true;
        counters.forEach(animateCounter);
      }
    });
  }, { threshold: 0.4 });

  const heroStats = document.querySelector('.hero__stats');
  if (heroStats) heroObserver.observe(heroStats);

  /* ---------- Scroll-reveal ---------- */
  const revealEls = document.querySelectorAll(
    '.service-card, .process__step, .portfolio__item, .about__content, .about__visual, .contact__info, .contact__form, .section__header'
  );

  revealEls.forEach(function (el) { el.classList.add('reveal'); });

  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(function (el) { revealObserver.observe(el); });

  /* ---------- Portfolio filter ---------- */
  const filterBtns = document.querySelectorAll('.portfolio__filter');
  const portfolioItems = document.querySelectorAll('.portfolio__item');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const filter = btn.dataset.filter;

      // Update active button
      filterBtns.forEach(function (b) { b.classList.remove('portfolio__filter--active'); });
      btn.classList.add('portfolio__filter--active');

      // Show / hide items
      portfolioItems.forEach(function (item) {
        if (filter === 'all' || item.dataset.category === filter) {
          item.classList.remove('is-hidden');
        } else {
          item.classList.add('is-hidden');
        }
      });
    });
  });

  /* ---------- Testimonials carousel ---------- */
  const track      = document.getElementById('testimonialTrack');
  const testimonials = track ? Array.from(track.querySelectorAll('.testimonial')) : [];
  const dotsContainer = document.getElementById('testimonialDots');
  const prevBtn    = document.getElementById('prevBtn');
  const nextBtn    = document.getElementById('nextBtn');
  let currentSlide = 0;
  let autoplayTimer;

  function buildDots() {
    testimonials.forEach(function (_, i) {
      const dot = document.createElement('button');
      dot.className = 'testimonials__dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-selected', String(i === 0));
      dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); });
      dotsContainer.appendChild(dot);
    });
  }

  function goTo(index) {
    testimonials[currentSlide].classList.remove('is-active');
    dotsContainer.children[currentSlide].classList.remove('is-active');
    dotsContainer.children[currentSlide].setAttribute('aria-selected', 'false');

    currentSlide = (index + testimonials.length) % testimonials.length;

    testimonials[currentSlide].classList.add('is-active');
    dotsContainer.children[currentSlide].classList.add('is-active');
    dotsContainer.children[currentSlide].setAttribute('aria-selected', 'true');

    resetAutoplay();
  }

  function startAutoplay() {
    autoplayTimer = setInterval(function () { goTo(currentSlide + 1); }, 5000);
  }

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    startAutoplay();
  }

  if (testimonials.length) {
    buildDots();
    testimonials[0].classList.add('is-active');
    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(currentSlide - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(currentSlide + 1); });
    startAutoplay();

    // Pause autoplay on hover
    if (track) {
      track.addEventListener('mouseenter', function () { clearInterval(autoplayTimer); });
      track.addEventListener('mouseleave', startAutoplay);
    }
  }

  /* ---------- Contact form validation & submit ---------- */
  const form       = document.getElementById('contactForm');
  const submitBtn  = document.getElementById('submitBtn');
  const formSuccess = document.getElementById('formSuccess');

  function showError(inputId, errorId, msg) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    if (input)  input.classList.add('is-error');
    if (error)  error.textContent = msg;
  }

  function clearErrors() {
    form.querySelectorAll('.form__input').forEach(function (el) {
      el.classList.remove('is-error');
    });
    form.querySelectorAll('.form__error').forEach(function (el) {
      el.textContent = '';
    });
  }

  function validateForm() {
    let valid = true;

    const firstName = form.querySelector('#firstName');
    const lastName  = form.querySelector('#lastName');
    const email     = form.querySelector('#email');
    const service   = form.querySelector('#service');
    const message   = form.querySelector('#message');

    if (!firstName.value.trim()) {
      showError('firstName', 'firstNameError', 'First name is required.');
      valid = false;
    }

    if (!lastName.value.trim()) {
      showError('lastName', 'lastNameError', 'Last name is required.');
      valid = false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
      showError('email', 'emailError', 'Email address is required.');
      valid = false;
    } else if (!emailPattern.test(email.value.trim())) {
      showError('email', 'emailError', 'Please enter a valid email address.');
      valid = false;
    }

    if (!service.value) {
      showError('service', 'serviceError', 'Please select a service.');
      valid = false;
    }

    if (!message.value.trim()) {
      showError('message', 'messageError', 'Please describe your project.');
      valid = false;
    } else if (message.value.trim().length < 20) {
      showError('message', 'messageError', 'Please provide a bit more detail (at least 20 characters).');
      valid = false;
    }

    return valid;
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors();
      formSuccess.classList.remove('is-visible');

      if (!validateForm()) return;

      // Simulate async submission
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;

      setTimeout(function () {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
        form.reset();
        formSuccess.textContent = '✓ Thank you! We\'ll be in touch within one business day.';
        formSuccess.classList.add('is-visible');
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 1800);
    });

    // Live validation on blur
    form.querySelectorAll('.form__input').forEach(function (input) {
      input.addEventListener('blur', function () {
        if (input.classList.contains('is-error') && input.value.trim()) {
          input.classList.remove('is-error');
          const errorEl = document.getElementById(input.id + 'Error');
          if (errorEl) errorEl.textContent = '';
        }
      });
    });
  }

  /* ---------- Back to top ---------- */
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', function () {
    if (window.scrollY > 400) {
      backToTop.classList.add('is-visible');
    } else {
      backToTop.classList.remove('is-visible');
    }
  }, { passive: true });

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
