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
          var how = reduceMotion ? "auto" : "smooth";
          // Expanded on a phone the sample doesn't scroll itself, so bring the page to the form instead
          if (screen.scrollHeight > screen.clientHeight + 4) {
            screen.scrollTo({ top: form.offsetTop - 64, behavior: how });
          } else {
            form.scrollIntoView({ block: "center", behavior: how });
          }
        }
      }
      showToast(messages[kind] || "");
    });
  }

  /* Phones: the sample is shown in a window; this reveals all of it */
  var expandBtn = document.getElementById("sampleExpand");
  var phone = document.querySelector(".phone");
  if (expandBtn && phone) {
    expandBtn.addEventListener("click", function () {
      var open = phone.classList.toggle("expanded");
      expandBtn.setAttribute("aria-expanded", open ? "true" : "false");
      expandBtn.textContent = open ? "Collapse the sample site" : "Show the whole sample site";
      if (!open) { phone.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" }); }
    });
  }

  /* Phones: the sticky bar appears only once the hero's own buttons are scrolled away,
     and steps aside while the contact form is on screen */
  var bar = document.querySelector(".mobile-bar");
  var heroActions = document.querySelector(".hero .actions");
  var contactSection = document.getElementById("contact");
  if (bar && heroActions && contactSection) {
    document.documentElement.classList.add("bar-managed");
    var updateBar = function () {
      var vh = window.innerHeight;
      var pastHero = heroActions.getBoundingClientRect().bottom < 0;
      var c = contactSection.getBoundingClientRect();
      var atContact = c.top < vh * 0.85 && c.bottom > 0;
      bar.classList.toggle("show", pastHero && !atContact);
    };
    window.addEventListener("scroll", updateBar, { passive: true });
    window.addEventListener("resize", updateBar);
    updateBar();
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

  // "Get started" / "Ask about it" buttons pre-select what the visitor clicked, and the field
  // briefly glows so the change is visible when the page lands on the form
  var pickTimer;
  document.querySelectorAll("[data-package]").forEach(function (link) {
    link.addEventListener("click", function () {
      if (!interest) { return; }
      interest.value = link.getAttribute("data-package");
      interest.classList.remove("just-picked");
      void interest.offsetWidth; // restart the glow
      interest.classList.add("just-picked");
      clearTimeout(pickTimer);
      pickTimer = setTimeout(function () { interest.classList.remove("just-picked"); }, 1700);
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

    // Each required field explains its own problem, right under it
    var checks = [["name", "err-name"], ["email", "err-email"], ["message", "err-message"]];
    var markFields = function () {
      var bad = [];
      checks.forEach(function (pair) {
        var el = form.elements[pair[0]];
        var err = document.getElementById(pair[1]);
        if (!el || !err) { return; }
        var invalid = !el.checkValidity();
        err.hidden = !invalid;
        el.setAttribute("aria-invalid", invalid ? "true" : "false");
        if (invalid) { el.setAttribute("aria-describedby", pair[1]); bad.push(el); }
        else { el.removeAttribute("aria-describedby"); }
      });
      return bad;
    };
    form.addEventListener("input", function () {
      if (form.classList.contains("was-validated")) {
        var left = markFields().length;
        if (!left && statusEl.classList.contains("error")) { setStatus("", ""); }
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        var bad = markFields();
        setStatus(bad.length === 1 ? "Please fix the highlighted field." : "Please fix the " + bad.length + " highlighted fields.", "error");
        if (bad[0]) { bad[0].focus(); }
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
