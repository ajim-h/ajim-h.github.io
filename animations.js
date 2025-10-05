// animations.js — cinematic hero, sequential cards, and natural fade-out motion
document.addEventListener("DOMContentLoaded", () => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Accessibility: instant reveal if reduced motion is preferred
  if (prefersReduced) {
    document.querySelectorAll(".reveal, .section, .card, .bullet-list li, .site-footer, .section__header, .profile-photo, .hero__body")
      .forEach(el => el.classList.add("in-view"));
    return;
  }

  // Sequential card animation (in or out)
  const animateCardsSequentially = (cards, direction = "in", baseDelay = 150) => {
    cards.forEach((card, i) => {
      const delay = baseDelay * i;
      setTimeout(() => {
        if (direction === "in") {
          card.classList.add("in-view");
          card.style.opacity = "1";
          card.style.transform = "translateY(0) scale(1)";
        } else {
          card.classList.remove("in-view");
          card.style.opacity = "0";
          card.style.transform = "translateY(25px) scale(0.97)"; // slide slightly down for natural exit
        }
        card.style.transition = "transform 0.6s cubic-bezier(0.19,1,0.22,1), opacity 0.6s ease-out";
      }, delay);
    });
  };

  // Sequential bullet list animation
  const animateListSequentially = (items, direction = "in", baseDelay = 100) => {
    items.forEach((item, i) => {
      const delay = baseDelay * (i + 1);
      setTimeout(() => {
        if (direction === "in") {
          item.classList.add("in-view");
          item.style.opacity = "1";
          item.style.transform = "translateX(0)";
        } else {
          item.classList.remove("in-view");
          item.style.opacity = "0";
          item.style.transform = "translateX(-10px)";
        }
        item.style.transition = "transform 0.5s ease-out, opacity 0.5s ease-out";
      }, delay);
    });
  };

  // Intersection Observer for entry and exit animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;

      if (entry.isIntersecting) {
        // ✅ ENTERING VIEW
        el.classList.add("in-view");
        el.style.opacity = "1";
        el.style.transform = "translateY(0) scale(1)";
        el.style.transition = "transform 0.7s cubic-bezier(0.19,1,0.22,1), opacity 0.6s ease-out";

        // 🎬 Hero animation
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

        // 🃏 Card-by-card animation
        if (el.classList.contains("cards")) {
          const cards = el.querySelectorAll(".card");
          animateCardsSequentially(cards, "in", 180);
        }

        // 📋 Bullet list animation
        if (el.classList.contains("bullet-list")) {
          const listItems = el.querySelectorAll("li");
          animateListSequentially(listItems, "in", 100);
        }

      } else {
        // 🚪 LEAVING VIEW — fade out naturally
        if (el.classList.contains("cards")) {
          const cards = el.querySelectorAll(".card");
          // reverse order for graceful exit
          animateCardsSequentially(Array.from(cards).reverse(), "out", 100);
        } else if (el.classList.contains("bullet-list")) {
          const listItems = el.querySelectorAll("li");
          animateListSequentially(Array.from(listItems).reverse(), "out", 80);
        } else if (el.classList.contains("section") || el.classList.contains("site-footer")) {
          el.classList.remove("in-view");
          el.style.opacity = "0";
          el.style.transform = "translateY(25px) scale(0.98)"; // fade + slide down exit
        }
      }
    });
  }, {
    threshold: 0.25,
    rootMargin: "0px 0px -10% 0px"
  });

  // Initialize elements before observation
  document.querySelectorAll(".reveal, .section, .cards, .card, .bullet-list, .site-footer, .section__header, .hero__media")
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
