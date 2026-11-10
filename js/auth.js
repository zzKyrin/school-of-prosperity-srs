
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

document.addEventListener("DOMContentLoaded", function () {
    const gpaDisplay = document.getElementById("gpa-value");

    if (!gpaDisplay) return;

    const gradePoints = {
        A: 4.0,
        B: 3.0,
        C: 2.0,
        D: 1.0,
        F: 0.0
    };

    const rows = document.querySelectorAll(".records-table tbody tr");

    let totalPoints = 0;
    let totalCredits = 0;

    rows.forEach(function (row) {
        const credits = Number(row.cells[2].textContent);
        const grade = row.cells[3].textContent.trim();

        if (gradePoints[grade] !== undefined && credits > 0) {
            totalPoints += gradePoints[grade] * credits;
            totalCredits += credits;
        }
    });

    if (totalCredits > 0) {
        const gpa = totalPoints / totalCredits;
        gpaDisplay.textContent = gpa.toFixed(2);
    } else {
        gpaDisplay.textContent = "N/A";
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const rows = document.querySelectorAll(".records-table tbody tr");

    const creditsDisplay = document.getElementById("credits-completed");
    const progressFill = document.getElementById("progress-fill");
    const percentageDisplay = document.getElementById("progress-percentage");

    if (!creditsDisplay || !progressFill || !percentageDisplay) return;

    const totalDegreeCredits = 120;
    let completedCredits = 0;

    rows.forEach(function (row) {
        const credits = Number(row.cells[2].textContent);
        const status = row.cells[4].textContent.trim().toLowerCase();

        if (status === "completed" && credits > 0) {
            completedCredits += credits;
        }
    });

    const percentage = Math.min(
        (completedCredits / totalDegreeCredits) * 100,
        100
    );

    creditsDisplay.textContent =
        completedCredits + " / " + totalDegreeCredits;

    progressFill.style.width = percentage + "%";

    percentageDisplay.textContent =
        percentage.toFixed(0) + "% of your degree completed";
});

document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("student-search");
    const studentRecords = document.querySelectorAll(".student-record");

    if (!searchInput) return;

    searchInput.addEventListener("input", function () {
        const searchValue = searchInput.value.toLowerCase().trim();

        studentRecords.forEach(function (record) {
            const studentInfo = record.textContent.toLowerCase();

            if (studentInfo.includes(searchValue)) {
                record.style.display = "";
            } else {
                record.style.display = "none";
            }
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("student-search");
    const studentRecords = document.querySelectorAll(".student-record");
    const noResults = document.getElementById("no-results");

    if (!searchInput) return;

    function filterStudents() {
        const searchValue = searchInput.value.toLowerCase().trim();
        let visibleCount = 0;

        studentRecords.forEach(function (record) {
            const studentInfo = record.textContent.toLowerCase();

            if (studentInfo.includes(searchValue)) {
                record.style.display = "";
                visibleCount++;
            } else {
                record.style.display = "none";
            }
        });

        if (noResults) {
            noResults.style.display = visibleCount === 0 ? "block" : "none";
        }
    }

    searchInput.addEventListener("input", filterStudents);
});


document.addEventListener("DOMContentLoaded", function () {
    const viewButtons = document.querySelectorAll(".view-student");
    const detailsPanel = document.getElementById("student-details");
    const detailsContent = document.getElementById("student-details-content");
    const closeButton = document.getElementById("close-details");

    if (!detailsPanel || !detailsContent || !closeButton) return;

    viewButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            const studentCard = button.closest(".student-record");

            if (!studentCard) {
                alert("Student record could not be found.");
                return;
            }

            const studentName = studentCard.querySelector("h3").textContent;
            const studentInfo = studentCard.querySelectorAll("p");

            detailsContent.innerHTML = `
                <h3>${studentName}</h3>
                ${Array.from(studentInfo).map(function (item) {
                    return `<p>${item.textContent}</p>`;
                }).join("")}
            `;

            detailsPanel.style.display = "block";
            detailsPanel.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });

    closeButton.addEventListener("click", function () {
        detailsPanel.style.display = "none";
    });
});



document.addEventListener("DOMContentLoaded", function () {
    const editButton = document.getElementById("edit-student");
    const editForm = document.getElementById("edit-student-form");
    const detailsContent = document.getElementById("student-details-content");

    if (!editButton || !editForm || !detailsContent) return;

    editButton.addEventListener("click", function () {
        const studentName = detailsContent.querySelector("h3");
        const studentInfo = detailsContent.querySelectorAll("p");

        if (!studentName || studentInfo.length < 4) {
            alert("Student information could not be loaded.");
            return;
        }

        document.getElementById("edit-name").value = studentName.textContent.trim();
        document.getElementById("edit-id").value = studentInfo[0].textContent.replace("Student ID: ", "").trim();
        document.getElementById("edit-program").value = studentInfo[1].textContent.replace("Program: ", "").trim();
        document.getElementById("edit-gpa").value = studentInfo[2].textContent.replace("GPA: ", "").trim();
        document.getElementById("edit-status").value = studentInfo[3].textContent.replace("Status: ", "").trim();

        editForm.style.display = "block";
    });
});
