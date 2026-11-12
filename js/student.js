// Student Main Menu, My Grades (FR-3), My Information
document.addEventListener("DOMContentLoaded", function () {
    var S = window.SRS, me = S.me, s = S.student(me);
    function $(i) { return document.getElementById(i); }
    function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

    var rows = S.history(me).map(function (h) { return { term: h.term, title: h.title, code: h.code, credits: h.credits, grade: h.grade, status: "Completed" }; });
    S.mine(me).forEach(function (e) {
        var c = S.cls(e.code);
        rows.push({ term: S.term, title: c.title, code: c.code, credits: c.credits, grade: e.grade || "-", status: e.grade ? "Completed" : "In progress" });
    });
    $("grade-rows").innerHTML = rows.map(function (r) {
        return "<tr><td>" + r.term + "</td><td>" + esc(r.title) + "</td><td>" + esc(r.code) + "</td><td>" + r.credits + "</td><td><strong>" + r.grade + "</strong></td><td>" + r.status + "</td></tr>";
    }).join("");

    var g = S.gpa(me), total = 120, pct = Math.min(100, g.credits / total * 100);
    $("gpa-value").textContent = g.gpa.toFixed(2);
    $("gpa-note").textContent = g.gpa >= 3.5 ? "Honors standing" : g.gpa >= 2 ? "Good academic standing" : "Academic probation";
    $("credits-completed").textContent = g.credits + " / " + total;
    $("progress-percentage").textContent = pct.toFixed(0) + "% of your degree completed";
    setTimeout(function () { $("progress-fill").style.width = pct + "%"; }, 50);
    $("done-count").textContent = rows.filter(function (r) { return r.status === "Completed"; }).length + " courses with final grades";

    var n = S.mine(me).length;
    $("reg-count").textContent = n ? n + " class" + (n > 1 ? "es" : "") + " registered for " + S.term + "." : "Registration is open for " + S.term + ".";

    $("student-info").innerHTML = "<h3>Student Information</h3>" + [
        ["Student ID", s.id], ["Name", s.name], ["Program", s.program], ["Status", s.status], ["Email", "jordan.williams@example.com"],
        ["Academic Level", s.level], ["Enrollment", "Fall 2025"], ["Expected Graduation", "Spring 2029"]
    ].map(function (r) { return "<p><strong>" + r[0] + ":</strong> " + esc(r[1]) + "</p>"; }).join("");
});
