# EyeLeads — Premium Eyewear Store

Welcome to the **EyeLeads** monorepo. This is a premium e-commerce web application for prescription eyeglasses, sunglasses, computer glasses, active sports frames, and kids eyewear.

## 🚀 Tech Stack
* **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Axios, React Helmet Async
* **Backend**: Node.js, Express, MongoDB & Mongoose
* **Integrations**:
  * **Payments**: Razorpay Gateway
  * **Shipping**: Shiprocket
  * **Media Storage**: Cloudinary (for product images)
  * **Emails**: Resend / SMTP (for admin login codes & invoices)

---

## 📂 Project Structure
```
eyelead/
├── backend/            # Express REST API server
├── frontend/           # React SPA frontend (Vite)
└── README.md           # This setup guide
```

---

## 🛠️ Local Setup Instructions

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+ recommended) and [MongoDB](https://www.mongodb.com/) installed on your machine.

---

### 1. Backend Configuration

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your environment variables file:
   Copy `.env.example` to `.env` and fill in your actual credentials (MongoDB URI, JWT secret, Cloudinary keys, Razorpay keys, Shiprocket credentials, etc.):
   ```bash
   cp .env.example .env
   ```
4. Run database seeders (optional — to set up initial products and default admin account):
   ```bash
   npm run seed
   ```
   *Note: This will automatically register the admin account: `syst@elcadmin.sup`.*

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend will start listening at `http://localhost:5000`.

---

### 2. Frontend Configuration

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your environment variables file:
   Copy `.env.example` to `.env` and adjust variables if needed:
   ```bash
   cp .env.example .env
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 🌐 Production Deployment Guide

This project is configured to deploy the **frontend on Vercel** and the **backend on Render**.

### ⚠️ Critical Root Directory Configurations
Because this is a monorepo structure, you must configure the **Root Directory** setting on each hosting provider:
* **Vercel (Frontend)**: Set **Root Directory** to `frontend`.
* **Render (Backend)**: Set **Root Directory** to `backend`.

### Environmental Variables (Production Host)

#### Backend:
* `NODE_ENV=production`
* `MONGO_URI` (pointing to your live Atlas database)
* `CLIENT_URL` (your frontend live URL, e.g. `https://eyeleads.com`)
* `PROD_CLIENT_URL` (secondary frontend URL, e.g. `https://www.eyeleads.com`)
* `BACKEND_URL` (your backend API live URL, e.g. `https://api.eyeleads.com`)
* Production credentials for Razorpay, Shiprocket, Resend, and Cloudinary.

#### Frontend:
* `VITE_API_URL` (your live backend API path, e.g., `https://api.eyeleads.com/api`)
* `VITE_RAZORPAY_KEY_ID` (live Razorpay key ID)
* *Note: Vite environment variables are baked in at compile time, so they must be populated in Vercel before building.*
