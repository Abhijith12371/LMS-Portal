# LMS Portal — API Reference

Base URL (dev): `http://localhost:5000/api`

All protected routes require: `Authorization: Bearer <jwt_token>`

---

## Authentication `/api/auth`

### POST `/api/auth/register`
**Body:**
```json
{ "name": "Jane Doe", "email": "jane@example.com", "password": "secret123", "role": "student" }
```
**Response 201:**
```json
{ "success": true, "token": "eyJ...", "user": { "_id": "...", "name": "Jane Doe", "role": "student" } }
```

### POST `/api/auth/login`
**Body:** `{ "email": "...", "password": "..." }`
**Response 200:** same as register

### GET `/api/auth/me`  🔒
**Response 200:** `{ "success": true, "user": { ... } }`

### POST `/api/auth/forgot-password`
**Body:** `{ "email": "jane@example.com" }`
**Response 200:** `{ "success": true, "message": "Reset link sent..." }`

### PUT `/api/auth/reset-password/:token`
**Body:** `{ "password": "newSecret123" }`

### PUT `/api/auth/change-password`  🔒
**Body:** `{ "currentPassword": "...", "newPassword": "..." }`

---

## Users `/api/users`

### GET `/api/users`  🔒 Admin
**Query:** `page, limit, role, search`
**Response:** `{ "success": true, "total": 150, "users": [...] }`

### GET `/api/users/:id`  🔒
### GET `/api/users/instructors`  Public

### PUT `/api/users/profile`  🔒
**Body:** `{ "name": "...", "bio": "...", "website": "...", "social": { "twitter": "..." } }`

### PUT `/api/users/avatar`  🔒
**Body:** FormData with `avatar` file field

### PATCH `/api/users/:id/role`  🔒 Admin
**Body:** `{ "role": "instructor" }`

### DELETE `/api/users/:id`  🔒 Admin
Soft-deactivates the user.

---

## Courses `/api/courses`

### GET `/api/courses`  Public
**Query params:**
| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Per page (default: 12) |
| `sort` | string | `-createdAt`, `-enrollmentCount`, `-averageRating`, `price` |
| `search` | string | Full-text search |
| `category` | string | Filter by category |
| `level` | string | Beginner / Intermediate / Advanced |
| `isFree` | boolean | Free courses only |
| `minPrice` | number | Min price filter |
| `maxPrice` | number | Max price filter |

**Response 200:**
```json
{
  "success": true, "total": 240, "page": 1, "pages": 20,
  "courses": [{ "_id": "...", "title": "...", "price": 29.99, "averageRating": 4.7, ... }]
}
```

### GET `/api/courses/featured`  Public
### GET `/api/courses/categories`  Public
### GET `/api/courses/:id`  Public (optional auth for `isEnrolled`)

### POST `/api/courses`  🔒 Instructor/Admin
**Body:** FormData
```
title, description, shortDescription, category, level, price, language,
learningOutcomes (multiple), requirements (multiple), tags (multiple),
thumbnail (file)
```

### PUT `/api/courses/:id`  🔒 Instructor/Admin
Same fields as POST, all optional.

### DELETE `/api/courses/:id`  🔒 Instructor/Admin
### PATCH `/api/courses/:id/publish`  🔒 Instructor/Admin
**Response:** `{ "success": true, "isPublished": true, "message": "Course published" }`

---

## Enrollments `/api/enrollments`

### POST `/api/enrollments/:courseId`  🔒
For free courses or with a `paymentId` body field for paid.
**Body (paid):** `{ "paymentId": "..." }`

### GET `/api/enrollments/my`  🔒
Returns all enrollments with populated course + progress.

### GET `/api/enrollments/:courseId`  🔒
Returns enrollment with full course curriculum (for player).

### PATCH `/api/enrollments/:courseId/progress`  🔒
**Body:** `{ "lectureId": "..." }`
**Response:** `{ "success": true, "enrollment": { "progressPercent": 45, ... } }`

### GET `/api/enrollments/course/:courseId/students`  🔒 Instructor/Admin

---

## Payments `/api/payments`

### POST `/api/payments/checkout`  🔒
**Body:** `{ "courseId": "...", "couponCode": "SAVE20" }`
**Response:**
```json
{
  "success": true,
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```
*Free courses:* `{ "success": true, "free": true }`

### POST `/api/payments/webhook`
Stripe sends events here. Raw body, verified with `STRIPE_WEBHOOK_SECRET`.
Handles: `checkout.session.completed`, `checkout.session.expired`

### GET `/api/payments/my`  🔒
### GET `/api/payments`  🔒 Admin

---

## Coupons `/api/coupons`

### POST `/api/coupons/validate`  🔒
**Body:** `{ "code": "SAVE20", "courseId": "...", "price": 49.99 }`
**Response:**
```json
{
  "success": true,
  "coupon": {
    "code": "SAVE20", "discountType": "percentage", "discountValue": 20,
    "discountAmount": 9.99, "finalPrice": 40.00
  }
}
```

### GET `/api/coupons`  🔒 Admin
### POST `/api/coupons`  🔒 Admin
**Body:**
```json
{
  "code": "SAVE20", "discountType": "percentage", "discountValue": 20,
  "expiresAt": "2026-12-31T23:59:59Z", "usageLimit": 100, "minOrderValue": 0
}
```
### PUT `/api/coupons/:id`  🔒 Admin
### DELETE `/api/coupons/:id`  🔒 Admin

---

## Reviews `/api/reviews`

### GET `/api/reviews/course/:courseId`  Public
**Query:** `page, limit, sort`
### POST `/api/reviews/course/:courseId`  🔒 (must be enrolled)
**Body:** `{ "rating": 5, "comment": "Excellent course!" }`
### PUT `/api/reviews/:id`  🔒 (own user)
### DELETE `/api/reviews/:id`  🔒 (own user or admin)
### POST `/api/reviews/:id/reply`  🔒 Instructor/Admin
**Body:** `{ "comment": "Thank you for your review!" }`

---

## Analytics `/api/analytics`

### GET `/api/analytics/admin`  🔒 Admin
**Response:**
```json
{
  "success": true,
  "stats": { "totalUsers": 1240, "totalCourses": 85, "totalEnrollments": 4300, "totalRevenue": 28450.00 },
  "charts": {
    "revenueByMonth": [{ "_id": { "month": 4, "year": 2026 }, "revenue": 4200, "count": 42 }],
    "studentsByMonth": [...],
    "usersByRole": [{ "_id": "student", "count": 1100 }, ...]
  },
  "topCourses": [...]
}
```

### GET `/api/analytics/instructor`  🔒 Instructor/Admin

---

## Notifications `/api/notifications`

### GET `/api/notifications`  🔒
**Query:** `page, limit`
**Response:** `{ "success": true, "unreadCount": 3, "notifications": [...] }`
### PATCH `/api/notifications/:id/read`  🔒
### PATCH `/api/notifications/read-all`  🔒
### DELETE `/api/notifications/:id`  🔒

---

## Error Response Format

All errors follow this shape:
```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": [{ "field": "email", "message": "Valid email required" }]
}
```

## HTTP Status Codes Used
| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (wrong role) |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
