// Available Classes (UC-06), Registration (UC-04), My Schedule (UC-07), Drop Class (UC-05)
(function () {
    "use strict";
    var S = window.SRS, me = S.me, START = 8, END = 20, HR = 44;
    var DAYS = [["M", "Mon"], ["T", "Tue"], ["W", "Wed"], ["R", "Thu"], ["F", "Fri"]];
    function $(i) { return document.getElementById(i); }
    function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
    function mine() { return S.mine(me).map(function (e) { return S.cls(e.code); }); }
    function registered(code) { return S.mine(me).some(function (e) { return e.code === code; }); }
    function badge(t, c) { return '<span class="badge ' + c + '">' + esc(t) + "</span>"; }
    function fmtBadge(c) { return badge(c.modality, c.modality === "Online" ? "online" : "f2f"); }
    function seatBadge(c) { var l = S.left(c.code); return l <= 0 ? badge("Full", "full") : badge(l + " left", l <= 3 ? "low" : "open"); }

    function msg(text, type) { var b = $("reg-message"); b.textContent = text; b.className = "reg-message " + (type || "ok"); b.hidden = false; }

    function register(code) {
        var err = S.add(me, code, false);
        if (err) return msg(err, "error");
        S.log(S.student(me).name + " registered for " + code);
        msg("Registered for " + code + " - " + S.cls(code).title + ". It now appears in My Schedule.", "ok");
        closeDrawer(); render();
    }
    function drop(code) {
        var c = S.cls(code);
        window.confirmBox("Drop " + code + "?", "You will give up your seat in " + c.title + ". This frees the seat for another student.", "Drop class", function () {
            S.drop(me, code); S.log(S.student(me).name + " dropped " + code);
            msg("Dropped " + code + ".", "ok"); closeDrawer(); render();
        });
    }

    // ----- Available Classes -----
    function renderAvailable() {
        var q = $("cat-search").value.toLowerCase().trim(), mod = $("cat-modality").value, open = $("cat-open").checked, n = 0;
        $("catalog-body").innerHTML = S.classes.filter(function (c) {
            return (!q || (c.code + " " + c.title + " " + c.instructor).toLowerCase().indexOf(q) > -1) && (!mod || c.modality === mod) && (!open || S.left(c.code) > 0);
        }).map(function (c) {
            n++;
            var act = registered(c.code) ? badge("Registered", "enrolled")
                : '<button type="button" class="reg-btn' + (S.left(c.code) <= 0 ? " full" : "") + '" data-reg="' + c.code + '">' + (S.left(c.code) <= 0 ? "Full" : "Register") + "</button>";
            return '<tr><td><button type="button" class="link-btn" data-details="' + c.code + '">' + c.code + '</button><span class="course-title">' + esc(c.title) + "</span></td><td>" +
                S.meets(c) + "</td><td>" + fmtBadge(c) + "</td><td>" + esc(c.instructor) + "</td><td>" + seatBadge(c) + "</td><td>" + (esc(c.prereq) || "None") + "</td><td>" + act + "</td></tr>";
        }).join("");
        $("cat-empty").hidden = n > 0;
    }

    // ----- My Schedule -----
    function renderSchedule() {
        var list = mine(), cr = S.credits(me);
        $("stat-credits").textContent = cr; $("stat-classes").textContent = list.length; $("stat-remaining").textContent = S.maxCredits - cr;
        $("schedule-body").innerHTML = list.length ? list.map(function (c) {
            return '<tr><td><button type="button" class="link-btn" data-details="' + c.code + '">' + c.code + '</button><span class="course-title">' + esc(c.title) + "</span></td><td>" + S.meets(c) + "</td><td>" +
                fmtBadge(c) + "</td><td>" + c.credits + '</td><td><button type="button" class="reg-btn drop" data-drop="' + c.code + '">Drop</button></td></tr>';
        }).join("") : '<tr><td colspan="5">You are not registered for any classes yet. Open Available Classes to register.</td></tr>';
        renderCalendar(list);
    }

    function renderCalendar(list) {
        var hours = "";
        for (var h = START; h < END; h++) hours += "<span>" + ((h + 11) % 12 + 1) + (h >= 12 ? " PM" : " AM") + "</span>";
        var cols = DAYS.map(function (d) {
            var ev = list.filter(function (c) { return c.days.indexOf(d[0]) > -1; }).map(function (c) {
                var top = (S.toMin(c.start) - START * 60) / 60 * HR, ht = (S.toMin(c.end) - S.toMin(c.start)) / 60 * HR;
                return '<div class="cal-ev ' + (c.modality === "Online" ? "online" : "f2f") + '" style="top:' + top + "px;height:" + ht + 'px"><b>' + c.code + "</b>" + S.fmt(c.start) + "-" + S.fmt(c.end) + "</div>";
            }).join("");
            return '<div class="cal-col"><div class="cal-head">' + d[1] + '</div><div class="cal-body" style="height:' + (END - START) * HR + 'px">' + ev + "</div></div>";
        }).join("");
        $("calendar").innerHTML = '<div class="cal"><div><div class="cal-head" style="background:none"></div><div class="cal-times">' + hours + "</div></div>" + cols + "</div>";
        var asyncList = list.filter(function (c) { return !c.days.length; });
        $("async-note").innerHTML = asyncList.length ? "<strong>Asynchronous online:</strong> " + asyncList.map(function (c) { return esc(c.code + " " + c.title); }).join(", ") : "";
    }

    // ----- Class Details drawer -----
    function openDetails(code) {
        var c = S.cls(code), reg = registered(code);
        $("drawer").innerHTML = '<button type="button" class="btn ghost" data-act="close">Close</button><h2>' + c.code + '</h2><p class="muted">' + esc(c.title) + "</p><dl>" +
            "<dt>Credits</dt><dd>" + c.credits + "</dd><dt>Format</dt><dd>" + c.modality + "</dd><dt>Meets</dt><dd>" + S.meets(c) + "</dd><dt>Instructor</dt><dd>" + esc(c.instructor) +
            "</dd><dt>Seats</dt><dd>" + Math.max(0, S.left(c.code)) + " of " + c.cap + " open</dd><dt>Prerequisite</dt><dd>" + (esc(c.prereq) || "None") + "</dd></dl>" +
            (reg ? '<button type="button" class="btn danger" data-drop="' + code + '">Drop class</button>'
                : '<button type="button" class="btn" data-reg="' + code + '">' + (S.left(code) <= 0 ? "Register (class is full)" : "Register") + "</button>");
        $("drawer").classList.add("open"); $("overlay").classList.add("open");
    }
    function closeDrawer() { $("drawer").classList.remove("open"); $("overlay").classList.remove("open"); }

    function render() { renderAvailable(); renderSchedule(); }

    document.addEventListener("DOMContentLoaded", function () {
        ["cat-search", "cat-modality", "cat-open"].forEach(function (id) { $(id).addEventListener("input", renderAvailable); });
        $("view-toggle").addEventListener("click", function (e) {
            var b = e.target.closest("[data-vw]"); if (!b) return;
            Array.prototype.forEach.call(document.querySelectorAll("#view-toggle .chip"), function (c) { c.classList.toggle("on", c === b); });
            $("cal-view").hidden = b.dataset.vw !== "cal"; $("list-view").hidden = b.dataset.vw !== "list";
        });
        document.addEventListener("click", function (e) {
            var r = e.target.closest("[data-reg]"), d = e.target.closest("[data-drop]"), t = e.target.closest("[data-details]"), a = e.target.closest("[data-act]");
            if (r) register(r.dataset.reg); else if (d) drop(d.dataset.drop); else if (t) openDetails(t.dataset.details); else if (a) closeDrawer();
        });
        $("overlay").addEventListener("click", closeDrawer);
        document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDrawer(); });
        render();
    });
})();
