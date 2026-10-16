# CCMS — Competency Certification Management System
### Butajira City Administration

A full-stack web application for managing competency certificate applications, reviews, approvals, and digital certificate generation — built for the Ethiopian government workflow.



## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js: v22 (the backend requires Node 22)
- MongoDB: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI

### 1. Setup & Install Dependencies
Run from the project root:
```powershell
npm run install:all
```

*(Or navigate into `backend` and `frontend` folders individually and run `npm install`)*

### 2. Environment Setup

Copy `backend/.env.example` to `backend/.env` and set private values, especially `JWT_SECRET`, `SESSION_SECRET`, access codes, and SMTP credentials. For a local MongoDB installation, the example connection string can be used as-is. Never commit `.env` files.

Email delivery must be configured for applicants to receive verification and password-reset codes. Google sign-in is optional; leave both Google credential values empty to disable it.

#### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:4000/api
```

### 3. Run the Application

#### Option A: Run Both Together
From the project root:
```powershell
npm run dev
```

#### Option B: Run Separately
- Backend:
  ```powershell
  cd backend
  npm run dev
  ```
  *(Runs on `http://localhost:4000`)*

- Frontend:
  ```powershell
  cd frontend
  npm run dev
  ```
  *(Runs on `http://localhost:5173`)*

---

## ☁️ Deploying on Render

The included `render.yaml` defines a Render web service for the API and a static site for the frontend. In Render, create a Blueprint from the GitHub repository and provide the prompted secrets and connection details.

Before deploying:

1. Create a MongoDB Atlas cluster and database user. Set `MONGO_URI` in the Render API service to its connection string, using the `ccms` database. Configure Atlas Network Access to allow the Render service to connect.
2. Set a private `STAFF_ACCESS_CODE` and `ADMIN_ACCESS_CODE` in the API service.
3. Configure `RESEND_API_KEY` and `RESEND_FROM` in the API service. Render's free web services block outbound SMTP ports, so the app uses Resend's HTTPS API there. Verify a sender domain with Resend and use an address on that domain for `RESEND_FROM`. Applicant verification and password-reset flows require working email delivery.
4. Google sign-in is disabled unless valid `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL` values are configured in the API service and the callback URL is registered with Google.
5. For initial admin setup, configure `SEED_ADMIN_USERNAME` and `SEED_ADMIN_PASSWORD`, then run `npm run seed` from the backend service shell once. Keep the generated credentials private and change the password after first login.

Never commit real credentials, database URIs, or `.env` files to GitHub. If a credential was already committed or exposed, rotate it; removing it from the latest file does not erase it from Git history.

**Uploaded documents are currently stored on the API server's local disk. Render's free web services have an ephemeral filesystem, so uploaded files can be lost on restart or redeploy. Use persistent object storage and wire it into the upload middleware before relying on this deployment for real application documents.**

## 📁 Project Structure


├── backend/
│   ├── config/          # Database & Passport configuration
│   ├── controllers/     # Route handlers (application, user, report, etc.)
│   ├── cron/            # Scheduled jobs (certificate expiration check)
│   ├── middleware/      # Auth, error handling, file upload
│   ├── models/          # Mongoose schemas (Application, User, AuditLog)
│   ├── routes/          # Express route definitions
│   ├── utils/           # Helpers (PDF generator, mailer, audit logger)
│   ├── validator/       # Zod validation schemas
│   └── server.js        # App entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI (FileDrop, CameraModal, EthiopianDobPicker)
│   │   ├── pages/       # Role-based pages (Applicant, Staff, Admin)
│   │   ├── services/    # API client layer
│   │   ├── hooks/       # Custom React hooks
│   │   ├── i18n/        # Internationalization (English/Amharic)
│   │   └── utils/       # Ethiopian date conversion, reference number logic
│   └── vite.config.js   # Vite configuration
├── package.json         # Root scripts
└── README.md





## 🔑 Key Features

| Feature | Description |
||-|
| 3-Role System | Applicant → Staff Review → Admin Approval |
| Ethiopian Calendar | Native Ethiopic date picker for all date fields |
| Certificate PDF/DOCX | Auto-generated certificates with QR code verification |
| Camera Capture | Front camera (passport photo) + Back camera (document scanner) |
| Legacy Import | Digitize existing paper certificates |
| Analytics Dashboard | Real-time charts with MongoDB aggregation |
| Email Notifications | Automated status update emails via SMTP or Resend |
| Bilingual | Full English/Amharic i18n support |
| Certificate Expiration | Nightly cron job auto-expires 1-year-old certificates |



## ⚙️ Environment Variables

See `backend/.env.example` for the full list. Key variables:

| Variable | Description |
|-|-|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `STAFF_ACCESS_CODE` | Code required for staff registration |
| `ADMIN_ACCESS_CODE` | Code required for admin registration |
| `RESEND_API_KEY` / `RESEND_FROM` | Resend email API settings (recommended for Render) |
| `SMTP_USER` / `SMTP_PASS` | Optional SMTP credentials for local development |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials |



## 👥 Team

Verification Team — Butajira TVET College Internship Program, 2026
