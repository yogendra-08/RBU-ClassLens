<div align="center">

# 🎓 RBU ClassLens

### A Modern, Google Classroom-Inspired Learning Management System

**Empowering Teachers. Engaging Students. Elevating Digital Learning.**

<br/>

![Banner Placeholder](https://via.placeholder.com/1200x400/4F46E5/FFFFFF?text=RBU+ClassLens+%7C+Learning+Management+System)

<br/>

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge&logo=vercel)](#)
[![Deployment](https://img.shields.io/badge/deployed%20on-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](#)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](#-license)
[![Stars](https://img.shields.io/github/stars/your-org/rbu-classlens?style=for-the-badge&color=yellow)](#)
[![Issues](https://img.shields.io/github/issues/your-org/rbu-classlens?style=for-the-badge&color=red)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge)](#-contribution-guidelines)

![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=flat-square&logo=shadcnui&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=flat-square&logo=netlify&logoColor=white)

<br/>

[🚀 Live Demo](#-demo) · [📖 Documentation](#-table-of-contents) · [🐞 Report Bug](#-support--contact) · [✨ Request Feature](#-support--contact)

</div>

<br/>

---

## 📚 Table of Contents

<details open>
<summary>Click to expand</summary>

- [📖 About The Project](#-about-the-project)
- [❓ Problem Statement](#-problem-statement)
- [💡 Motivation](#-motivation)
- [✨ Key Features](#-key-features)
- [🏗️ Architecture](#️-architecture)
- [🧰 Technology Stack](#-technology-stack)
- [📁 Project Structure](#-project-structure)
- [👥 User Roles](#-user-roles)
- [🗺️ Development Roadmap](#️-development-roadmap)
- [📦 Project Phases](#-project-phases)
- [🗄️ Database Overview](#️-database-overview)
- [🔐 Authentication Flow](#-authentication-flow)
- [🚢 Deployment Strategy](#-deployment-strategy)
- [📸 Screenshots](#-screenshots)
- [🎥 Demo](#-demo)
- [⚙️ Installation](#️-installation)
- [💻 Local Development Setup](#-local-development-setup)
- [🔑 Environment Variables](#-environment-variables)
- [🤝 Contribution Guidelines](#-contribution-guidelines)
- [🔮 Future Scope](#-future-scope)
- [🎯 Project Goals](#-project-goals)
- [🙏 Acknowledgements](#-acknowledgements)
- [📄 License](#-license)
- [🧑‍💻 Maintainers](#-maintainers)
- [📬 Support & Contact](#-support--contact)

</details>

---

## 📖 About The Project

**RBU ClassLens** is a full-featured, modern **Learning Management System (LMS)** inspired by Google Classroom, purpose-built for educational institutions that want a lightweight, customizable, and self-hosted alternative to manage classrooms digitally.

It enables **teachers** to create classrooms, share resources, post announcements, design assignments, and grade student submissions — all through a clean, intuitive, and responsive interface. **Students** get a unified space to join classes, access materials, submit work, and track their academic progress.

RBU ClassLens is being built **in phases**, with a strong emphasis on:

- 🧩 **Scalability** — modular architecture that grows with institutional needs
- 🎨 **Modern UX** — powered by shadcn/ui and Tailwind CSS
- 🧑‍🎓 **Beginner-friendliness** — clear code structure for contributors and students learning full-stack development
- 🔒 **Security-first design** — leveraging Supabase Auth and PostgreSQL Row-Level Security

> **Status:** 🚧 Actively in development — Phase-wise rollout in progress.

---

## Local demo

The current application is a browser-local demo built with React, TypeScript, and Vite. It does not connect to Google Classroom or a production backend. Demo sign-in lets you explore the teacher and student roles; records are stored in this browser's `localStorage`.

```sh
npm install
npm run dev
```

Teachers can create classes, share the displayed class code, post announcements and classwork, review submissions, and upload notes. Students can join a class, comment, open notes, and turn in work. Files are limited to 2 MB in this demo. A PDF is marked viewed only after its embedded viewer loads; the saved activity is the student's identity, PDF note, and first-open time. No reading percentage is collected. The client-side demo activity log is not a secure or reliable substitute for server-side authentication and authorization.

Before production use, connect a trusted backend for account authentication, database and file storage, enforce role and class ownership on the server, and move PDF-view events to a server-authorized endpoint. Do not treat browser-local data or demo identities as production records.

---

## ❓ Problem Statement

Many educational institutions — especially smaller colleges, coaching centers, and universities — face recurring challenges with digital learning management:

| Challenge | Impact |
|---|---|
| 🔒 Vendor lock-in with closed-source platforms | Limited customization and data ownership |
| 💸 Expensive licensing for enterprise LMS tools | High recurring costs for institutions |
| 🐌 Bloated, non-intuitive interfaces | Poor adoption by teachers and students |
| 📉 Lack of resource engagement insights | Teachers can't tell if students actually studied the material |
| 🧩 Poor integration with tools institutions already use | Fragmented digital ecosystem |

RBU ClassLens aims to solve these problems with an **open, extensible, and institution-owned** LMS that institutions can deploy, customize, and scale on their own terms.

---

## 💡 Motivation

The idea for RBU ClassLens was born out of a simple observation: most institutions either **overpay for bloated enterprise LMS software** or **underuse free tools that lack the insights teachers actually need**.

This project set out to build something that:

- ✅ Feels as familiar and easy to use as Google Classroom
- ✅ Gives institutions **full ownership** of their data via Supabase
- ✅ Is **open to contribution**, so students and developers can learn real-world full-stack engineering
- ✅ Introduces **novel features** (like Resource View Tracking) that mainstream LMS platforms don't offer out of the box

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🏫 Classroom Management
Create, edit, and organize multiple classrooms with unique class codes for easy student enrollment.

### 📢 Announcements
Post real-time announcements to keep students informed and engaged.

### 📚 Resource Sharing
Upload and share notes, PDFs, slides, and links — organized by topic or module.

### 📝 Assignment Creation
Design assignments with deadlines, instructions, and file attachments.

</td>
<td width="50%">

### 📤 Submission Management
Students submit work digitally; teachers track submission status in real time.

### 🧮 Grading System
Grade submissions with scores and feedback, viewable instantly by students.

### 🔐 Secure Authentication
Role-based access control powered by Supabase Auth.

### 📱 Responsive Design
A clean, mobile-friendly UI built with Tailwind CSS and shadcn/ui.

</td>
</tr>
</table>

---

## 🏗️ Architecture

RBU ClassLens follows a **client-driven, BaaS (Backend-as-a-Service)** architecture, using Supabase as the unified backend layer for authentication, database, and file storage.

```
                          ┌────────────────────────────┐
                          │         CLIENT (SPA)        │
                          │  React + TypeScript + Vite  │
                          │   Tailwind CSS + shadcn/ui   │
                          └──────────────┬───────────────┘
                                         │
                                         │  HTTPS / REST / Realtime
                                         ▼
                          ┌────────────────────────────┐
                          │         SUPABASE            │
                          │  ┌────────────────────────┐ │
                          │  │   Supabase Auth (JWT)   │ │
                          │  ├────────────────────────┤ │
                          │  │  PostgreSQL Database    │ │
                          │  │  (Row-Level Security)   │ │
                          │  ├────────────────────────┤ │
                          │  │   Supabase Storage      │ │
                          │  │ (Resources / Submissions│ │
                          │  └────────────────────────┘ │
                          └──────────────┬───────────────┘
                                         │
                                         ▼
                          ┌────────────────────────────┐
                          │    NETLIFY (CI/CD + CDN)    │
                          │   Static Hosting + Deploy   │
                          └────────────────────────────┘
```

<details>
<summary>📐 Component-Level Architecture (click to expand)</summary>

```
┌───────────────────────────────────────────────────────────┐
│                        App.tsx (Router)                     │
├───────────────────────────────────────────────────────────┤
│  Auth Layer        │  Layout Layer     │  Feature Modules    │
│  ─────────────     │  ─────────────    │  ─────────────────  │
│  Login             │  Navbar           │  Classrooms          │
│  Signup            │  Sidebar          │  Announcements        │
│  ProtectedRoute     │  DashboardShell   │  Assignments          │
│  RoleGuard          │                   │  Submissions          │
│                     │                   │  Grading              │
│                     │                   │  Resources            │
└───────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │  Supabase Client   │
                    │   (services/api)   │
                    └───────────────────┘
```

</details>

---

## 🧰 Technology Stack

<div align="center">

| Layer | Technology | Purpose |
|:---:|:---:|:---|
| ⚛️ **Frontend Framework** | React | Component-driven UI development |
| 🔤 **Language** | TypeScript | Type-safe, scalable codebase |
| ⚡ **Build Tool** | Vite | Lightning-fast dev server & bundling |
| 🎨 **Styling** | Tailwind CSS | Utility-first responsive styling |
| 🧩 **UI Components** | shadcn/ui | Accessible, elegant, composable components |
| 🔐 **Authentication** | Supabase Auth | Secure, role-based user authentication |
| 🗄️ **Database** | Supabase PostgreSQL | Relational data storage with RLS |
| 📦 **File Storage** | Supabase Storage | Resource & submission file management |
| ☁️ **Deployment** | Netlify | CI/CD, hosting, and global CDN delivery |

</div>

---

## 📁 Project Structure

```
rbu-classlens/
│
├── 📂 public/                  # Static assets
│
├── 📂 src/
│   ├── 📂 assets/              # Images, icons, fonts
│   ├── 📂 components/          # Reusable UI components
│   │   ├── 📂 ui/               # shadcn/ui components
│   │   ├── 📂 layout/           # Navbar, Sidebar, Shell
│   │   └── 📂 shared/           # Shared cross-feature components
│   │
│   ├── 📂 features/            # Feature-based modules
│   │   ├── 📂 auth/
│   │   ├── 📂 classrooms/
│   │   ├── 📂 announcements/
│   │   ├── 📂 assignments/
│   │   ├── 📂 submissions/
│   │   └── 📂 grading/
│   │
│   ├── 📂 hooks/                # Custom React hooks
│   ├── 📂 lib/                  # Supabase client, utilities
│   ├── 📂 pages/                # Route-level page components
│   ├── 📂 services/             # API/service layer
│   ├── 📂 types/                # TypeScript type definitions
│   ├── 📂 context/              # Global state/context providers
│   ├── App.tsx
│   └── main.tsx
│
├── 📂 supabase/
│   ├── 📂 migrations/           # DB schema migrations
│   └── 📂 seed/                 # Seed data scripts
│
├── .env.example
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 👥 User Roles

<table>
<tr>
<th width="50%">👩‍🏫 Teacher</th>
<th width="50%">🧑‍🎓 Student</th>
</tr>
<tr>
<td valign="top">

- Create and manage classrooms
- Generate & share class join codes
- Post announcements
- Upload learning resources
- Create assignments with deadlines
- Review and manage submissions
- Grade student work with feedback
- *(Future)* Track resource engagement

</td>
<td valign="top">

- Join classrooms via class code
- View announcements & resources
- Submit assignments before deadlines
- Track submission status
- View grades and teacher feedback
- Manage personal profile

</td>
</tr>
</table>

---

## 🗺️ Development Roadmap

> **Legend:** ✅ Done &nbsp; 🚧 In Progress &nbsp; 📋 Planned

- [x] ✅ Project setup — React + TypeScript + Vite + Tailwind + shadcn/ui
- [x] ✅ Supabase integration — Auth, DB, Storage
- [x] ✅ Role-based authentication (Teacher / Student)
- [x] ✅ Classroom creation & join-by-code
- [ ] 🚧 Announcements module
- [ ] 🚧 Resource sharing module
- [ ] 📋 Assignment creation & management
- [ ] 📋 Submission workflow
- [ ] 📋 Grading & feedback system
- [ ] 📋 Notifications system
- [ ] 📋 Resource View Tracking
- [ ] 📋 Analytics dashboard
- [ ] 📋 Mobile application

**Overall Progress:**

`████████░░░░░░░░░░░░░░░░░░` **~30% Complete**

---

## 📦 Project Phases

<details open>
<summary><strong>Phase 1 — Foundation</strong> ✅ Completed</summary>

- Project scaffolding & tooling setup
- Supabase project configuration
- Authentication (Sign up / Login / Roles)
- Base UI system with shadcn/ui

</details>

<details open>
<summary><strong>Phase 2 — Core Classroom Features</strong> 🚧 In Progress</summary>

- Classroom creation & management
- Announcements
- Resource sharing (notes, links, files)

</details>

<details>
<summary><strong>Phase 3 — Assignments & Grading</strong> 📋 Planned</summary>

- Assignment creation with due dates
- Student submission workflow
- Teacher grading & feedback system

</details>

<details>
<summary><strong>Phase 4 — Engagement & Insights</strong> 📋 Planned</summary>

- Resource View Tracking
- Engagement analytics dashboard
- Notification system

</details>

<details>
<summary><strong>Phase 5 — Ecosystem Integration</strong> 📋 Planned</summary>

- Google Classroom / Drive / Calendar integration
- Mobile application
- Push notifications

</details>

---

## 🗄️ Database Overview

RBU ClassLens uses **Supabase PostgreSQL** with **Row-Level Security (RLS)** enforced on every table to ensure users only access data they're authorized to see.

<details>
<summary>📊 Core Schema (click to expand)</summary>

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────┐
│   profiles  │──────▶│   classrooms       │──────▶│  enrollments │
├─────────────┤       ├──────────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)            │       │ id (PK)      │
│ full_name   │       │ title              │       │ classroom_id │
│ role        │       │ class_code         │       │ student_id   │
│ email       │       │ teacher_id (FK)     │       │ joined_at    │
└─────────────┘       └──────────────────┘       └─────────────┘
                                │
              ┌─────────────────┼──────────────────┐
              ▼                                    ▼
     ┌──────────────────┐               ┌──────────────────┐
     │  announcements     │               │   assignments      │
     ├──────────────────┤               ├──────────────────┤
     │ id (PK)            │               │ id (PK)            │
     │ classroom_id (FK)   │               │ classroom_id (FK)   │
     │ content             │               │ title               │
     │ created_at          │               │ due_date            │
     └──────────────────┘               └──────────────────┘
                                                    │
                                                    ▼
                                          ┌──────────────────┐
                                          │   submissions       │
                                          ├──────────────────┤
                                          │ id (PK)             │
                                          │ assignment_id (FK)   │
                                          │ student_id (FK)      │
                                          │ file_url             │
                                          │ grade                │
                                          │ feedback             │
                                          └──────────────────┘
```

</details>

| Table | Description |
|---|---|
| `profiles` | Stores user profile info & role (`teacher` / `student`) |
| `classrooms` | Classroom metadata & unique join codes |
| `enrollments` | Maps students to classrooms |
| `announcements` | Classroom announcements |
| `resources` | Shared learning materials |
| `assignments` | Assignment details & deadlines |
| `submissions` | Student submissions with grades & feedback |

---

## 🔐 Authentication Flow

```
   ┌────────┐     1. Sign Up / Login      ┌────────────────┐
   │  User   │ ───────────────────────▶  │  Supabase Auth   │
   └────────┘                            └────────────────┘
        ▲                                         │
        │        3. JWT Session Token             │ 2. Validate credentials
        │◀────────────────────────────────────────┘
        │
        │ 4. Attach JWT to requests
        ▼
   ┌──────────────────────────┐
   │   Row-Level Security (RLS) │
   │   Policies on PostgreSQL   │
   └──────────────────────────┘
        │
        ▼
   5. Role-based data access
   (Teacher sees own classrooms,
    Student sees enrolled classrooms)
```

1. User signs up/logs in via **Supabase Auth** (email/password).
2. Supabase validates credentials and issues a **JWT session token**.
3. The token is stored securely and attached to every API request.
4. **PostgreSQL Row-Level Security policies** validate the user's role and ownership before returning data.
5. The frontend renders role-specific dashboards (**Teacher** vs **Student**).

---

## 🚢 Deployment Strategy

<div align="center">

| Environment | Platform | Trigger | Status |
|:---:|:---:|:---:|:---:|
| **Production** | Netlify | Push to `main` | ![Status](https://img.shields.io/badge/status-live-brightgreen) |
| **Staging** | Netlify (Preview) | Pull Requests | ![Status](https://img.shields.io/badge/status-active-yellow) |
| **Database** | Supabase Cloud | Migrations via CLI | ![Status](https://img.shields.io/badge/status-stable-brightgreen) |

</div>

**Pipeline Overview:**

```
Developer Push → GitHub → Netlify Build → Vite Production Build → CDN Deploy
                                │
                                ▼
                     Environment Variables Injected
                     (Supabase URL & Anon Key)
```

- ⚡ Automatic deploy previews for every pull request
- 🔁 Continuous deployment from the `main` branch
- 🌍 Global CDN distribution via Netlify Edge

---

## 📸 Screenshots

<div align="center">

| Dashboard | Classroom View |
|:---:|:---:|
| ![Dashboard Placeholder](https://via.placeholder.com/500x300?text=Dashboard+Screenshot) | ![Classroom Placeholder](https://via.placeholder.com/500x300?text=Classroom+Screenshot) |

| Assignments | Grading Panel |
|:---:|:---:|
| ![Assignments Placeholder](https://via.placeholder.com/500x300?text=Assignments+Screenshot) | ![Grading Placeholder](https://via.placeholder.com/500x300?text=Grading+Screenshot) |

</div>

---

## 🎥 Demo

> 🔗 **Live Demo:** [classlens.netlify.app](#) *(placeholder link)*

> 🎬 **Video Walkthrough:** *(coming soon)*

[![Watch the Demo](https://via.placeholder.com/800x450?text=▶+Demo+Video+Placeholder)](#)

---

## ⚙️ Installation

### Prerequisites

- **Node.js** `v18+`
- **npm** or **pnpm** / **yarn**
- A free **Supabase** account & project

### Clone the Repository

```bash
git clone https://github.com/your-org/rbu-classlens.git
cd rbu-classlens
```

### Install Dependencies

```bash
npm install
```

---

## 💻 Local Development Setup

<details open>
<summary>Step-by-step setup guide</summary>

**1. Install dependencies**

```bash
npm install
```

**2. Configure environment variables**

```bash
cp .env.example .env.local
```

Then fill in your Supabase credentials (see [Environment Variables](#-environment-variables)).

**3. Run Supabase migrations** *(if using Supabase CLI)*

```bash
supabase link --project-ref your-project-ref
supabase db push
```

**4. Start the development server**

```bash
npm run dev
```

**5. Open the app**

```
http://localhost:5173
```

**6. Build for production**

```bash
npm run build
npm run preview
```

</details>

---

## 🔑 Environment Variables

Create a `.env.local` file in the project root using `.env.example` as reference:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
VITE_APP_NAME=RBU ClassLens
VITE_APP_ENV=development
```

| Variable | Description | Required |
|---|---|:---:|
| `VITE_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anon API key | ✅ |
| `VITE_APP_NAME` | Application display name | ❌ |
| `VITE_APP_ENV` | Environment mode (`development` / `production`) | ❌ |

> ⚠️ **Never commit your `.env.local` file.** It's already included in `.gitignore`.

---

## 🤝 Contribution Guidelines

Contributions are what make the open-source community amazing! We welcome contributions of all kinds — code, docs, design, and ideas.

<details>
<summary>How to contribute</summary>

1. **Fork** the repository
2. **Create your feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m "feat: add AmazingFeature"
   ```
4. **Push to your branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request** 🎉

</details>

**Guidelines:**

- Follow the existing code style (ESLint + Prettier configured)
- Write clear, descriptive commit messages (Conventional Commits preferred)
- Keep PRs focused — one feature/fix per PR
- Add comments for complex logic
- Update documentation where relevant

[![Contributors](https://img.shields.io/badge/contributors-welcome-orange?style=for-the-badge)](#)

---

## 🔮 Future Scope

### 🌟 Resource View Tracking *(Flagship Upcoming Feature)*

A unique, first-of-its-kind feature planned for future releases that will allow **teachers** to:

- 👀 Identify **which students viewed** specific learning materials
- ⏱️ Track **first-view timestamps** for each resource
- 📊 View detailed **engagement insights** per classroom/resource
- 📡 Monitor **resource accessibility** and consumption patterns over time

> This feature aims to close the gap between *sharing* content and *knowing* whether it was actually consumed — something most mainstream LMS platforms fail to offer natively.

### 🚀 Additional Planned Enhancements

| Feature | Description |
|---|---|
| 🔗 **Google Classroom Integration** | Import/sync classrooms and rosters directly from Google Classroom |
| 📁 **Google Drive Integration** | Attach and manage resources directly from Google Drive |
| 📅 **Calendar Integration** | Sync assignment deadlines and class schedules with Google Calendar |
| 📱 **Mobile Application** | Native mobile apps for Android & iOS |
| 🔔 **Push Notifications** | Real-time alerts for announcements, deadlines, and grades |
| 📈 **Analytics Dashboard** | Institution-wide insights on engagement, performance, and activity |

---

## 🎯 Project Goals

- 🏫 Provide institutions with a **free, open, and customizable** LMS alternative
- 🎓 Deliver an intuitive experience for **both teachers and students**
- 🔓 Give institutions **full ownership** of their data
- 🧠 Introduce **actionable engagement insights** not found in typical LMS tools
- 🌱 Build a platform that's **easy for new contributors** to understand and extend
- 📦 Maintain a **clean, scalable, and well-documented** codebase

---

## 🙏 Acknowledgements

- [Google Classroom](https://classroom.google.com/) — for UX inspiration
- [Supabase](https://supabase.com/) — for an incredible open-source backend platform
- [shadcn/ui](https://ui.shadcn.com/) — for beautifully accessible UI components
- [Vercel / Vite](https://vitejs.dev/) — for a blazing-fast dev experience
- [Netlify](https://www.netlify.com/) — for effortless deployment & hosting
- The **open-source community** ❤️

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 RBU ClassLens

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
```

See the [LICENSE](./LICENSE) file for full details.

---

## 🧑‍💻 Maintainers

<div align="center">

| Avatar | Name | Role | GitHub |
|:---:|:---:|:---:|:---:|
| 🧑‍💻 | *Your Name* | Founder & Lead Developer | [@your-username](#) |
| 🧑‍💻 | *Contributor Name* | Core Contributor | [@contributor-username](#) |

</div>

---

## 📬 Support & Contact

<div align="center">

Have questions, found a bug, or want to suggest a feature?

[![GitHub Issues](https://img.shields.io/badge/Report-Issue-red?style=for-the-badge&logo=github)](#)
[![GitHub Discussions](https://img.shields.io/badge/Join-Discussion-blue?style=for-the-badge&logo=github)](#)
[![Email](https://img.shields.io/badge/Email-Contact-lightgrey?style=for-the-badge&logo=gmail)](#)

<br/>

**If you find this project useful, consider giving it a ⭐ — it really helps!**

<br/>

Made with ❤️ for the future of digital education.

</div>