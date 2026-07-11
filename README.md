# 🏥 Doctor Consultation App

A modern, full-stack telemedicine platform that connects patients with doctors for virtual consultations. Built with **TypeScript**, **Next.js**, **Express**, and **MongoDB**, this application provides a seamless experience for booking appointments, conducting video consultations, and managing medical records.

**Live Demo:** [doctor-consultation-app-beta.vercel.app](https://doctor-consultation-app-beta.vercel.app)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Development](#development)
- [Deployment](#deployment)

---

## 🎯 Overview

The Doctor Consultation App is a comprehensive telemedicine platform designed to simplify healthcare accessibility. Patients can browse verified doctors, book appointments at convenient times, and conduct secure video/voice consultations. Doctors can manage their profiles, schedules, and consultations while tracking revenue and patient satisfaction metrics.

### Key Objectives
- **Accessibility**: Enable patients to find and consult with doctors remotely
- **Efficiency**: Streamline appointment booking and consultation scheduling
- **Security**: Ensure secure authentication and data privacy
- **Scalability**: Built with modern cloud-native technologies
- **Monetization**: Integrated payment processing via Stripe

---

## ✨ Features

### For Patients
- 🔍 **Doctor Discovery**: Search and filter doctors by specialization, location, fees, and experience
- 📅 **Appointment Booking**: Real-time slot availability and easy booking
- 💬 **Video/Voice Consultations**: Live consultations via Zego cloud SDK
- 💳 **Secure Payments**: Stripe integration for appointment payments
- 📋 **Medical History**: Track medical records and consultation history
- 🔐 **Profile Management**: Manage emergency contacts and medical information
- 🔑 **Google OAuth**: Quick authentication via Google

### For Doctors
- ⚙️ **Profile Customization**: Detailed professional information, qualifications, and specialization
- 📅 **Schedule Management**: Set availability ranges, daily time slots, and slot duration
- 📊 **Dashboard**: Real-time metrics on patients, revenue, and appointments
- 👥 **Patient Management**: Access patient medical history during consultations
- 📝 **Consultation Notes**: Add prescriptions and clinical notes post-consultation
- 💰 **Revenue Tracking**: Monitor completed appointments and total earnings
- 🔑 **Google OAuth**: Seamless sign-in experience

### General Features
- 🔐 **JWT Authentication**: Secure token-based authentication
- 🛡️ **Security**: Helmet, CORS, input validation, password hashing (bcryptjs)
- 📝 **Logging**: Morgan for HTTP request logging
- ✅ **Input Validation**: Express-validator for request validation
- 🌐 **CORS Support**: Configured for multiple origins

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.5.9
- **UI Library**: React 18.3.1
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **UI Components**: Radix UI, Lucide React icons
- **Date Handling**: date-fns
- **Animation**: Framer Motion
- **Video Conferencing**: Zego UIKit Prebuilt
- **Payments**: Stripe React (@stripe/react-stripe-js)

### Backend
- **Runtime**: Node.js
- **Framework**: Express 5.2.1
- **Language**: JavaScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js (Google OAuth 2.0), JWT
- **Validation**: Express-validator
- **Security**: Helmet, bcryptjs
- **Payments**: Stripe SDK
- **Logging**: Morgan
- **Monitoring**: dotenv for environment management

### Database
- **MongoDB**: NoSQL document database
- **Collections**: Doctors, Patients, Appointments
- **Indexing**: Unique indexes on critical fields

---

## 🏗️ Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Pages: Auth | Dashboard | Doctor List | Consultations    │   │
│  │ Components: UI Components via Radix UI & Lucide          │   │
│  │ State: Zustand Store for global state management         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP/REST API
                          ▼
┌────────────────────────────────────────────────────────────────┐
│                   Backend API (Express.js)                     │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Routes:                                                │    │
│  │ • /api/auth - Authentication & OAuth                   │    │
│  │ • /api/doctor - Doctor profiles & management           │    │
│  │ • /api/patient - Patient profiles & management         │    │
│  │ • /api/appointment - Appointment booking & management  │    │
│  │ • /api/payment - Payment processing                    │    │
│  └────────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Middleware:                                            │    │
│  │ • Authentication (JWT verification)                    │    │
│  │ • Authorization (Role-based access)                    │    │
│  │ • Validation (Input sanitization)                      │    │
│  │ • Security (Helmet, CORS)                              │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────┬──────────────────────────────────────┘
                          │ MongoDB Driver
                          ▼
┌────────────────────────────────────────────────────────────────┐
│                    MongoDB Database                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Doctors     │  │  Patients    │  │ Appointments │          │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤          │
│  │ profile info │  │ personal     │  │ scheduling   │          │
│  │ availability │  │ medical info │  │ payment info │          │
│  │ fees         │  │ records      │  │ consultation │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                  External Services Integration                 │
│  ┌─────────────────────────┬──────────────────────────────┐    │
│  │   Stripe Payment API    │   Zego Video SDK             │    │
│  │   • Payment Processing  │   • Video Conferencing       │    │
│  │   • Payment Intent      │   • Room Management          │    │
│  │   • Transaction Confirm │   • Media Streaming          │    │
│  └─────────────────────────┴──────────────────────────────┘    │
│  ┌─────────────────────────┐                                   │
│  │   Google OAuth 2.0      │                                   │
│  │   • Social Login        │                                   │
│  │   • Profile Mapping     │                                   │
│  └─────────────────────────┘                                   │
└────────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

#### 1. **Authentication Flow**
```
User → Google OAuth / Email-Password → Passport/bcryptjs → JWT Token
                                                    ↓
                                        User Data + Role Stored
```

#### 2. **Doctor Discovery & Booking Flow**
```
Patient → Search/Filter Doctors → Fetch from MongoDB → Display Available Slots
                                        ↓
                                  Render Doctor List
                                        ↓
                                  Patient Selects Slot
                                        ↓
                                 Book Appointment
```

#### 3. **Payment Processing Flow**
```
Patient → Create Payment Intent → Stripe API → Confirm Payment
                                        ↓
                                  Update Appointment
                                        ↓
                                  Payment Status: Paid
```

#### 4. **Consultation Flow**
```
Appointment Time → Update Status to "In Progress" 
                        ↓
                   Fetch Zego Room ID
                        ↓
                   Initialize Video Conference
                        ↓
                   Doctor & Patient Join Call
                        ↓
                   End Call → Mark as "Completed"
                        ↓
                   Doctor Adds Prescription/Notes
```

---

## 📁 Project Structure

```
Doctor-Consultation-App/
├── frontend/                           # Next.js Application
│   ├── app/                            # Next.js App Router
│   │   ├── (auth)/                     # Authentication routes
│   │   ├── (dashboard)/                # Dashboard routes
│   │   ├── consultation/               # Consultation pages
│   │   ├── doctors/                    # Doctor listing & detail
│   │   └── layout.tsx                  # Root layout
│   ├── components/                     # Reusable components
│   ├── lib/                            # Utility functions
│   ├── public/                         # Static assets
│   ├── package.json
│   └── tailwind.config.ts              # Tailwind configuration
│
├── backend/                            # Express.js API Server
│   ├── server.js                       # Entry point
│   ├── package.json
│   ├── .env.example                    # Environment template
│   │
│   ├── routes/                         # API Routes
│   │   ├── auth.js                     # Authentication endpoints
│   │   ├── doctor.js                   # Doctor management
│   │   ├── patient.js                  # Patient management
│   │   ├── appointments.js             # Appointment CRUD
│   │   └── payments.js                 # Payment processing
│   │
│   ├── modal/                          # MongoDB Schemas (Models)
│   │   ├── Doctor.js                   # Doctor schema
│   │   ├── Patient.js                  # Patient schema
│   │   └── Appointment.js              # Appointment schema
│   │
│   ├── middleware/                     # Custom middleware
│   │   ├── auth.js                     # JWT authentication
│   │   ├── validate.js                 # Input validation
│   │   └── response.js                 # Response formatting
│   │
│   ├── config/                         # Configuration files
│   │   └── passport.js                 # Passport strategies
│   │
│   ├── utils/                          # Utility functions
│   │   └── date.js                     # Date utilities
│   │
│   └── logs/                           # Application logs

```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud - MongoDB Atlas)
- npm or yarn
- Stripe account (for payment processing)
- Google OAuth credentials
- Zego Cloud account (for video conferencing)

### Environment Variables

#### Backend (.env)
```env
# Server
PORT=8000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# JWT
JWT_SECRET=your-jwt-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# OpenAI (for AI features, if applicable)
OPENAI_API_KEY=sk_...
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
NEXT_PUBLIC_ZEGO_APP_ID=your-zego-app-id
NEXT_PUBLIC_ZEGO_SERVER_SECRET=your-zego-server-secret
```

### Installation Steps

#### Backend Setup
```bash
cd backend
npm install
# Create .env file with the variables above
npm run dev  # Start development server (uses nodemon)
```

#### Frontend Setup
```bash
cd frontend
npm install
# Create .env.local file with the variables above
npm run dev  # Start Next.js dev server on http://localhost:3000
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000

---

## 📡 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Authentication Endpoints

#### Register Doctor
```http
POST /auth/doctor/register
Content-Type: application/json

{
  "name": "Dr. John Doe",
  "email": "doctor@example.com",
  "password": "securepass123"
}

Response: { token, user: { id, type: "doctor" } }
```

#### Login Doctor
```http
POST /auth/doctor/login
Content-Type: application/json

{
  "email": "doctor@example.com",
  "password": "securepass123"
}

Response: { token, user: { id, type: "doctor" } }
```

#### Register Patient
```http
POST /auth/patient/register
Content-Type: application/json

{
  "name": "Jane Patient",
  "email": "patient@example.com",
  "password": "securepass123"
}

Response: { token, user: { id, type: "patient" } }
```

#### Google OAuth
```http
GET /auth/google?type=patient
# Redirects to Google login, then to callback endpoint
```

### Doctor Endpoints

#### Get Doctor List (with filters)
```http
GET /doctor/list?search=cardio&specialization=Cardiologist&city=Mumbai&minFees=500&maxFees=2000&sortBy=fees&page=1&limit=20
Authorization: Bearer {token}

Response: {
  items: [ { id, name, specialization, fees, hospitalInfo, ... } ],
  page: 1,
  limit: 20,
  total: 150
}
```

#### Get Doctor Profile
```http
GET /doctor/me
Authorization: Bearer {token}

Response: { id, name, specialization, fees, profileImage, ... }
```

#### Update Doctor Profile (Onboarding)
```http
PUT /doctor/onboarding/update
Authorization: Bearer {token}
Content-Type: application/json

{
  "specialization": "Cardiologist",
  "qualification": "MBBS, MD",
  "experience": 10,
  "fees": 1500,
  "hospitalInfo": {
    "name": "City Hospital",
    "address": "123 Main St",
    "city": "Mumbai"
  },
  "availabilityRange": {
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "excludedWeekdays": [0, 6]  // Sunday, Saturday
  },
  "dailyTimeRanges": [
    { "start": "09:00", "end": "12:00" },
    { "start": "14:00", "end": "17:00" }
  ],
  "slotDurationMinutes": 30
}
```

#### Get Doctor Dashboard
```http
GET /doctor/dashboard
Authorization: Bearer {token}

Response: {
  user: { name, fees, specialization, ... },
  stats: {
    totalPatients: 45,
    todayAppointments: 3,
    totalRevenue: 45000,
    completedAppointments: 120
  },
  todayAppointments: [ ... ],
  upcomingAppointments: [ ... ],
  performance: { patientSatisfaction, completionRate, responseTime }
}
```

### Appointment Endpoints

#### Book Appointment
```http
POST /appointment/book
Authorization: Bearer {token}
Content-Type: application/json

{
  "doctorId": "doctor_id_here",
  "date": "2024-03-15",
  "slotStartIso": "2024-03-15T10:00:00Z",
  "slotEndIso": "2024-03-15T10:30:00Z",
  "consultationType": "Video Consultation",
  "symptoms": "Chest pain",
  "consultationFees": 1500,
  "platformFees": 50,
  "totalAmount": 1550
}

Response: { id, doctorId, patientId, status: "Scheduled", ... }
```

#### Get Patient Appointments
```http
GET /appointment/patient?status=Scheduled&from=2024-01-01&to=2024-12-31&sortBy=date&sortOrder=asc
Authorization: Bearer {token}

Response: [
  {
    id, doctorId, patientId, date, status, 
    consultationType, totalAmount, paymentStatus, ...
  }
]
```

#### Get Booked Slots
```http
GET /appointment/booked-slots/{doctorId}/{date}
Authorization: Bearer {token}

Response: [
  { start: "2024-03-15T10:00:00Z", end: "2024-03-15T10:30:00Z" }
]
```

#### Join Consultation
```http
GET /appointment/join/{appointmentId}
Authorization: Bearer {token}

Response: {
  appointmentId, zegoRoomId, consultationType,
  doctor: { id, name },
  patient: { id, name }
}
```

#### End Consultation (Doctor Only)
```http
PUT /appointment/end/{appointmentId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "prescription": "Aspirin 100mg daily",
  "notes": "Patient advised for follow-up"
}

Response: { id, status: "Completed", prescription, notes, ... }
```

### Payment Endpoints

#### Create Payment Intent
```http
POST /payment/create-payment-intent
Authorization: Bearer {token}
Content-Type: application/json

{
  "appointmentId": "appointment_id_here"
}

Response: {
  clientSecret: "pi_...",
  amount: 1550,
  currency: "INR"
}
```

#### Confirm Payment
```http
POST /payment/confirm-payment
Authorization: Bearer {token}
Content-Type: application/json

{
  "appointmentId": "appointment_id_here",
  "paymentIntentId": "pi_..."
}

Response: { id, paymentStatus: "Paid", paymentDate, ... }
```

---

## 🗄️ Database Schema

### Doctor Schema
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (hashed),
  googleId: String (sparse, unique),
  profileImage: String,
  
  specialization: String (enum: [Cardiologist, Dermatologist, ...]),
  category: [String] (enum: [Primary Care, Mental Health, ...]),
  qualification: String,
  experience: Number,
  age: Number,
  about: String,
  fees: Number,
  
  hospitalInfo: {
    name: String,
    address: String,
    city: String
  },
  
  availabilityRange: {
    startDate: String (YYYY-MM-DD),
    endDate: String (YYYY-MM-DD),
    excludedWeekdays: [Number] // 0-6 (Sun-Sat)
  },
  dailyTimeRanges: [
    {
      start: String (HH:mm),
      end: String (HH:mm)
    }
  ],
  slotDurationMinutes: Number (default: 30),
  
  isVerified: Boolean (default: false),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Patient Schema
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (hashed),
  googleId: String (sparse, unique),
  profileImage: String,
  
  phone: String,
  dob: Date,
  age: Number (auto-computed from dob),
  gender: String (enum: [male, female, other]),
  bloodGroup: String (enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]),
  
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  
  medicalHistory: {
    allergies: String,
    currentMedications: String,
    chronicConditions: String
  },
  
  isVerified: Boolean (default: false),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Appointment Schema
```javascript
{
  _id: ObjectId,
  doctorId: ObjectId (ref: Doctor),
  patientId: ObjectId (ref: Patient),
  
  date: Date,
  slotStartIso: String (ISO 8601),
  slotEndIso: String (ISO 8601),
  
  consultationType: String (enum: [Video Consultation, Voice Call], default: Video Consultation),
  status: String (enum: [Scheduled, In Progress, Completed, Cancelled], default: Scheduled),
  symptoms: String,
  zegoRoomId: String,
  prescription: String,
  notes: String,
  
  // Payment Information
  consultationFees: Number (required),
  platformFees: Number (required),
  totalAmount: Number (required),
  paymentStatus: String (enum: [Pending, Paid, Refunded], default: Pending),
  paymentMethod: String (default: Online),
  paymentDate: Date,
  
  // Stripe Payment Fields
  stripePaymentIntentId: String,
  
  // Razorpay Fields (optional)
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  
  // Payout
  payoutStatus: String (enum: [Pending, Paid, Cancelled], default: Pending),
  payoutDate: Date,
  
  createdAt: Date,
  updatedAt: Date,
  
  // Indexes
  // Unique index on (doctorId, date, slotStartIso)
}
```

---

## 🔐 Authentication

### JWT-Based Authentication
- Tokens expire in 7 days
- Token includes: `{ id, type }` (type: "doctor" or "patient")
- Stored in Authorization header: `Bearer {token}`

### Role-Based Access Control (RBAC)
```javascript
// Middleware example
router.get('/me', authenticate, requireRole('doctor'), async (req, res) => {
  // Only authenticated doctors can access
});
```

### Google OAuth 2.0 Flow
1. User clicks "Sign in with Google"
2. Redirected to `/auth/google?type=patient`
3. Google authentication page
4. Passport validates and creates/updates user
5. Callback redirects to frontend with JWT token and user data

### Password Security
- Passwords hashed using bcryptjs (salt rounds: 12)
- Pre-save hook automatically hashes modified passwords
- Never stored in plain text

---

## 🛠️ Development

### Available Scripts

**Backend:**
```bash
npm run dev    # Start with nodemon (hot reload)
npm start      # Start production server
npm test       # Run tests
```

**Frontend:**
```bash
npm run dev    # Start dev server on http://localhost:3000
npm run build  # Build for production
npm start      # Start production server
```

### Debugging
- Backend: Use console.log or debugger with Node inspector
- Frontend: Chrome DevTools for React debugging
- MongoDB: Use MongoDB Compass for data inspection

### Code Style
- Use `.prettierrc` and `.eslintrc` for consistent formatting
- TypeScript for type safety (frontend)
- JavaScript with JSDoc comments (backend)

---

## 📦 Deployment

### Frontend Deployment (Vercel)
```bash
# Already configured for Vercel
git push origin main  # Auto-deploys from main branch

# Environment variables needed in Vercel:
# NEXT_PUBLIC_API_URL
# NEXT_PUBLIC_STRIPE_PUBLIC_KEY
# NEXT_PUBLIC_ZEGO_APP_ID
# NEXT_PUBLIC_ZEGO_SERVER_SECRET
```

### Backend Deployment (Heroku/Railway/Render)

**Option 1: Heroku**
```bash
heroku create your-app-name
git push heroku main
heroku config:set KEY=value  # Set environment variables
```

**Option 2: Railway/Render**
- Connect GitHub repository
- Set environment variables in dashboard
- Auto-deploy on push

### Database Deployment
- Use MongoDB Atlas for cloud MongoDB
- Create cluster and get connection URI
- Set `MONGO_URI` in backend environment

### SSL/TLS
- Automatic with Vercel (frontend)
- Use Let's Encrypt for backend (if self-hosted)
- Ensure HTTPS for production

---

## 📞 Support & Contribution

For issues and feature requests, please open an issue on GitHub.

### Contributing
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

## 🚀 Roadmap

- [ ] AI-powered symptom checker
- [ ] Appointment reminders (SMS/Email)
- [ ] Doctor ratings and reviews
- [ ] Prescription management system
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Telemedicine guidelines integration

---

## 👥 Team & Contact

**Developer**: Sumit Kumar  
**GitHub**: [@SumitKumar-2004](https://github.com/SumitKumar-2004)

---

**Last Updated**: July 2026

Made with ❤️ for better healthcare accessibility.
