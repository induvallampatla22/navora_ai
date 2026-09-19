# NAVORA REST API Reference Manual

The NAVORA Backend provides a complete RESTful API built on FastAPI.

Interactive OpenAPI documentation is available live when running the server:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 🔐 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register new user account & send OTP | No |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT token/cookie | No |
| `POST` | `/api/auth/send-otp` | Trigger OTP generation for email/phone | No |
| `POST` | `/api/auth/verify-otp` | Validate active OTP code | No |
| `POST` | `/api/auth/2fa/setup` | Generate TOTP QR code URI for 2FA | Yes |
| `POST` | `/api/auth/2fa/verify` | Confirm and enable 2FA | Yes |
| `GET`  | `/api/auth/me` | Fetch active user profile | Yes |
| `POST` | `/api/auth/logout` | Clear auth cookies | No |

---

## 🗺️ 2. Destinations Catalog (`/api/destinations`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET`  | `/api/destinations` | List destinations with category & search filter | No |
| `GET`  | `/api/destinations/{slug_or_id}` | Fetch full destination detail & places | No |
| `POST` | `/api/destinations/saved-places` | Bookmark place to user profile | Yes |
| `GET`  | `/api/destinations/saved-places/list` | Fetch user saved places | Yes |

---

## ✈️ 3. Trips & Planning (`/api/trips`, `/api/planning`, `/api/itinerary`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/trips` | Create trip plan | Yes |
| `GET`  | `/api/trips` | List user trips | Yes |
| `GET`  | `/api/trips/{trip_id}` | Get trip detail | Yes |
| `POST` | `/api/planning/{trip_id}/generate-plans` | Generate Plan A / B / C | Yes |
| `POST` | `/api/planning/{trip_id}/select-plan` | Select & activate Plan tier | Yes |
| `GET`  | `/api/itinerary/{trip_id}` | Fetch structured itinerary timeline | Yes |

---

## 💳 4. Commerce & Bookings (`/api/bookings`, `/api/payments`, `/api/expenses`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/bookings` | Create booking (Flight, Hotel, Activity) | Yes |
| `GET`  | `/api/bookings` | List active user bookings | Yes |
| `PATCH`| `/api/bookings/{id}/cancel` | Cancel booking | Yes |
| `POST` | `/api/payments/create-order` | Create Razorpay/Stripe checkout order | Yes |
| `POST` | `/api/payments/verify` | Verify payment signature | Yes |
| `POST` | `/api/expenses` | Record shared group expense | Yes |
| `GET`  | `/api/expenses/{trip_id}/settlement` | Get minimal peer-to-peer settlement transfers | Yes |

---

## 🤖 5. AI Assistant & Orchestrator (`/api/ai`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/ai/chat` | Send query to multilingual AI orchestrator | No (Optional) |
| `POST` | `/api/ai/agent-workflow` | Trigger visual multi-agent workflow trace | No (Optional) |
