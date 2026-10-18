/* Client onboarding form (start.html), delivered to email by Web3Forms like the contact form */
(function () {
  var form = document.getElementById("onboardForm");
  if (!form) { return; }

  var EMAIL = "info@oneroadautomations.com";
  var statusEl = document.getElementById("formStatus");
  var doneEl = document.getElementById("formDone");
  var bodyEl = form.querySelector(".form-body");
  var submitBtn = form.querySelector('button[type="submit"]');
  var required = Array.prototype.slice.call(form.querySelectorAll("[required]"));

  var setStatus = function (text, kind) {
    statusEl.textContent = text;
    statusEl.className = "form-status" + (kind ? " " + kind : "");
  };

  // Each required field gets its own message right under it (text from data-err)
  required.forEach(function (el, i) {
    var err = document.createElement("small");
    err.className = "field-error";
    err.id = "err-" + i;
    err.hidden = true;
    err.textContent = el.getAttribute("data-err") || "Please fill this in.";
    el.parentNode.appendChild(err);
    el._err = err;
  });

  var markFields = function () {
    var bad = [];
    required.forEach(function (el) {
      var invalid = !el.checkValidity();
      el._err.hidden = !invalid;
      el.setAttribute("aria-invalid", invalid ? "true" : "false");
      if (invalid) { el.setAttribute("aria-describedby", el._err.id); bad.push(el); }
      else { el.removeAttribute("aria-describedby"); }
    });
    return bad;
  };

  form.addEventListener("input", function () {
    if (form.classList.contains("was-validated")) {
      if (!markFields().length && statusEl.classList.contains("error")) { setStatus("", ""); }
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

    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    data.subject = "New client onboarding: " + (data.business || data.name);

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
        window.scrollTo({ top: form.offsetTop - 100, behavior: "smooth" });
      })
      .catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send my details";
        setStatus("Sorry, that didn't send. Please try again, or email " + EMAIL + ".", "error");
      });
  });
})();
