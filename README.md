# 📚 LMS Portal — Production-Ready Learning Management System

A full-featured, production-grade Learning Management System built with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js) + TailwindCSS + Redux Toolkit + Stripe.

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (or local MongoDB)
- Stripe account (for payments)
- Cloudinary account (for media uploads)

---

## ⚙️ Backend Setup

```bash
cd backend
npm install

# Copy env template and fill in values
cp .env.example .env

# Start development server
npm run dev
```

### Backend `.env` Configuration
| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Random secret (min 32 chars) |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `SMTP_USER` | Gmail address for emails |
| `SMTP_PASS` | Gmail app password |
| `CLIENT_URL` | Frontend URL (`http://localhost:5173`) |

---

## 🎨 Frontend Setup

```bash
cd frontend
npm install

# Create env file
echo "VITE_STRIPE_PUBLIC_KEY=pk_test_your_key_here" > .env

# Start development server
npm run dev
```

Frontend runs on **http://localhost:5173**

---

## 🧩 Demo Accounts

After seeding (or registering manually), use these demo accounts in the Login page:

| Role | Email | Password |
|---|---|---|
| Student | student@lms.com | password123 |
| Instructor | instructor@lms.com | password123 |
| Admin | admin@lms.com | password123 |

---

## 📁 Project Structure

```
LMS Portal/
├── backend/
│   ├── config/          # DB & Cloudinary config
│   ├── controllers/     # Business logic (10 controllers)
│   ├── middlewares/     # Auth, authorize, error, upload, validate
│   ├── models/          # Mongoose schemas (9 models)
│   ├── routes/          # Express routers (10 route files)
│   ├── server.js        # App entry point
│   └── .env.example     # Environment template
│
├── frontend/
│   ├── src/
│   │   ├── components/  # 11 reusable UI components
│   │   ├── hooks/       # useAuth, useCourses, useDebounce
│   │   ├── pages/       # 20+ pages across all roles
│   │   ├── services/    # Axios API service layer
│   │   ├── store/       # Redux Toolkit slices
│   │   ├── App.jsx      # Router + protected routes
│   │   ├── index.css    # Global styles + Tailwind
│   │   └── main.jsx     # React entry point
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── docs/
    ├── design_document.md
    ├── ppt_content.md
    └── api_reference.md
```

---

## 🌐 API Endpoints

| Prefix | Description |
|---|---|
| `POST /api/auth/register` | Register new user |
| `POST /api/auth/login` | Login |
| `GET  /api/courses` | List/search courses |
| `POST /api/courses` | Create course (instructor) |
| `POST /api/payments/checkout` | Stripe checkout |
| `POST /api/payments/webhook` | Stripe webhook |
| `POST /api/coupons/validate` | Validate coupon code |
| `GET  /api/analytics/admin` | Admin stats |

Full API reference: see [`docs/api_reference.md`](./docs/api_reference.md)

---

## 🚀 Deployment

### Backend → Render / Railway
1. Push `backend/` to a GitHub repo
2. Create new web service on **Render** or **Railway**
3. Set all `.env` variables in the dashboard
4. Build command: `npm install`
5. Start command: `node server.js`

### Frontend → Vercel / Netlify
1. Push `frontend/` to a GitHub repo
2. Import on **Vercel** (auto-detects Vite)
3. Set `VITE_STRIPE_PUBLIC_KEY` environment variable
4. Set `VITE_API_URL` if not using Vite proxy (update `services/api.js` baseURL)

### Stripe Webhook (Production)
```bash
stripe listen --forward-to https://your-api.onrender.com/api/payments/webhook
```
Copy the webhook secret into `STRIPE_WEBHOOK_SECRET`.

### MongoDB Atlas
1. Create free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create database user and whitelist IP
3. Copy connection string to `MONGODB_URI`

---

## 🔐 Security Features
- **bcryptjs** — Password hashing (salt rounds: 12)
- **JWT** — Stateless authentication (7-day expiry)
- **Helmet** — Security headers
- **express-mongo-sanitize** — NoSQL injection prevention
- **express-rate-limit** — Brute force protection
- **express-validator** — Input validation
- **Role-based access** — Student / Instructor / Admin guards

---

## 💡 Bonus Features Implemented
- ⭐ Course ratings & reviews (with instructor reply)
- 📊 Admin analytics dashboard (Recharts graphs)
- 🔔 Notifications system (in-app bell)
- 🎫 Coupon system (% and fixed discounts)
- 📈 Instructor dashboard with revenue tracking
- 🎓 Course progress tracking (per lecture)
