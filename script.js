/* One Road Automations — mobile nav, footer year, sample-build demo, receptionist playback.
   Vanilla JS, no dependencies. Everything on the page is readable without it. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile nav ---------- */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav");

  function setMenu(open) {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) { setMenu(false); toggle.focus(); }
    });
  }

  var year = document.getElementById("year");
  if (year) { year.textContent = new Date().getFullYear(); }

  /* ---------- Sample build: buttons explain what they do on a real site ---------- */
  var screen = document.getElementById("sampleScreen");
  var toast = document.getElementById("sampleToast");
  var toastTimer;
  var messages = {
    call: "On your site, this button calls your phone in one tap.",
    quote: "On your site, this jumps to your quote form.",
    send: "On your site, quote requests land in your email instantly."
  };

  function showToast(text) {
    if (!toast) { return; }
    toast.querySelector("span").textContent = text;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2800);
  }

  if (screen) {
    screen.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-demo]");
      if (!btn) { return; }
      var kind = btn.getAttribute("data-demo");
      if (kind === "quote") {
        var form = document.getElementById("sampleQuote");
        if (form) {
          screen.scrollTo({ top: form.offsetTop - 64, behavior: reduceMotion ? "auto" : "smooth" });
        }
      }
      showToast(messages[kind] || "");
    });
  }

  /* ---------- AI receptionist: play the sample conversation once ---------- */
  var chat = document.getElementById("chatDemo");
  if (chat && !reduceMotion) {
    var steps = Array.prototype.slice.call(chat.querySelectorAll(".beat"));
    var typing = chat.querySelector(".typing");
    var startsBelowFold = chat.getBoundingClientRect().top > window.innerHeight;

    // Only hide-then-play when the visitor hasn't seen it yet; otherwise leave it as is.
    if (startsBelowFold && steps.length) {
      chat.classList.add("armed");

      var play = function () {
        var t = 250;
        steps.forEach(function (step) {
          var isReply = step.classList.contains("out");
          if (isReply && typing) {
            // Show the typing dots just before each receptionist reply
            setTimeout(function () {
              step.parentNode.insertBefore(typing, step);
              typing.classList.add("on");
            }, t);
            t += 900;
            setTimeout(function () { typing.classList.remove("on"); step.classList.add("on"); }, t);
          } else {
            setTimeout(function () { step.classList.add("on"); }, t);
          }
          t += isReply ? 700 : 850;
        });
      };

      // Plain scroll check (no observer dependency): start once the card is well into view.
      var started = false;
      var check = function () {
        if (started) { return; }
        var r = chat.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.7 && r.bottom > 0) {
          started = true;
          window.removeEventListener("scroll", check);
          window.removeEventListener("resize", check);
          play();
        }
      };
      window.addEventListener("scroll", check, { passive: true });
      window.addEventListener("resize", check);
      check();
    }
  }

  /* ---------- Contact form (delivered to email by Web3Forms) ---------- */
  var form = document.getElementById("leadForm");
  var interest = document.getElementById("interest");

  // "Get started" / "Ask about it" buttons pre-select what the visitor clicked
  document.querySelectorAll("[data-package]").forEach(function (link) {
    link.addEventListener("click", function () {
      if (interest) { interest.value = link.getAttribute("data-package"); }
    });
  });

  if (form) {
    var EMAIL = "info@oneroadautomations.com";
    var statusEl = document.getElementById("formStatus");
    var doneEl = document.getElementById("formDone");
    var bodyEl = form.querySelector(".form-body");
    var submitBtn = form.querySelector('button[type="submit"]');

    var setStatus = function (text, kind) {
      statusEl.textContent = text;
      statusEl.className = "form-status" + (kind ? " " + kind : "");
    };
    var val = function (name) {
      var el = form.elements[name];
      return el ? String(el.value || "").trim() : "";
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        setStatus("Please fill in your name, a valid email, and a short note about your business.", "error");
        var firstBad = form.querySelector(".field :invalid");
        if (firstBad) { firstBad.focus(); }
        return;
      }
      if (form.elements.botcheck && form.elements.botcheck.checked) { return; } // spam bot

      // Until the Web3Forms key is added, hand the answers to the visitor's email app instead.
      if (!val("access_key")) {
        var lines = ["Name: " + val("name"), "Business: " + val("business"), "Email: " + val("email"),
                     "Phone: " + val("phone"), "Interested in: " + val("interest"), "", val("message")];
        window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Website inquiry: " + val("interest")) +
                               "&body=" + encodeURIComponent(lines.join("\n"));
        setStatus("Your email app should open with your message ready to send.", "ok");
        return;
      }

      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
      setStatus("", "");

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data)
      })
        .then(function (r) { return r.json().then(function (j) { return r.ok && j.success; }); })
        .then(function (ok) {
          if (!ok) { throw new Error("send failed"); }
          bodyEl.hidden = true;
          doneEl.hidden = false;
          doneEl.setAttribute("tabindex", "-1");
          doneEl.focus();
        })
        .catch(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Send message";
          setStatus("Sorry, your message didn't send. Please try again, or email " + EMAIL + ".", "error");
        });
    });
  }
})();
