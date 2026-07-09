# 🙌 Really Real Education — Volunteer Application Portal

A full-stack volunteer application portal built for **Jalte Diye Foundation**, powering the volunteer intake for **Really Real Education**. It is live, deployed, and actively connected to the organization's website, collecting real applications from prospective volunteers.

---

## 🚀 Live Deployment

🔗 Volunteer form (embedded via Really Real Education's site):
https://reallyrealeducation.org/

🔗 Backend (Render):
Deployed and connected to the main site as an interstitial application flow

The portal is currently **live and actively collecting volunteer responses**.

---

## 🛠 Tech Stack

### Backend
- Node.js + Express
- PostgreSQL (hosted on Neon), accessed via `pg.Pool`
- Passport.js (local strategy) with `bcrypt` for admin authentication
- `express-session` for session-based admin login
- Multer (in-memory storage) for resume (PDF) uploads
- CORS configured for the main GitHub Pages / production site

### Frontend
- EJS templating
- Custom CSS design system matching Really Real Education's branding (Inter typography, scoped `.volunteer-page` styles to avoid clashing with the main site)
- Vanilla JS for dynamic form field toggling (technical vs. non-technical roles)

### Deployment
- Backend: Render
- Database: Neon (PostgreSQL)
- Frontend: Integrated into Really Real Education's GitHub Pages site via an interstitial page

---

## ✨ Features

- 📝 **Volunteer application form** with conditional fields:
  - Common fields: name, email, contact number, how the volunteer wants to contribute
  - Technical applicants additionally provide: resume (PDF), GitHub profile, LinkedIn profile, and an optional portfolio link
- 📄 **Resume uploads** stored directly in PostgreSQL as binary data (`BYTEA`), served back to admins as inline PDFs
- 🔐 **Admin authentication** via Passport.js local strategy, with hashed credentials and session-based login
- 📊 **Admin dashboard** to review all applicants:
  - Summary stats (total applicants, technical vs. non-technical, resumes submitted)
  - Expandable rows for full applicant detail (contribution, GitHub, LinkedIn, portfolio)
  - One-click resume viewing in-browser
- ✅ **Submission confirmation page** shown after a successful application
- 📱 Responsive, branded UI consistent with the main Really Real Education site

---

## ⚙️ How It Works

1. A prospective volunteer fills out the form at the portal's entry point (embedded into the main site)
2. Depending on the selected role (**Technical** / **Non-Technical**), additional required fields appear dynamically
3. On submission, the form data (and resume, if applicable) is sent to `/submit`
4. The backend validates the payload and inserts it into the `users` table in PostgreSQL (Neon)
5. The applicant sees a confirmation page
6. Admins log in at `/admin/login` and view all applications on a dashboard at `/admin/applicants`, including inline resume viewing

---

## 🗄 Database Schema

```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    mobile VARCHAR(20),
    volunteer_type VARCHAR(50),
    contribution TEXT,
    resume BYTEA,
    github TEXT,
    linkedin TEXT,
    portfolio TEXT,
    submitted_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🧪 Run Locally

### 1. Clone the repository

### 2. Install dependencies
```
npm install
```

### 3. Set up environment variables
Copy `.env.example` to `.env` and fill in real values:
```
DATABASE_URL=""
SESSION_SECRET=""
ADMIN_EMAIL=""
ADMIN_PASSWORD_HASH=""
```
`ADMIN_PASSWORD_HASH` should be a bcrypt hash of the admin password, not the plaintext password.

### 4. Set up the database
Run `schema.sql` against your PostgreSQL instance (e.g. a Neon database) to create the `users` table.

### 5. Run the server
```
node index.js
```
The server runs on `process.env.PORT` (defaults to `5000`).

### 6. Open the app
Visit `http://localhost:5000/` for the volunteer form, or `http://localhost:5000/admin/login` for the admin dashboard.

---

## 🔐 Routes Overview

| Route | Method | Description |
|---|---|---|
| `/` | GET | Volunteer application form |
| `/submit` | POST | Handles form submission + resume upload |
| `/admin/login` | GET / POST | Admin login page and authentication |
| `/admin/applicants` | GET | Admin dashboard (requires authentication) |
| `/resume/:id` | GET | Serves an applicant's resume as an inline PDF (requires authentication) |

---

## ⚠️ Important Notes

- Cross-origin session cookies require `secure: true`, `sameSite: "none"`, and `app.set("trust proxy", 1)` — all already configured for the production deployment behind Render.
- CORS is locked to `https://reallyrealeducation.org` — update the allowed origin if the portal is embedded elsewhere.
- Resumes are stored as `BYTEA` in Postgres rather than on disk, keeping the deployment stateless and compatible with Render's ephemeral filesystem.
- Because the main Really Real Education site is static (GitHub Pages) and this portal is a separate dynamic backend, an interstitial cold-start page is used to handle Render free-tier spin-up delays gracefully.

---

## 🐛 Common Issues

### ❌ Admin login fails despite correct credentials
- Confirm `ADMIN_PASSWORD_HASH` in `.env` is a bcrypt hash, not plaintext
- Confirm `ADMIN_EMAIL` matches exactly (case-sensitive)

### ❌ Session doesn't persist / admin gets logged out immediately
- Cross-origin cookies require HTTPS in production — this won't work correctly over plain `http://` locally without adjusting cookie settings
- Ensure `trust proxy` is set correctly for your hosting environment

### ❌ CORS errors from the frontend
- Verify the requesting origin matches the `cors()` configuration in `index.js` exactly, with no trailing slash mismatch

### ❌ Resume upload fails
- Only PDF files under 5MB are accepted (enforced via Multer's `fileFilter` and `limits`)

---

## 🔮 Future Improvements

- 📧 Email notifications to admins on new submissions
- 🔍 Search and filter functionality on the admin dashboard
- 📤 Export applicant data to CSV
- 🧾 Applicant status tracking (e.g. reviewed, contacted, onboarded)
- 🌐 Multi-role admin access with permission levels

---

## 🏢 About

Built for **Jalte Diye Foundation**, in support of **Really Real Education**'s volunteer recruitment efforts.

---

## 📜 License

This project is maintained for Jalte Diye Foundation / Really Real Education and is not licensed for general public reuse without permission.
