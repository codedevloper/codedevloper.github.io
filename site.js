// Theme switch, scroll reveals and number count-ups. No third-party code, nothing sent anywhere;
// the only thing stored is the visitor's light/dark choice, in their own browser.
(function () {
  "use strict";
  var KEY = "theme";
  var root = document.documentElement;
  root.classList.add("js");
  try {
    var saved = localStorage.getItem(KEY);
    if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);
  } catch (e) { /* storage unavailable: follow the system */ }

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function current() {
    var set = root.getAttribute("data-theme");
    if (set) return set;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function countUp(el) {
    var target = Number(el.getAttribute("data-count"));
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var start = null, duration = 1400;
    // Screen readers get the final value once; the changing digits are hidden from them.
    var spoken = document.createElement("span");
    spoken.className = "sr-only";
    spoken.textContent = el.textContent;
    el.setAttribute("aria-hidden", "true");
    el.parentNode.insertBefore(spoken, el.nextSibling);
    function frame(ts) {
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = prefix + Math.round(target * eased).toLocaleString("en-US") + suffix;
      if (t < 1) window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var button = document.getElementById("theme");
    if (button) {
      button.addEventListener("click", function () {
        var next = current() === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        try { localStorage.setItem(KEY, next); } catch (e) { /* ignore */ }
      });
    }
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("shown"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("shown");
        if (!reduced) entry.target.querySelectorAll("[data-count]").forEach(countUp);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  });
})();
