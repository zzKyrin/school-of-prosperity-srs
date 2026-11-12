// Login (TC-001, TC-002)
document.addEventListener("DOMContentLoaded", function () {
    var form = document.querySelector(".login-card form");
    if (!form) return;
    var err = document.getElementById("login-error");
    var reset = document.getElementById("reset-demo");
    if (reset) reset.addEventListener("click", function (e) {
        e.preventDefault();
        try {
            Object.keys(localStorage).forEach(function (k) { if (k.indexOf("sop3-") === 0) localStorage.removeItem(k); });
            sessionStorage.removeItem("sop-role");
        } catch (x) { }
        reset.textContent = "Demo data reset \u2713";
        if (err) err.hidden = true;
    });

    function show(text) { if (err) { err.textContent = text; err.hidden = false; } }

    if (location.search.indexOf("denied=1") > -1) show("Access denied. That page is not available for your account.");
    if (location.search.indexOf("denied=2") > -1) show("Please sign in to continue.");

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        var id = document.getElementById("userID").value.trim();
        var pw = document.getElementById("password").value;
        var role = null;
        if (id === "100245" && pw === "student123") role = "student";
        else if (id === "STAFF001" && pw === "staff123") role = "staff";

        if (!role) { show("Incorrect ID or password. Please try again."); return; }
        try { sessionStorage.setItem("sop-role", role); } catch (e) { }
        window.location.href = role === "student" ? "student-dashboard.html" : "staff-dashboard.html";
    });
});
