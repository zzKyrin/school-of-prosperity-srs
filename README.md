# School of Prosperity - Student Records System (SRS)

Working web prototype for INSY 3305, Group 4. Live demo: https://zzkyrin.github.io/school-of-prosperity-srs/

## Demo accounts
| Role | ID | Password |
|---|---|---|
| Student | 100245 | student123 |
| Staff | STAFF001 | staff123 |

## Screens (names match the Windows Navigation Diagram)
| Diagram window | Page | Use case |
|---|---|---|
| Login | `index.html` | UC-01 to UC-07 |
| Student Main Menu, My Grades | `student-dashboard.html` | FR-3 |
| Available Classes, Class Details, Registration, My Schedule, Confirm Drop | `register.html` | UC-04, UC-05, UC-06, UC-07 |
| Staff Main Menu, Student Search / Student Record | `staff-dashboard.html` (Student Records) | UC-01 |
| Course List / Course Record | `staff-dashboard.html` (Course Records) | UC-02 |
| Class List / Class Record (roster, add/drop override) | `staff-dashboard.html` (Class Records) | UC-03 |
| Manage Grades | `staff-dashboard.html` (Manage Grades) | FR-3 |

## Rules enforced on registration
Duplicate registration, full class (TC-010), missing prerequisite, time conflict, and a 15-credit limit. Staff can override these when adding a student to a roster.

## How the prototype relates to the deployment diagram
The Phase 8 deployment diagram shows a browser, a web/application server, and a database server. This prototype is the browser tier only: it runs as static files, and `js/data.js` stands in for the database by saving data in the browser's localStorage. Sign-in and page protection (`js/guard.js`) are demo-only because a real system would check them on the server. `database/schema.sql` is the design for the real data tier (not connected).

## Demo tip
On the login page, click **Reset demo data** to restore the sample data before a demo.

## Run it
Open `index.html` in a browser. No install needed.
