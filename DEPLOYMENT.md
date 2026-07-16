# EyeLeads — Deployment Checklist & Environment Configuration

This project is configured to deploy the **frontend on Vercel** and the **backend on Render**.

---

## ⚠️ CRITICAL RULES BEFORE DEPLOYING

- **Vite Environment Variables are Baked In at Build Time**:
  The frontend uses Vite, which compiles and bakes variables like `VITE_API_URL` directly into the static JavaScript assets during compilation.
  - You **MUST** define `VITE_API_URL` in the Vercel dashboard **BEFORE** triggering a build.
  - Changing environment variables on Vercel after a deployment has run **does nothing** until a fresh redeploy is triggered.

---

## 🌐 Frontend Environment Variables (Vercel)

Set these in Vercel project Settings → Environment Variables:

| Variable Name | Description | Example / Recommended Value |
|---|---|---|
| `VITE_API_URL` | Deployed backend API base URL | `https://api.eyeleads.com/api` (or Render backend `.onrender.com/api`) |
| `VITE_RAZORPAY_KEY_ID` | Public Razorpay key ID | `rzp_live_...` (or `rzp_test_...` for staging) |

---

## 🖥️ Backend Environment Variables (Render / Host)

Set these in the Render/Host Environment configuration:

| Variable Name | Description |
|---|---|
| `NODE_ENV` | Must be set to `production` |
| `JWT_SECRET` | Secret string for encoding JWTs |
| `MONGODB_URI` | MongoDB Atlas live database connection string |
| `RAZORPAY_KEY_ID` | Production/Test Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | Production/Test Razorpay API secret key |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary storage cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret |
| `ADMIN_NOTIFICATION_EMAIL` | Email where admin notifications/prescriptions are sent |
| `CLIENT_URL` | The live deployed frontend domain (e.g. `https://eyeleads.com`) |
| `BACKEND_URL` | The live deployed backend domain (e.g. `https://api.eyeleads.com`) |
