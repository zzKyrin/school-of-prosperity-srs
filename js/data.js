// Shared data layer for the SRS prototype (stands in for the database server).
// Everything is saved in the browser's localStorage.
(function () {
    "use strict";
    function read(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
    function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }

    var PROGRAMS = ["BS Information Technology", "BS Software Development", "MS Information Technology", "MS Software Development"];
    var POINTS = { A: 4, B: 3, C: 2, D: 1, F: 0 };
    var DONE = ["INSY 3305", "INSY 4305", "INSY 4306", "MANA 2268"];   // demo: same completed courses for everyone
    var HISTORY = [
        { code: "INSY 3305", title: "Database Systems", credits: 3, grade: "A", term: "Fall 2025" },
        { code: "INSY 4305", title: "Systems Analysis", credits: 3, grade: "B", term: "Fall 2025" },
        { code: "INSY 4306", title: "Data Analytics", credits: 3, grade: "A", term: "Spring 2026" },
        { code: "MANA 2268", title: "Business Management", credits: 3, grade: "B", term: "Spring 2026" }
    ];

    var seedStudents = [
        ["100245", "Jordan Williams", 0, "Undergraduate", 3.5, 12, "Active"], ["100246", "Taylor Johnson", 1, "Undergraduate", 3.42, 45, "Active"],
        ["100247", "Casey Williams", 0, "Undergraduate", 3.18, 60, "Active"], ["100248", "Morgan Lee", 3, "Graduate", 3.85, 18, "Active"],
        ["100249", "Riley Patel", 2, "Graduate", 3.6, 24, "Active"], ["100250", "Avery Chen", 1, "Undergraduate", 2.31, 39, "Active"],
        ["100251", "Quinn Rivera", 0, "Undergraduate", 1.94, 30, "Inactive"], ["100252", "Jamie Brooks", 3, "Graduate", 3.92, 36, "Graduated"],
        ["100253", "Drew Kim", 1, "Undergraduate", 2.78, 51, "Active"], ["100254", "Sasha Okafor", 2, "Graduate", 3.25, 21, "Active"]
    ].map(function (r) { return { id: r[0], name: r[1], program: PROGRAMS[r[2]], level: r[3], priorGpa: r[4], priorCredits: r[5], status: r[6] }; });

    // days: M T W R F. Empty days = asynchronous online class.
    var seedClasses = [
        { code: "INSY 4307", title: "Cloud Computing", credits: 3, modality: "Online", days: [], start: "", end: "", instructor: "Dr. Patel", cap: 8, prereq: "INSY 3305" },
        { code: "INSY 4310", title: "Web Application Development", credits: 3, modality: "Face-to-Face", days: ["M", "W"], start: "10:00", end: "11:15", instructor: "Prof. Nguyen", cap: 5, prereq: "INSY 3305" },
        { code: "INSY 4315", title: "Cybersecurity Fundamentals", credits: 3, modality: "Face-to-Face", days: ["T", "R"], start: "13:00", end: "14:15", instructor: "Dr. Okafor", cap: 8, prereq: "" },
        { code: "INSY 4320", title: "Software Engineering", credits: 3, modality: "Online", days: ["T", "R"], start: "18:00", end: "19:15", instructor: "Prof. Reyes", cap: 6, prereq: "INSY 4305" },
        { code: "INSY 4330", title: "Machine Learning for Business", credits: 3, modality: "Online", days: ["M", "W"], start: "14:00", end: "15:15", instructor: "Dr. Chen", cap: 8, prereq: "INSY 4306" },
        { code: "CSIS 3300", title: "Data Structures", credits: 3, modality: "Face-to-Face", days: ["M", "W", "F"], start: "09:00", end: "09:50", instructor: "Prof. Alvarez", cap: 10, prereq: "" },
        { code: "MANA 3310", title: "Project Management", credits: 3, modality: "Online", days: ["T", "R"], start: "10:00", end: "11:15", instructor: "Dr. Brooks", cap: 10, prereq: "MANA 2268" },
        { code: "INSY 4350", title: "Mobile App Development", credits: 3, modality: "Face-to-Face", days: ["T", "R"], start: "10:30", end: "11:45", instructor: "Prof. Kim", cap: 5, prereq: "INSY 3305" }
    ];
    var seedRoster = {
        "INSY 4307": ["100246", "100247", "100249", "100250", "100253"], "INSY 4310": ["100246", "100247", "100248", "100250", "100254"],
        "INSY 4315": ["100248", "100249", "100254"], "INSY 4320": ["100246", "100247", "100248", "100249", "100253"],
        "INSY 4330": ["100248", "100249"], "CSIS 3300": ["100247", "100250", "100253"], "MANA 3310": ["100246", "100254"],
        "INSY 4350": ["100246", "100248", "100249", "100254"]
    };
    var seedEnroll = [];
    Object.keys(seedRoster).forEach(function (code) { seedRoster[code].forEach(function (sid) { seedEnroll.push({ sid: sid, code: code, grade: null }); }); });

    var S = window.SRS = {
        me: "100245", term: "Spring 2027", maxCredits: 15, programs: PROGRAMS,
        students: read("sop3-students", null) || seedStudents,
        classes: read("sop3-classes", null) || seedClasses,
        enroll: read("sop3-enroll", null) || seedEnroll,
        activity: read("sop3-activity", [])
    };

    S.save = function () {
        write("sop3-students", S.students); write("sop3-classes", S.classes);
        write("sop3-enroll", S.enroll); write("sop3-activity", S.activity);
    };
    S.log = function (msg) {
        S.activity.unshift({ t: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }), msg: msg });
        S.activity = S.activity.slice(0, 8); S.save();
    };

    S.student = function (id) { return S.students.filter(function (s) { return s.id === id; })[0]; };
    S.cls = function (code) { return S.classes.filter(function (c) { return c.code === code; })[0]; };
    S.roster = function (code) { return S.enroll.filter(function (e) { return e.code === code; }); };
    S.mine = function (sid) { return S.enroll.filter(function (e) { return e.sid === sid; }); };
    S.left = function (code) { return S.cls(code).cap - S.roster(code).length; };
    S.credits = function (sid) { return S.mine(sid).reduce(function (a, e) { return a + S.cls(e.code).credits; }, 0); };
    S.history = function (sid) { return sid === S.me ? HISTORY : []; };

    // Cumulative GPA = prior record + any grades staff have entered this term
    S.gpa = function (sid) {
        var s = S.student(sid), pts = s.priorGpa * s.priorCredits, cr = s.priorCredits;
        S.mine(sid).forEach(function (e) {
            if (e.grade && POINTS[e.grade] !== undefined) { var c = S.cls(e.code).credits; pts += POINTS[e.grade] * c; cr += c; }
        });
        return { gpa: cr ? pts / cr : 0, credits: cr };
    };

    // ----- time helpers -----
    S.toMin = function (t) { var p = t.split(":"); return Number(p[0]) * 60 + Number(p[1]); };
    S.fmt = function (t) { var p = t.split(":"), h = Number(p[0]); return ((h + 11) % 12 + 1) + ":" + p[1] + (h >= 12 ? " PM" : " AM"); };
    var DN = { M: "Mon", T: "Tue", W: "Wed", R: "Thu", F: "Fri" };
    S.meets = function (c) {
        return c.days.length ? c.days.map(function (d) { return DN[d]; }).join("/") + " " + S.fmt(c.start) + "-" + S.fmt(c.end) : "Asynchronous";
    };
    S.conflict = function (a, b) {
        if (!a.days.length || !b.days.length) return false;
        return a.days.some(function (d) { return b.days.indexOf(d) > -1; }) && S.toMin(a.start) < S.toMin(b.end) && S.toMin(b.start) < S.toMin(a.end);
    };

    // ----- registration rules (UC-04). Returns an error message, or "" if allowed. -----
    S.check = function (sid, code, override) {
        var c = S.cls(code), mine = S.mine(sid);
        if (mine.some(function (e) { return e.code === code; })) return "Already registered for " + code + ".";
        if (override) return "";
        if (S.left(code) <= 0) return "Registration denied: " + code + " is full.";
        if (c.prereq && DONE.indexOf(c.prereq) === -1) return "Cannot register for " + code + ": prerequisite " + c.prereq + " not completed.";
        for (var i = 0; i < mine.length; i++) {
            var o = S.cls(mine[i].code);
            if (S.conflict(c, o)) return code + " conflicts with " + o.code + " (" + S.meets(o) + ").";
        }
        if (S.credits(sid) + c.credits > S.maxCredits) return "Registering for " + code + " would exceed the " + S.maxCredits + "-credit limit.";
        return "";
    };
    S.add = function (sid, code, override) {
        var err = S.check(sid, code, override);
        if (err) return err;
        S.enroll.push({ sid: sid, code: code, grade: null }); S.save(); return "";
    };
    S.drop = function (sid, code) {
        S.enroll = S.enroll.filter(function (e) { return !(e.sid === sid && e.code === code); }); S.save();
    };
    S.setGrade = function (sid, code, g) {
        S.enroll.forEach(function (e) { if (e.sid === sid && e.code === code) e.grade = g || null; });
    };
})();
