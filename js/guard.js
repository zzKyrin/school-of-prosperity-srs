// Page access check (TC-009) and sign-out (session ends). Demo only: real enforcement happens on the server.
(function () {
    "use strict";
    var need = document.documentElement.getAttribute("data-role");
    if (!need) return;
    var role = null;
    try { role = sessionStorage.getItem("sop-role"); } catch (e) { }
    if (role !== need) { location.replace("index.html?denied=" + (role ? "1" : "2")); return; }
    document.addEventListener("click", function (e) {
        var a = e.target.closest('a[href="index.html"]');
        if (a) { try { sessionStorage.removeItem("sop-role"); } catch (x) { } }
    });
})();
