/* ==========================================================================
   COOKIE BANNER  -  honest version: nothing is loaded before consent.
   The banner itself only stores one value in localStorage (technically
   necessary for the notice), no third-party cookie is written.
   ========================================================================== */

function cookieAccept(consent) {
  try { localStorage.setItem("td_cookie_consent", consent ? "accepted" : "necessary"); } catch (e) {}
  var box = document.getElementById("cookie");
  if (box) box.hidden = true;
  if (consent) loadOptionalTools();
}

/* Anything that talks to third parties goes in here and stays switched off
   until the visitor accepted. Empty by default -> nothing is transmitted. */
function loadOptionalTools() {
  /* example, only if you ever enable analytics:
  var s = document.createElement("script");
  s.src = "https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX";
  document.head.appendChild(s);
  */
}

(function () {
  var box = document.getElementById("cookie");
  if (!box) return;
  var stored = null;
  try { stored = localStorage.getItem("td_cookie_consent"); } catch (e) {}
  if (stored === "accepted") { loadOptionalTools(); box.hidden = true; return; }
  if (stored === "necessary") { box.hidden = true; return; }
  box.hidden = false;
})();
