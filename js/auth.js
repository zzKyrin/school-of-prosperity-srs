
// =================================
// SCHOOL OF PROSPERITY SRS
// Login Authentication
// =================================

document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.querySelector(".login-card form");

    if (!loginForm) {
        return;
    }

    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const userID = document.getElementById("userID").value.trim();
        const password = document.getElementById("password").value;

        // Student Login
        if (userID === "100245" && password === "student123") {

            window.location.href = "student-dashboard.html";

        }

        // Staff Login
        else if (userID === "STAFF001" && password === "staff123") {

            window.location.href = "staff-dashboard.html";

        }

        // Incorrect Login
        else {

            alert("Incorrect ID or password. Please try again.");

        }

    });

});
