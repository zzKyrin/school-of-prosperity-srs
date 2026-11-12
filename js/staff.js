// Staff windows: Student Records (UC-01), Course Records (UC-02), Class Records (UC-03), Manage Grades (FR-3)
(function () {
    "use strict";
    var S = window.SRS;
    var $ = function (i) { return document.getElementById(i); };
    var esc = function (t) { return String(t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
    var pill = function (t, c) { return '<span class="pill ' + c + '">' + esc(t) + "</span>"; };
    var COLORS = ["#245ca6", "#2d7a5a", "#b5651d", "#7a4fa3", "#b94a4a", "#1f7a8c"];
    var STATUS = { Active: "green", Inactive: "gray", Graduated: "gold" };
    var GRADES = ["", "A", "B", "C", "D", "F"];
    var sort = { key: "name", dir: 1 }, filter = "All", query = "";
    var D = { mode: null, id: null, editing: false, error: "" };

    function gpaOf(id) { var g = S.gpa(id); return g.credits ? g.gpa : null; }
    function fmtGpa(v) { return v === null ? "N/A" : v.toFixed(2); }
    function avatar(s) { return '<span class="avatar" style="background:' + COLORS[Number(s.id.slice(-1)) % COLORS.length] + '">' + esc(s.name.split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase()) + "</span>"; }
    function standing(g) { return g === null ? ["New", "gray"] : g >= 3.5 ? ["Honors", "green"] : g >= 2 ? ["Good standing", "blue"] : ["Probation", "red"]; }
    function opts(list, sel) { return list.map(function (o) { return "<option" + (o === sel ? " selected" : "") + ">" + esc(o) + "</option>"; }).join(""); }
    function who(s) { return '<div class="who">' + avatar(s) + "<div>" + esc(s.name) + "<small>" + s.id + "</small></div></div>"; }

    // ---------- Main Menu ----------
    function renderHome() {
        var st = S.students, active = st.filter(function (s) { return s.status === "Active"; }).length;
        var gp = st.map(function (s) { return gpaOf(s.id); }).filter(function (g) { return g !== null; });
        var avg = gp.length ? gp.reduce(function (a, b) { return a + b; }, 0) / gp.length : 0;
        var cap = S.classes.reduce(function (a, c) { return a + c.cap; }, 0);
        $("tiles").innerHTML = [["Total students", st.length], ["Active students", active], ["Average GPA", avg.toFixed(2)], ["Seats filled", Math.round(S.enroll.length / cap * 100) + "%"]]
            .map(function (t) { return '<div class="tile"><small>' + t[0] + "</small><b>" + t[1] + "</b></div>"; }).join("");
        $("program-bars").innerHTML = S.programs.map(function (p) {
            var n = st.filter(function (s) { return s.program === p; }).length;
            return '<div class="bar-row"><div><span>' + p + "</span><strong>" + n + '</strong></div><div class="bar"><i style="width:' + (n / st.length * 100) + '%"></i></div></div>';
        }).join("");
        var items = st.filter(function (s) { var g = gpaOf(s.id); return s.status === "Active" && g !== null && g < 2.5; }).map(function (s) {
            return '<li class="click" data-open="' + s.id + '"><span>' + esc(s.name) + '<br><span class="muted">GPA ' + fmtGpa(gpaOf(s.id)) + " - review standing</span></span>" + pill("Review", "red") + "</li>";
        });
        S.classes.filter(function (c) { return S.left(c.code) <= 0; }).forEach(function (c) {
            items.push('<li class="click" data-roster="' + c.code + '"><span>' + c.code + ' is full<br><span class="muted">Open the roster or raise capacity</span></span>' + pill("Full", "gold") + "</li>");
        });
        $("attention").innerHTML = items.join("") || "<li>Everyone is on track.</li>";
        $("activity").innerHTML = S.activity.length ? S.activity.map(function (a) { return "<li><span>" + esc(a.msg) + '</span><span class="muted">' + a.t + "</span></li>"; }).join("")
            : '<li><span class="muted">No changes yet. Edit a student, change a roster, or post grades and it will show up here.</span></li>';
    }

    // ---------- Student Records ----------
    function renderStudents() {
        var q = query.toLowerCase();
        var rows = S.students.filter(function (s) { return (filter === "All" || s.status === filter) && (s.name + " " + s.id + " " + s.program).toLowerCase().indexOf(q) > -1; })
            .map(function (s) { return { s: s, g: gpaOf(s.id) }; });
        rows.sort(function (a, b) {
            var x = sort.key === "gpa" ? (a.g === null ? -1 : a.g) : a.s[sort.key], y = sort.key === "gpa" ? (b.g === null ? -1 : b.g) : b.s[sort.key];
            return (x < y ? -1 : x > y ? 1 : 0) * sort.dir;
        });
        $("student-rows").innerHTML = rows.map(function (r) {
            var st = standing(r.g);
            return '<tr class="row-click" data-open="' + r.s.id + '"><td>' + who(r.s) + "</td><td>" + esc(r.s.program) + "</td><td>" + esc(r.s.level) + "</td><td><strong>" + fmtGpa(r.g) + "</strong> " + pill(st[0], st[1]) + "</td><td>" + pill(r.s.status, STATUS[r.s.status]) + "</td></tr>";
        }).join("");
        $("no-results").hidden = rows.length > 0;
        Array.prototype.forEach.call(document.querySelectorAll(".sortable"), function (th) {
            th.classList.toggle("asc", th.dataset.sort === sort.key && sort.dir === 1); th.classList.toggle("desc", th.dataset.sort === sort.key && sort.dir === -1);
        });
    }

    // ---------- Course Records ----------
    function renderCourses() {
        $("course-rows").innerHTML = S.classes.map(function (c) {
            return '<tr class="row-click" data-course="' + c.code + '"><td><strong>' + c.code + '</strong><span class="course-title">' + esc(c.title) + "</span></td><td>" + c.credits + "</td><td>" + (esc(c.prereq) || "None") + "</td></tr>";
        }).join("");
    }

    // ---------- Class Records ----------
    function renderClasses() {
        $("class-rows").innerHTML = S.classes.map(function (c) {
            var n = S.roster(c.code).length, left = c.cap - n;
            return "<tr><td><strong>" + c.code + '</strong><span class="course-title">' + esc(c.title) + "</span></td><td>" + S.meets(c) + "</td><td>" + pill(c.modality, c.modality === "Online" ? "blue" : "gray") + "</td><td>" + esc(c.instructor) +
                '</td><td><div class="bar"><i style="width:' + Math.min(100, n / c.cap * 100) + '%"></i></div><span class="muted">' + n + " / " + c.cap + " " + (left <= 0 ? pill("Full", "red") : "") + '</span></td><td class="nowrap"><button type="button" class="cap-btn" data-cap="' + c.code +
                '" data-d="-1" aria-label="Decrease capacity">&minus;</button> <button type="button" class="cap-btn" data-cap="' + c.code + '" data-d="1" aria-label="Increase capacity">+</button> <button type="button" class="chip" data-roster="' + c.code + '">Roster</button></td></tr>';
        }).join("");
    }

    // ---------- Manage Grades ----------
    function renderGrades() {
        var sel = $("grade-class"), cur = sel.value || S.classes[0].code;
        sel.innerHTML = S.classes.map(function (c) { return '<option value="' + c.code + '"' + (c.code === cur ? " selected" : "") + ">" + c.code + " - " + esc(c.title) + " (" + S.roster(c.code).length + " students)</option>"; }).join("");
        var r = S.roster(cur);
        $("grade-rows").innerHTML = r.length ? r.map(function (e) {
            var s = S.student(e.sid);
            return "<tr><td>" + who(s) + '</td><td><select class="grade-sel" data-sid="' + s.id + '">' + GRADES.map(function (g) { return '<option value="' + g + '"' + ((e.grade || "") === g ? " selected" : "") + ">" + (g || "-") + "</option>"; }).join("") + "</select></td></tr>";
        }).join("") : '<tr><td colspan="2">No students are enrolled in this class yet.</td></tr>';
        $("grade-summary").textContent = r.filter(function (e) { return e.grade; }).length + " of " + r.length + " graded";
    }
    function saveGrades() {
        var code = $("grade-class").value, n = 0;
        Array.prototype.forEach.call(document.querySelectorAll(".grade-sel"), function (sel) { S.setGrade(sel.dataset.sid, code, sel.value); if (sel.value) n++; });
        S.log("Posted grades for " + code + " (" + n + " entered)"); refresh(); window.toast("Grades saved for " + code);
    }

    // ---------- Drawer (student / course / roster) ----------
    function renderDrawer() {
        var h = '<button type="button" class="btn ghost" data-act="close">Close</button>';
        if (D.mode === "student") h += studentDrawer(); else if (D.mode === "course") h += courseDrawer(); else h += rosterDrawer();
        $("drawer").innerHTML = h;
    }
    function err() { return '<p class="form-error">' + esc(D.error) + "</p>"; }
    function studentDrawer() {
        var s = D.id === null ? { id: "(new)", name: "", program: S.programs[0], level: "Undergraduate", status: "Active" } : S.student(D.id), h;
        if (D.editing || D.id === null) {
            return "<h2>" + (D.id === null ? "Add student" : "Edit record") + '</h2><label>Name</label><input id="f-name" value="' + esc(s.name) + '"><label>Program</label><select id="f-program">' + opts(S.programs, s.program) +
                '</select><label>Level</label><select id="f-level">' + opts(["Undergraduate", "Graduate"], s.level) + '</select><label>Status</label><select id="f-status">' + opts(["Active", "Inactive", "Graduated"], s.status) + "</select>" + err() +
                '<button type="button" class="btn" data-act="save-student">Save changes</button><button type="button" class="btn ghost" data-act="cancel">Cancel</button>';
        }
        var g = gpaOf(s.id), st = standing(g);
        h = '<div style="margin-top:22px">' + avatar(s) + "</div><h2>" + esc(s.name) + '</h2><p class="muted">Student ID ' + s.id + "</p><p>" + pill(s.status, STATUS[s.status]) + " " + pill(st[0], st[1]) + "</p><dl><dt>Program</dt><dd>" + esc(s.program) +
            "</dd><dt>Level</dt><dd>" + esc(s.level) + "</dd><dt>GPA</dt><dd>" + fmtGpa(g) + "</dd><dt>Status</dt><dd>" + s.status + "</dd></dl><h3>" + S.term + " classes</h3><ul class=\"list\">";
        var cl = S.mine(s.id);
        h += cl.length ? cl.map(function (e) { return "<li><span>" + e.code + " " + esc(S.cls(e.code).title) + "</span>" + pill(e.grade || "In progress", e.grade ? "green" : "gray") + "</li>"; }).join("") : '<li><span class="muted">Not registered for any classes.</span></li>';
        return h + '</ul><button type="button" class="btn" data-act="edit">Edit record</button>';
    }
    function courseDrawer() {
        var c = S.cls(D.id);
        if (!D.editing) return "<h2>" + c.code + '</h2><p class="muted">' + esc(c.title) + "</p><dl><dt>Credits</dt><dd>" + c.credits + "</dd><dt>Prerequisite</dt><dd>" + (esc(c.prereq) || "None") + '</dd></dl><button type="button" class="btn" data-act="edit">Edit course</button>';
        var codes = [""].concat(S.classes.map(function (x) { return x.code; }).filter(function (x) { return x !== c.code; }));
        return "<h2>Edit " + c.code + '</h2><label>Title</label><input id="c-title" value="' + esc(c.title) + '"><label>Credits (1 - 6)</label><input id="c-credits" type="number" min="1" max="6" value="' + c.credits +
            '"><label>Prerequisite</label><select id="c-prereq">' + codes.map(function (x) { return "<option" + (x === c.prereq ? " selected" : "") + ' value="' + x + '">' + (x || "None") + "</option>"; }).join("") + "</select>" + err() +
            '<button type="button" class="btn" data-act="save-course">Save changes</button><button type="button" class="btn ghost" data-act="cancel">Cancel</button>';
    }
    function rosterDrawer() {
        var c = S.cls(D.id), r = S.roster(c.code), inClass = r.map(function (e) { return e.sid; });
        var avail = S.students.filter(function (s) { return s.status === "Active" && inClass.indexOf(s.id) === -1; });
        return "<h2>" + c.code + ' roster</h2><p class="muted">' + esc(c.title) + " &middot; " + r.length + " / " + c.cap + ' seats</p><ul class="list">' +
            (r.length ? r.map(function (e) { var s = S.student(e.sid); return "<li>" + who(s) + '<button type="button" class="btn ghost" data-drop="' + s.id + '">Drop</button></li>'; }).join("") : '<li><span class="muted">No students enrolled.</span></li>') +
            '</ul><h3>Add a student</h3><select id="r-student">' + avail.map(function (s) { return '<option value="' + s.id + '"' + (s.id === D.pick ? " selected" : "") + ">" + esc(s.name) + " (" + s.id + ")</option>"; }).join("") + '</select><label class="check-row"><input type="checkbox" id="r-override"> Override: allow even if the class is full, a prerequisite is missing, or times conflict</label>' +
            err() + '<button type="button" class="btn" data-act="add-student"' + (avail.length ? "" : " disabled") + ">Add to class</button>";
    }
    function openDrawer(mode, id, editing) { D = { mode: mode, id: id, editing: !!editing, error: "" }; renderDrawer(); $("drawer").classList.add("open"); $("overlay").classList.add("open"); }
    function closeDrawer() { $("drawer").classList.remove("open"); $("overlay").classList.remove("open"); }

    function saveStudent() {
        var name = $("f-name").value.trim();
        if (!name) { D.error = "Name is required."; return renderDrawer(); }
        var f = { name: name, program: $("f-program").value, level: $("f-level").value, status: $("f-status").value };
        if (D.id === null) {
            var nid = String(Math.max.apply(null, S.students.map(function (s) { return Number(s.id); })) + 1);
            S.students.push(Object.assign({ id: nid, priorGpa: 0, priorCredits: 0 }, f)); D.id = nid; S.log("Added student " + name + " (" + nid + ")");
        } else { Object.assign(S.student(D.id), f); S.log("Updated record for " + name); }
        D.editing = false; D.error = ""; refresh(); renderDrawer(); window.toast("Record saved");
    }
    function saveCourse() {
        var title = $("c-title").value.trim(), cr = parseInt($("c-credits").value, 10);
        if (!title) { D.error = "Title is required."; return renderDrawer(); }
        if (isNaN(cr) || cr < 1 || cr > 6) { D.error = "Credits must be between 1 and 6."; return renderDrawer(); }
        var c = S.cls(D.id); c.title = title; c.credits = cr; c.prereq = $("c-prereq").value;
        S.log("Updated course " + c.code); D.editing = false; D.error = ""; refresh(); renderDrawer(); window.toast("Course saved");
    }
    function rosterAdd() {
        var sid = $("r-student").value, over = $("r-override").checked, e = S.add(sid, D.id, over);
        if (e) { D.error = e + " Tick Override to enroll anyway."; D.pick = sid; return renderDrawer(); }
        S.log("Added " + S.student(sid).name + " to " + D.id + (over ? " (override)" : "")); D.error = ""; D.pick = null; refresh(); renderDrawer(); window.toast("Student added to " + D.id);
    }
    function rosterDrop(sid) {
        var s = S.student(sid), code = D.id;
        window.confirmBox("Drop " + s.name + "?", "Remove this student from " + code + " as a staff override.", "Drop student", function () {
            S.drop(sid, code); S.log("Dropped " + s.name + " from " + code + " (staff override)"); D.error = ""; refresh(); renderDrawer(); window.toast(s.name + " dropped from " + code);
        });
    }
    function changeCap(code, d) {
        var c = S.cls(code), n = c.cap + d;
        if (n < S.roster(code).length) return window.toast("Capacity can't go below current enrollment (" + S.roster(code).length + ").");
        c.cap = n; S.log(code + " capacity set to " + n); refresh();
    }
    function refresh() { renderHome(); renderStudents(); renderCourses(); renderClasses(); renderGrades(); }

    document.addEventListener("DOMContentLoaded", function () {
        $("student-search").addEventListener("input", function (e) { query = e.target.value.trim(); renderStudents(); });
        $("status-chips").addEventListener("click", function (e) {
            var b = e.target.closest(".chip"); if (!b) return;
            filter = b.dataset.f; Array.prototype.forEach.call(document.querySelectorAll("#status-chips .chip"), function (c) { c.classList.toggle("on", c === b); }); renderStudents();
        });
        $("student-head").addEventListener("click", function (e) {
            var th = e.target.closest(".sortable"); if (!th) return;
            sort = { key: th.dataset.sort, dir: sort.key === th.dataset.sort ? -sort.dir : 1 }; renderStudents();
        });
        $("grade-class").addEventListener("change", renderGrades);
        $("save-grades").addEventListener("click", saveGrades);
        $("add-student").addEventListener("click", function () { openDrawer("student", null, true); });
        document.addEventListener("click", function (e) {
            var o = e.target.closest("[data-open]"), co = e.target.closest("[data-course]"), ro = e.target.closest("[data-roster]"), cp = e.target.closest("[data-cap]"), dr = e.target.closest("[data-drop]"), a = e.target.closest("[data-act]");
            if (o) { if (o.closest("#home")) location.hash = "#students"; openDrawer("student", o.dataset.open); }
            else if (co) openDrawer("course", co.dataset.course);
            else if (ro) { if (ro.closest("#home")) location.hash = "#classes"; openDrawer("roster", ro.dataset.roster); }
            else if (cp) changeCap(cp.dataset.cap, Number(cp.dataset.d));
            else if (dr) rosterDrop(dr.dataset.drop);
            else if (a) {
                var x = a.dataset.act;
                if (x === "close") closeDrawer(); else if (x === "edit") { D.editing = true; renderDrawer(); } else if (x === "cancel") { D.editing = false; D.error = ""; if (D.id === null) closeDrawer(); else renderDrawer(); }
                else if (x === "save-student") saveStudent(); else if (x === "save-course") saveCourse(); else if (x === "add-student") rosterAdd();
            }
        });
        $("overlay").addEventListener("click", closeDrawer);
        document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDrawer(); });
        refresh();
    });
})();
