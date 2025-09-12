# Frontend Setup Guide

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install additional Tailwind plugins:
```bash
npm install --save-dev @tailwindcss/forms @tailwindcss/typography @tailwindcss/aspect-ratio
```

## Running the Application

1. Start the development server:
```bash
npm start
```

2. The application will be available at `http://localhost:3000`

## Fixed Issues

The following bugs have been fixed:

1. **Missing Components**: Created all missing components and pages that were imported in App.js
   - Layout component with sidebar navigation
   - All auth pages (Login, Register, VerifyEmail, ForgotPassword, ResetPassword)
   - All dashboard pages (Dashboard, Profile, AlumniDirectory, Feed, Messages, Referrals, Jobs, Events)

2. **UI Component Issues**: Fixed Button, Input, and LoadingSpinner components to use proper Tailwind CSS classes instead of undefined custom CSS classes

3. **Missing Dependencies**: Added required Tailwind CSS plugins to package.json

4. **Component Structure**: Ensured all components follow consistent patterns and use proper error handling

## New Features Added

### College Support System
- **Added NIT Agartala and IIIT Agartala** to the supported colleges list
- **Comprehensive Registration Form** with college selection including:
  - User type (Student/Alumni)
  - College/Institution selection with tier classification
  - Branch/Department selection
  - Batch year
  - Professional domain
- **"Other" College Option**: Students from other colleges can enter their college name manually
- **Centralized College Data**: Created `utils/collegeData.js` for consistent college information across the app

### Supported Colleges
**Tier 1 Colleges:**
- IIT Bombay, IIT Delhi, IIT Madras, IIT Kanpur, IIT Kharagpur
- BITS Pilani, BITS Goa, BITS Hyderabad
- IIIT Hyderabad, IIIT Bangalore

**Tier 2 Colleges:**
- NIT Trichy, NIT Surathkal, **NIT Agartala**
- DTU, NSIT
- **IIIT Agartala**
- Other colleges (custom entry)

### Registration Form Features
- **Multi-step form** with organized sections:
  - Personal Information
  - Account Security
  - Academic Information
- **Dynamic college selection** with tier information
- **Form validation** with proper error messages
- **Responsive design** for all screen sizes

## Features Implemented

- **Authentication System**: Complete login/register flow with email verification
- **Dashboard**: Overview with stats and recent activity
- **Profile Management**: Editable user profiles
- **Alumni Directory**: Searchable directory of alumni from all supported colleges
- **Social Feed**: Post creation and interaction
- **Messaging**: Real-time messaging system
- **Job Board**: Job listings and applications
- **Events**: Event management and registration
- **Referrals**: Referral tracking system

## Backend Integration

The frontend is configured to connect to the backend at `http://localhost:5000` (proxy setting in package.json).

Make sure the backend server is running before testing the frontend features.

## College Data Management

The college data is centralized in `src/utils/collegeData.js` and includes:
- College names with tier classification
- Location information
- Utility functions for college operations
- Branch and domain options

To add new colleges, simply update the `collegeOptions` array in the utility file.

## Usage Instructions

1. **Registration**: Users can now select from the predefined list of colleges or choose "Other" to enter a custom college name
2. **College Tiers**: Colleges are classified as Tier 1 or Tier 2 for better organization
3. **Dynamic Forms**: The registration form adapts based on user selections
4. **Validation**: All form fields have proper validation and error handling 