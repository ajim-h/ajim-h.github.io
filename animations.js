// animations.js
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        // Optional: Stop observing after the element is visible to improve performance
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 }); // Trigger when 10% of the element is visible

  // Target elements with animations that use .in-view
  document.querySelectorAll('.section__header, .card, .bullet-list li, .site-footer, .reveal, .profile-photo').forEach(el => {
    observer.observe(el);
  });
});
