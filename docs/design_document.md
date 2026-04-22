# LMS Portal — Design Document

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                        │
│  React.js + Redux Toolkit + TailwindCSS + React Router  │
│  (Vite Dev Server — port 5173)                          │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS / REST API
┌──────────────────────▼──────────────────────────────────┐
│                    API GATEWAY (Express.js)              │
│  Helmet │ CORS │ Rate Limiter │ Morgan Logger            │
│  /api/auth  /api/courses  /api/payments  /api/coupons   │
│  /api/users /api/enrollments /api/reviews /api/analytics│
└────────┬─────────────────────────┬───────────────────────┘
         │                         │
┌────────▼──────────┐   ┌──────────▼──────────────────────┐
│  MongoDB Atlas     │   │  Third-Party Services           │
│  (Mongoose ODM)   │   │  • Stripe (payments)            │
│  9 collections:   │   │  • Cloudinary (media)           │
│  users, courses,  │   │  • Nodemailer (email)           │
│  sections,        │   └─────────────────────────────────┘
│  lectures,        │
│  enrollments,     │
│  payments,        │
│  coupons,         │
│  reviews,         │
│  notifications    │
└───────────────────┘
```

---

## 2. Database ER Diagram

```
User ──────────────────── Course (instructor ref)
 │                          │
 │                          ├── Section ── Lecture
 │                          │
 ├── Enrollment ────────────┘ (userId + courseId)
 │     └── (progressPercent, completedLectures[])
 │
 ├── Payment ──────────── Course
 │     └── (Stripe sessionId, amount, status)
 │                           │
 ├── Review ─────────────────┘ (userId + courseId, rating)
 │
 ├── Notification (userId, type, message, isRead)
 │
 └── Coupon (code, discountType, expiresAt, usedBy[])
```

### Index Strategy
| Collection | Indexes |
|---|---|
| User | `email` (unique), `role` |
| Course | `text(title,desc,tags)`, `category+isPublished`, `instructor` |
| Enrollment | `userId+courseId` (unique) |
| Review | `userId+courseId` (unique), `course` |
| Notification | `userId+isRead`, `createdAt` |

---

## 3. API Design

### Auth Routes `/api/auth`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | ❌ | Register new user |
| POST | `/login` | ❌ | Login → JWT |
| GET | `/me` | ✅ | Get current user |
| POST | `/forgot-password` | ❌ | Send reset email |
| PUT | `/reset-password/:token` | ❌ | Reset password |
| PUT | `/change-password` | ✅ | Change password |

**Register Request:**
```json
{ "name": "John Doe", "email": "john@example.com", "password": "secret123", "role": "student" }
```
**Login Response:**
```json
{ "success": true, "token": "eyJ...", "user": { "_id": "...", "name": "John", "role": "student" } }
```

### Course Routes `/api/courses`
| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/` | ❌ | - | List + search courses |
| GET | `/featured` | ❌ | - | Featured courses |
| GET | `/categories` | ❌ | - | Category list with counts |
| GET | `/:id` | OPT | - | Course detail |
| POST | `/` | ✅ | instructor,admin | Create course |
| PUT | `/:id` | ✅ | instructor,admin | Update course |
| DELETE | `/:id` | ✅ | instructor,admin | Delete course |
| PATCH | `/:id/publish` | ✅ | instructor,admin | Toggle publish |

**Query Params (GET /):** `page, limit, sort, search, category, level, isFree, minPrice, maxPrice`

### Payment Routes `/api/payments`
| Method | Path | Auth | Description |
|---|---|---|
| POST | `/checkout` | ✅ | Create Stripe session |
| POST | `/webhook` | ❌ (Stripe sig) | Handle Stripe events |
| GET | `/my` | ✅ | Order history |
| GET | `/` | ✅ Admin | All payments |

**Checkout Request:**
```json
{ "courseId": "...", "couponCode": "SAVE20" }
```
**Checkout Response:**
```json
{ "success": true, "sessionId": "cs_...", "url": "https://checkout.stripe.com/..." }
```

### Coupon Routes `/api/coupons`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/validate` | ✅ | Validate + calculate discount |
| GET | `/` | ✅ Admin | List coupons |
| POST | `/` | ✅ Admin | Create coupon |
| PUT | `/:id` | ✅ Admin | Update coupon |
| DELETE | `/:id` | ✅ Admin | Delete coupon |

**Validate Request:**
```json
{ "code": "SAVE20", "courseId": "...", "price": 49.99 }
```
**Validate Response:**
```json
{
  "success": true,
  "coupon": { "code": "SAVE20", "discountType": "percentage", "discountValue": 20,
              "discountAmount": 9.99, "finalPrice": 40.00 }
}
```

---

## 4. Tech Stack Justification

| Technology | Choice | Reason |
|---|---|---|
| **MongoDB** | NoSQL document store | Flexible schema for courses with nested sections/lectures; horizontal scaling |
| **Mongoose** | ODM for MongoDB | Schema validation, middleware hooks, virtual fields |
| **Express.js** | REST API framework | Minimal, fast, large ecosystem |
| **React.js** | Frontend SPA | Component model fits LMS UI complexity; ecosystem maturity |
| **Redux Toolkit** | State management | Standardizes async thunks; DevTools support; prevents prop drilling |
| **TailwindCSS** | CSS framework | Utility-first allows rapid, consistent UI without CSS files per component |
| **Vite** | Build tool | 10–100× faster HMR than CRA; native ESM |
| **JWT** | Authentication | Stateless; scales horizontally; no server-side session storage |
| **bcryptjs** | Password hashing | Industry-standard; adaptive cost factor |
| **Stripe** | Payments | PCI-compliant; webhook-driven; excellent documentation |
| **Cloudinary** | Media storage | Automatic video transcoding; CDN delivery; image transformations |
| **Recharts** | Charts | React-native; responsive; declarative API |

---

## 5. Scalability Considerations

### Horizontal Scaling
- **Stateless JWT** — No session store required; any API instance can authenticate any request
- **MongoDB Atlas** — Managed sharding, auto-scaling, read replicas
- **Cloudinary CDN** — Static media served from edge nodes, reducing backend load

### Caching Strategy
- **Redis** (recommended add-on) — Cache course listings, featured courses, and analytics aggregations
- **HTTP Cache-Control** — Static assets cached at CDN level via Vite build

### Performance
- **Mongoose indexes** — Text indexes for full-text search; compound indexes for enrollment lookups
- **Pagination** — All list endpoints accept `page` + `limit` params
- **Debounced search** — Frontend debounces 400ms before firing search request
- **Lazy loading** — React Router + Vite code splitting per route

### Async Jobs (Future)
- BullMQ + Redis for email delivery, PDF certificate generation, analytics aggregation

---

## 6. Security Practices

| Threat | Mitigation |
|---|---|
| SQL/NoSQL Injection | `express-mongo-sanitize` strips `$` and `.` from req.body/params |
| XSS | `helmet` sets `Content-Security-Policy`; React escapes JSX by default |
| CSRF | JWT in Authorization header (not cookies) — not vulnerable to CSRF |
| Brute Force | `express-rate-limit`: 20 auth requests / 15 min; 200 API requests / 15 min |
| Mass Assignment | Controllers only pick explicit allowed fields |
| Insecure Direct Object Reference | Ownership check (`course.instructor === req.user.id`) before every mutation |
| Password Storage | bcrypt with 12 salt rounds (~300ms hash time) |
| Token Leakage | `.select('-password')` on all user queries; token in header not URL |
| Stripe Webhooks | `stripe.webhooks.constructEvent` verifies signature before processing |

---

## 7. Deployment Strategy

### Development
```
Frontend:  http://localhost:5173  (Vite dev server)
Backend:   http://localhost:5000  (nodemon)
Database:  MongoDB Atlas free tier
```

### Production
```
Frontend:  Vercel (auto CI/CD from GitHub)
Backend:   Render.com / Railway (docker or native Node)
Database:  MongoDB Atlas M10+ (dedicated cluster)
Media:     Cloudinary (free 25GB)
Payments:  Stripe live keys
Email:     Resend / SendGrid (replace Nodemailer for scale)
```

### CI/CD Pipeline (Recommended)
```
GitHub Push → GitHub Actions
  ├── Lint (ESLint)
  ├── Test (Jest)
  ├── Build frontend (npm run build)
  └── Deploy:
      ├── Frontend → Vercel (auto)
      └── Backend  → Render (webhook trigger)
```

### Environment Promotion
- `develop` branch → staging environment
- `main` branch → production environment
- Environment variables managed per-environment in Render/Vercel dashboards
