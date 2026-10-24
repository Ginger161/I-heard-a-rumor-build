// Two tiny helpers that must run before the app starts. They live in a file (not inline in index.html) so the page can forbid
// inline scripts entirely in its Content-Security-Policy.
// 1. Keep --app-h equal to the visible height, so the game fits a phone whose browser bars grow and shrink.
(function () {
  function s() {
    var h = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
    document.documentElement.style.setProperty('--app-h', Math.round(h) + 'px');
  }
  s();
  window.addEventListener('resize', s);
  window.addEventListener('orientationchange', s);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', s);
})();
// 2. No pinch-zoom of the page itself (the map has its own pinch-zoom).
['gesturestart', 'gesturechange', 'gestureend'].forEach(function (n) { document.addEventListener(n, function (e) { e.preventDefault(); }); });
document.addEventListener('touchmove', function (e) { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
