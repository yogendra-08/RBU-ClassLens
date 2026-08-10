# RBU ClassLens

## Project Vision

RBU ClassLens is a modern Learning Management System (LMS) inspired by Google Classroom.

The goal is to build a complete classroom management platform where teachers can create classes, share learning materials, assign work, communicate with students, and manage classroom activities.

After building the classroom platform, the project will introduce a unique feature not available in Google Classroom:

> Resource View Tracking

This feature will allow teachers to identify which students have viewed shared learning materials.

---

# Problem Statement

Many educational institutions rely on digital classrooms for sharing study materials, assignments, and announcements.

Existing solutions provide classroom management functionality but often lack detailed visibility into student engagement with shared learning resources.

Teachers cannot easily determine:

* Which students viewed shared notes
* Which students never opened study materials
* When resources were accessed

This project aims to build a classroom platform first and then solve these engagement visibility challenges.

---

# Development Strategy

The project will be developed in multiple phases.

Only one phase should be implemented at a time.

Future phase features must not be implemented early.

---

# Technology Stack

## Frontend

* React
* TypeScript
* Vite
* React Router
* Tailwind CSS
* shadcn/ui

## Backend Services

* Supabase Auth
* Supabase PostgreSQL
* Supabase Storage

## Deployment

* Netlify

---

# System Roles

## Teacher

Can:

* Create classes
* Manage students
* Post announcements
* Upload materials
* Create assignments
* Review submissions
* Manage classroom activities

## Student

Can:

* Join classes
* View materials
* Submit assignments
* Participate in classroom activities
* Receive announcements

---

# PHASE 1

## Authentication & Foundation

### Features

* User registration
* Login
* Logout
* Teacher role
* Student role
* Profile management
* Protected routes
* Dashboard layout

### Deliverables

* Authentication system
* Role management
* Initial dashboard

---

# PHASE 2

## Classroom Management

### Features

* Create classroom
* Edit classroom
* Delete classroom
* Join classroom with code
* Classroom cards
* Classroom dashboard

### Deliverables

* Working classroom creation system
* Student enrollment system

---

# PHASE 3

## Stream

### Features

* Announcements
* Classroom posts
* Teacher updates
* Stream feed

### Deliverables

* Functional classroom stream

---

# PHASE 4

## Materials

### Features

* Upload PDFs
* Upload files
* Create topics
* Organize materials
* Material details page

### Deliverables

* Material management system

---

# PHASE 5

## Assignments

### Features

* Create assignment
* Assignment deadlines
* Student submissions
* File uploads
* Submission tracking

### Deliverables

* Assignment workflow

---

# PHASE 6

## Grading

### Features

* Review submissions
* Assign marks
* Feedback
* Grade management

### Deliverables

* Basic grading system

---

# PHASE 7

## Classroom People

### Features

* Student list
* Teacher list
* Remove members
* Manage participants

### Deliverables

* Classroom member management

---

# PHASE 8

## Notifications

### Features

* Assignment notifications
* Classroom notifications
* Activity alerts

### Deliverables

* Notification system

---

# PHASE 9

## UI/UX Improvements

### Features

* Responsive design
* Mobile support
* Dark mode
* Better navigation

### Deliverables

* Production-ready interface

---

# PHASE 10

## Testing & Optimization

### Features

* Bug fixes
* Performance optimization
* Security improvements

### Deliverables

* Stable application

---

# FUTURE SCOPE

After the classroom platform is completed, implement:

## Resource View Tracking

Features:

* Track material views
* Viewed / Not Viewed status
* First view timestamp
* Teacher analytics dashboard

## Engagement Insights

Features:

* Material access statistics
* Student participation insights

## Integrations

Features:

* Google Classroom synchronization
* Google Drive integration
* Calendar integration

## Mobile Application

Features:

* Android application
* Push notifications

---

# Project Success Criteria

The project is considered successful when:

* Teachers can create and manage classrooms
* Students can join classrooms
* Materials can be shared
* Assignments can be submitted
* Grades can be managed
* The platform is deployable on Netlify
* Future resource tracking can be integrated without major architectural changes
