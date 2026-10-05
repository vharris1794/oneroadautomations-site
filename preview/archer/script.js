/* Archer Plumbing & Heating — menu, photo viewer, service-request form. No dependencies. */
(function () {
  "use strict";

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav");
  function setMenu(open) {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
    nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) { setMenu(false); toggle.focus(); }
    });
  }

  var year = document.getElementById("year");
  if (year) { year.textContent = new Date().getFullYear(); }

  /* ---------- Photo viewer ---------- */
  var box = document.getElementById("lightbox");
  if (box && typeof box.showModal === "function") {
    var boxImg = box.querySelector("img");
    var boxCap = box.querySelector("p");
    document.querySelectorAll("[data-full]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        boxImg.src = btn.getAttribute("data-full");
        boxImg.alt = btn.getAttribute("data-caption") || "";
        boxCap.textContent = btn.getAttribute("data-caption") || "";
        box.showModal();
      });
    });
    box.querySelector(".lightbox-close").addEventListener("click", function () { box.close(); });
    // Clicking the dimmed backdrop closes it
    box.addEventListener("click", function (e) { if (e.target === box) { box.close(); } });
  }

  /* ---------- Service request (preview: nothing is sent) ---------- */
  var form = document.getElementById("serviceForm");
  if (form) {
    var note = document.getElementById("formNote");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        note.textContent = "Please add your name, phone, and email so we can reach you.";
        var bad = form.querySelector(":invalid");
        if (bad) { bad.focus(); }
        return;
      }
      note.textContent = "Preview only: nothing was sent. On the live site, this request goes straight to service@archerpandh.com.";
    });
  }
})();
