// Disable right-click
document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
  alert('Right-click is disabled to protect content.');
  return false;
});

// Block right-click via mousedown
document.addEventListener('mousedown', function(e) {
  if (e.button === 2) {
    e.preventDefault();
    return false;
  }
});

// Block shortcuts (Ctrl+U, Ctrl+Shift+I, Ctrl+Shift+J, F12)
document.addEventListener('keydown', function(e) {
  if (
    (e.ctrlKey && e.key === 'u') ||
    (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'j')) ||
    e.key === 'F12'
  ) {
    e.preventDefault();
    alert('Access to source code or developer tools is restricted.');
    return false;
  }
});

// Detect developer tools (basic detection, not foolproof)
(function detectDevTools() {
  let devtoolsOpen = false;
  const threshold = 160;
  const checkDevTools = function() {
    if (
      window.outerWidth - window.innerWidth > threshold ||
      window.outerHeight - window.innerHeight > threshold
    ) {
      if (!devtoolsOpen) {
        devtoolsOpen = true;
        alert('Developer tools detected. This is a restricted action.');
      }
    } else {
      devtoolsOpen = false;
    }
  };
  window.addEventListener('resize', checkDevTools);
  checkDevTools();
})();