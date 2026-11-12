// Tab navigation (hash based) + toast helper
(function () {
    "use strict";
    window.toast = function (msg) {
        var t = document.getElementById("toast");
        if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; document.body.appendChild(t); }
        t.textContent = msg; t.classList.add("show");
        clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove("show"); }, 2600);
    };
    window.confirmBox = function (title, text, okLabel, onOk) {
        var back = document.createElement("div");
        back.className = "modal-back";
        back.innerHTML = '<div class="modal" role="dialog" aria-modal="true"><h3></h3><p></p><button type="button" class="btn danger" data-ok></button><button type="button" class="btn ghost" data-cancel>Cancel</button></div>';
        back.querySelector("h3").textContent = title;
        back.querySelector("p").textContent = text;
        back.querySelector("[data-ok]").textContent = okLabel;
        function close() { back.remove(); document.removeEventListener("keydown", esc); }
        function esc(e) { if (e.key === "Escape") close(); }
        back.addEventListener("click", function (e) {
            if (e.target === back || e.target.hasAttribute("data-cancel")) close();
            else if (e.target.hasAttribute("data-ok")) { close(); onOk(); }
        });
        document.addEventListener("keydown", esc);
        document.body.appendChild(back);
        back.querySelector("[data-cancel]").focus();
    };
    document.addEventListener("click", function (e) {
        var b = e.target.closest("[data-toast]");
        if (b) window.toast(b.getAttribute("data-toast"));
    });
    var views = Array.prototype.slice.call(document.querySelectorAll(".view"));
    if (!views.length) return;
    var links = document.querySelectorAll('.dashboard-nav a[href^="#"]');
    function show() {
        var id = location.hash.slice(1);
        if (!views.some(function (v) { return v.id === id; })) id = views[0].id;
        views.forEach(function (v) { v.hidden = v.id !== id; });
        links.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + id); });
        window.scrollTo(0, 0);
    }
    window.addEventListener("hashchange", show);
    show();
})();
