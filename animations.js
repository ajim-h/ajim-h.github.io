// animations.js — Smooth, cinematic animations for Ajim Hossain portfolio
document.addEventListener("DOMContentLoaded", () => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Show instantly if motion disabled
  if (prefersReduced) {
    document.querySelectorAll(".reveal, .section, .card, .bullet-list li, .site-footer, .section__header, .profile-photo, .hero__body")
      .forEach(el => el.classList.add("in-view"));
    return;
  }

  // Helper: staggered reveal for multiple children
  const applyStagger = (elements, baseDelay = 0.1, maxDelay = 0.6) => {
    elements.forEach((el, i) => {
      const delay = Math.min(baseDelay * (i + 1), maxDelay);
      el.style.transitionDelay = `${delay}s`;
      el.classList.add("in-view");
      el.style.opacity = "1";
      el.style.transform = "translateY(0) scale(1)";
    });
  };

  // Intersection observer setup
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.classList.add("in-view");
        el.style.opacity = "1";
        el.style.transform = "translateY(0) scale(1)";
        el.style.transition = "transform 0.7s cubic-bezier(0.19,1,0.22,1), opacity 0.6s ease-out";

        // Hero photo first, text after slight delay
        if (el.classList.contains("hero__media")) {
          const photo = el.querySelector(".profile-photo");
          const body = document.querySelector(".hero__body");

          if (photo) {
            photo.style.opacity = "0";
            photo.style.transform = "scale(0.9)";
            setTimeout(() => {
              photo.style.transition = "transform 0.9s cubic-bezier(0.22,1,0.36,1), opacity 0.7s ease-out";
              photo.style.opacity = "1";
              photo.style.transform = "scale(1)";
            }, 150);
          }

          if (body) {
            body.style.opacity = "0";
            body.style.transform = "translateY(30px)";
            setTimeout(() => {
              body.style.transition = "transform 0.9s cubic-bezier(0.19,1,0.22,1), opacity 0.8s ease-out";
              body.style.opacity = "1";
              body.style.transform = "translateY(0)";
            }, 400);
          }
        }

        // Cards fade + scale in with stagger
        if (el.classList.contains("cards")) {
          applyStagger(el.querySelectorAll(".card"));
        }

        // Bullet lists stagger in from left
        if (el.classList.contains("bullet-list")) {
          applyStagger(el.querySelectorAll("li"));
        }

        obs.unobserve(el);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: "0px 0px -10% 0px"
  });

  // Apply initial hidden state before observing
  document.querySelectorAll(".reveal, .section, .card, .bullet-list, .site-footer, .section__header, .hero__media")
    .forEach(el => {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px) scale(0.98)";
      observer.observe(el);
    });

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", e => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
});
