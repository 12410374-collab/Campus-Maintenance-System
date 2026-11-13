# PROJECT CONTEXT
# Campus Maintenance Request System

## 1. Project Overview

Campus Maintenance Request System is a web-based application for Universitas Klabat (UNKLAB) to manage campus facility damage reports.

The system allows students, lecturers, and staff to submit maintenance reports. Admins verify reports, determine final priorities, and assign technicians. Technicians handle assigned tasks and update repair progress.

The application is one integrated system with role-based access, not separate applications.

## 2. Technology Stack

- React.js
- Vite
- Tailwind CSS
- React Router DOM
- Lucide React
- JSON Server for prototype REST API
- Gemini API for AI-powered report analysis
- Antigravity as AI coding agent
- Git and GitHub for collaboration

## 3. User Roles

There are five user roles:

1. Student
2. Lecturer
3. Staff
4. Admin
5. Technician

Student, Lecturer, and Staff share the same Reporter interface and features. Their account roles remain distinct.

### Reporter (Student, Lecturer, Staff)
- Login and logout
- View personal dashboard
- Create maintenance reports
- Upload damage photos
- View personal reports and report details
- Track report status
- Receive in-app notifications
- Submit feedback after repair completion

### Admin
- View dashboard statistics
- View all reports and report details
- Verify, approve, or reject reports
- Provide rejection reasons
- View AI analysis
- Set final report priority
- Manage technicians
- Assign technicians to reports
- Monitor repair progress

### Technician
- View assigned task dashboard
- View assigned tasks
- View task details, damage descriptions, photos, and locations
- Update repair status
- Add repair notes
- Upload repair evidence
- View task history

## 4. Report Status

Use these exact status values consistently:

- Pending
- Approved
- Assigned
- In Progress
- Completed
- Rejected

## 5. Priority Values

Use these exact priority values:

- Low
- Medium
- High
- Critical

Important distinction:

- aiPriority = AI-recommended urgency.
- priority = final priority determined by Admin.

AI recommendations must never automatically replace the Admin's final decision.

## 6. AI Integration

Gemini API analyzes report titles and descriptions and provides:

- Suggested damage category
- Recommended urgency
- Problem summary
- Initial maintenance recommendation

Initial categories:

- Electronics
- Electrical
- Furniture
- Plumbing
- Infrastructure
- Other

AI output is advisory only. Admin makes the final decision.

AI must not invent information that is absent from the report. If information is insufficient, manual inspection must be recommended.

Gemini API keys must not be exposed in frontend code or committed to GitHub. AI requests should go through a backend or proxy service.

## 7. Main Data Resources

The planned JSON Server resources are:

- users
- reports
- assignments
- report_updates
- feedbacks
- notifications

The API contract and field definitions must be coordinated with Member 4 (Backend Developer).

Do not invent or independently change API field names without coordination.

## 8. Notification Scope

The initial version uses in-app notifications only.

Do not implement email, SMS, or WhatsApp notifications unless the team explicitly agrees to expand the scope.

## 9. Team Responsibilities

### Member 1 — Frontend Foundation & Technician Developer
Responsible for:

- React/Vite foundation
- Main App.jsx
- Main routing
- Login UI
- Shared Sidebar and Header
- Dashboard layout
- ProtectedRoute
- Technician Dashboard
- Technician Tasks
- Technician Task Detail
- Final frontend integration coordination

### Member 2 — Frontend Developer (Reporter)
Responsible for the Reporter module inside pages/reporter/.

### Member 3 — Frontend Developer (Admin)
Responsible for the Admin module inside pages/admin/.

### Member 4 — Backend Developer
Responsible for db.json, JSON Server, API configuration, API services, and data contracts.

### Member 5 — AI Developer & Tester
Responsible for Gemini integration, AI prompts, output validation, error handling, and test cases.

## 10. File Ownership and Collaboration Rules

- Member 1 owns App.jsx, main routing, shared layouts, and Technician pages.
- Member 2 owns Reporter pages.
- Member 3 owns Admin pages.
- Member 4 owns db.json and shared API configuration.
- Member 5 owns AI integration.

Do not modify another member's owned files without coordination.

Avoid simultaneous edits to shared files.

Use separate Git branches and Pull Requests for each member's work.

## 11. Development Rules for Antigravity

Before making changes:

1. Read this PROJECT_CONTEXT.md completely.
2. Inspect the existing project structure.
3. Understand the assigned member's responsibilities.
4. Identify existing files before creating new ones.
5. Reuse existing components and dependencies when appropriate.
6. Do not create duplicate files or folders.
7. Do not overwrite existing code without explaining why.
8. Do not modify files outside the assigned scope without permission.
9. Follow the agreed role names, status values, priority values, and technology stack.
10. Explain which files will be created or modified before major changes.
11. After implementation, explain the changes and how to test them.

Keep code readable, reusable, and consistent with the existing project.

## 12. Current Development Scope — Member 1

The current task is to build the frontend foundation and Technician module.

Work in this order:

1. Establish application structure.
2. Build Login interface.
3. Implement role-based navigation.
4. Build shared Sidebar and Header.
5. Build DashboardLayout.
6. Implement ProtectedRoute.
7. Build Technician Dashboard.
8. Build Technician Tasks.
9. Build Technician Task Detail.
10. Prepare integration with Reporter, Admin, and Backend modules.

Do not independently build the complete Reporter, Admin, Backend, or Gemini modules.

## 13. Prototype and Security Notes

This project initially uses JSON Server for academic prototyping and demonstration.

JSON Server is not a production authentication or authorization system.

Frontend route protection is for application navigation and must not be treated as sufficient server-side security.

Validate inputs, handle API errors, and do not store real passwords in plain text.

## 14. Main Project Goal

Build one integrated Campus Maintenance Request System in which:

1. A Reporter submits a facility damage report.
2. AI analyzes the report and provides recommendations.
3. Admin verifies the report and determines final priority.
4. Admin assigns a technician.
5. Technician performs the repair and updates progress.
6. Reporter receives notifications and can provide feedback after completion.

All modules must follow the same project architecture, API contracts, and agreed workflow.