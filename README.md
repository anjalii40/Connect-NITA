# Connect Campus - Alumni & Student Networking Platform

<div align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-blue?logo=react" alt="React Version" />
  <img src="https://img.shields.io/badge/Node.js-Express-green?logo=node.js" alt="Backend" />
  <img src="https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb" alt="Database" />
  <img src="https://img.shields.io/badge/Socket.io-Real--time-orange?logo=socket.io" alt="Real-time" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-38BDF8?logo=tailwindcss" alt="Styling" />
</div>

## Project Overview

Connect Campus is a comprehensive networking platform designed to bridge the gap between students and alumni from top-tier colleges across India. The platform facilitates meaningful connections, career opportunities, knowledge sharing, and professional growth within the academic community.

### Key Features

- **Secure Authentication**: College email verification for students, alumni verification for graduates
- **Alumni Directory**: Advanced search and filtering by college, branch, year, domain, company, skills, and location
- **Real-time Messaging**: Direct messaging and domain-based group chats with Socket.io
- **Social Community Feed**: Posts, images, hashtags, likes, comments, and content sharing
- **Job & Internship Board**: Resume drop functionality and streamlined application process
- **Referral System**: Request and manage referrals with detailed tracking and status updates
- **Event Management**: Webinars, guest lectures, alumni meets with RSVP and calendar integration
- **Moderation Tools**: Content reporting, user blocking, and admin dashboard
- **Modern UI/UX**: Responsive design with dark mode support and accessibility features

## Architecture & Tech Stack

### Frontend Technologies
- **Framework**: React 18.2.0 with functional components and hooks
- **Routing**: React Router DOM v6.15.0
- **State Management**: React Context API + useReducer
- **Styling**: Tailwind CSS v3.3.3 with custom design system
- **UI Components**: Headless UI, Heroicons, Lucide React
- **Forms**: React Hook Form v7.45.4 with validation
- **Data Fetching**: React Query v3.39.3 for server state management
- **Real-time**: Socket.io Client v4.7.2
- **Animations**: Framer Motion v10.16.4
- **File Upload**: React Dropzone v14.2.3
- **Notifications**: React Hot Toast v2.4.1
- **Date Handling**: Date-fns v2.30.0, React Datepicker v4.21.0
- **Content**: React Markdown v8.0.7, React Syntax Highlighter v15.5.0

### Backend Technologies
- **Runtime**: Node.js with Express.js v4.18.2
- **Database**: MongoDB v7.5.0 with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with bcryptjs
- **Real-time**: Socket.io v4.7.2 for live communication
- **File Upload**: Multer v1.4.5 with Cloudinary integration
- **Email Service**: Nodemailer v6.9.4 for transactional emails
- **Security**: Helmet.js, CORS, Express Rate Limiting
- **Validation**: Express Validator v7.0.1
- **Utilities**: Moment.js, UUID v9.0.0

### Database Schema

#### User Model
```javascript
{
  // Basic Information
  firstName, lastName, email, password,
  
  // User Type & Verification
  userType: ['student', 'alumni', 'admin'],
  isEmailVerified, emailVerificationToken,
  
  // College Information
  college: { name, tier: ['Tier 1', 'Tier 2'] },
  branch, batchYear,
  
  // Professional Information
  domain: ['technology', 'banking', 'consulting', 'startups', 'government', 'design', 'research', 'other'],
  currentRole, currentCompany, location,
  
  // Profile & Portfolio
  profileImage, bio, skills, portfolio: { resume, linkedin, github, personalWebsite, leetcode, codeforces, codechef },
  achievements: [{ title, description, date }],
  
  // Social Features
  connections, followers, following,
  
  // Account Status
  isActive, isBlocked, role: ['user', 'moderator', 'admin']
}
```

#### Post Model
```javascript
{
  author: ObjectId,
  content, images: [{ public_id, url }],
  hashtags: [String],
  likes: [ObjectId], comments: [CommentSchema], shares: [ShareSchema],
  isPinned, postType: ['general', 'job', 'event', 'resource', 'achievement'],
  visibility: ['public', 'college', 'domain', 'connections'],
  reportedBy: [{ user, reason, reportedAt }]
}
```

#### Job Model
```javascript
{
  postedBy: ObjectId,
  title, company, location: { city, state, country, isRemote },
  jobType: ['full-time', 'part-time', 'internship', 'contract', 'freelance'],
  domain, description, requirements: [String], responsibilities: [String],
  skills: [String], salary: { min, max, currency, isNegotiable },
  benefits: [String], applicationDeadline,
  applications: [ApplicationSchema], views: [ViewSchema], savedBy: [ObjectId],
  contactEmail, applicationLink, isReferralRequired, tags: [String]
}
```

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB (v5.0+)
- npm or yarn package manager
- Cloudinary account (for file uploads)
- Email service provider (for transactional emails)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/connect-campus.git
   cd connect-campus
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   
   # Create environment file
   cp config.env.example .env
   
   # Configure environment variables
   # Edit .env with your MongoDB URI, JWT secret, Cloudinary credentials, etc.
   ```

3. **Frontend Setup**
   ```bash
   cd ../Frontend
   npm install
   ```

### Environment Configuration

Create a `.env` file in the Backend directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/connect-campus

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd Backend
   npm run dev  # Development mode with nodemon
   # or
   npm start    # Production mode
   ```

2. **Start the Frontend Development Server**
   ```bash
   cd Frontend
   npm start
   ```

3. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/api/health

## Project Structure

```
connect-campus/
├── Backend/
│   ├── config/
│   │   ├── cloudinary.js      # Cloudinary configuration
│   │   └── database.js        # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   ├── userController.js  # User management
│   │   ├── postController.js  # Post operations
│   │   ├── messageController.js # Messaging system
│   │   ├── jobController.js   # Job board functionality
│   │   ├── eventController.js # Event management
│   │   └── referralController.js # Referral system
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication middleware
│   │   └── upload.js         # File upload handling
│   ├── models/
│   │   ├── User.js           # User schema
│   │   ├── Post.js           # Post schema
│   │   ├── Job.js            # Job schema
│   │   ├── Event.js          # Event schema
│   │   ├── Message.js        # Message schema
│   │   └── ReferralRequest.js # Referral schema
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   ├── users.js          # User routes
│   │   ├── posts.js          # Post routes
│   │   ├── messages.js       # Message routes
│   │   ├── jobs.js           # Job routes
│   │   ├── events.js         # Event routes
│   │   └── referrals.js      # Referral routes
│   ├── socket/
│   │   └── socketHandler.js  # Socket.io event handling
│   ├── utils/
│   │   └── emailService.js   # Email service configuration
│   ├── uploads/              # Local file storage
│   ├── index.js              # Main server file
│   └── package.json
├── Frontend/
│   ├── public/
│   │   └── index.html        # Main HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   └── ProtectedRoute.js # Route protection
│   │   │   ├── Jobs/
│   │   │   │   └── JobApplicationModal.js # Job application UI
│   │   │   ├── Layout/
│   │   │   │   └── Layout.js # Main layout component
│   │   │   └── UI/
│   │   │       ├── Button.js # Reusable button component
│   │   │       ├── Input.js  # Reusable input component
│   │   │       └── LoadingSpinner.js # Loading component
│   │   ├── contexts/
│   │   │   ├── AuthContext.js    # Authentication context
│   │   │   ├── SocketContext.js  # Socket.io context
│   │   │   └── ThemeContext.js   # Theme management
│   │   ├── pages/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginPage.js
│   │   │   │   ├── RegisterPage.js
│   │   │   │   ├── ForgotPasswordPage.js
│   │   │   │   ├── ResetPasswordPage.js
│   │   │   │   └── VerifyEmailPage.js
│   │   │   ├── Dashboard/
│   │   │   │   └── Dashboard.js
│   │   │   ├── Directory/
│   │   │   │   └── AlumniDirectoryPage.js
│   │   │   ├── Feed/
│   │   │   │   └── FeedPage.js
│   │   │   ├── Messages/
│   │   │   │   └── MessagesPage.js
│   │   │   ├── Jobs/
│   │   │   │   └── JobsPage.js
│   │   │   ├── Events/
│   │   │   │   └── EventsPage.js
│   │   │   ├── Referrals/
│   │   │   │   └── ReferralsPage.js
│   │   │   ├── Profile/
│   │   │   │   └── ProfilePage.js
│   │   │   └── LandingPage.js
│   │   ├── utils/
│   │   │   └── collegeData.js # College information data
│   │   ├── App.js             # Main app component
│   │   ├── index.js           # App entry point
│   │   └── index.css          # Global styles
│   ├── tailwind.config.js     # Tailwind configuration
│   ├── postcss.config.js      # PostCSS configuration
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `GET /api/auth/verify-email/:token` - Verify email
- `POST /api/auth/forgot-password` - Forgot password
- `PUT /api/auth/reset-password/:token` - Reset password
- `POST /api/auth/resend-verification` - Resend verification email

### Users
- `GET /api/users` - Get all users (with pagination and filters)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/connect/:id` - Connect with user
- `DELETE /api/users/connect/:id` - Disconnect from user
- `GET /api/users/search` - Search users

### Posts
- `GET /api/posts` - Get all posts (with pagination)
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get post by ID
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comment` - Add comment
- `POST /api/posts/:id/share` - Share post

### Messages
- `GET /api/messages/conversations` - Get user conversations
- `GET /api/messages/:conversationId` - Get conversation messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark message as read

### Jobs
- `GET /api/jobs` - Get all jobs (with filters)
- `POST /api/jobs` - Create job posting
- `GET /api/jobs/:id` - Get job by ID
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `POST /api/jobs/:id/apply` - Apply for job
- `GET /api/jobs/:id/applications` - Get job applications

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event
- `GET /api/events/:id` - Get event by ID
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/:id/rsvp` - RSVP for event

### Referrals
- `GET /api/referrals` - Get user referrals
- `POST /api/referrals` - Request referral
- `PUT /api/referrals/:id` - Update referral status
- `DELETE /api/referrals/:id` - Cancel referral request

## UI/UX Features

### Design System
- **Color Palette**: Custom primary (blue) and secondary (purple) color schemes
- **Typography**: Inter font family for clean, modern text
- **Components**: Reusable UI components with consistent styling
- **Responsive Design**: Mobile-first approach with breakpoints
- **Dark Mode**: Complete dark theme support
- **Animations**: Smooth transitions and micro-interactions with Framer Motion

### Accessibility
- WCAG 2.1 compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management

## Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcryptjs
- Rate limiting to prevent abuse
- CORS configuration
- Helmet.js for security headers
- Input validation and sanitization
- File upload security with type checking
- SQL injection prevention through Mongoose ODM

## Deployment

### Frontend (Vercel/Netlify)
1. Build the React app: `npm run build`
2. Deploy the `build` folder to your hosting platform
3. Configure environment variables for production

### Backend (Render/AWS/DigitalOcean)
1. Set up MongoDB Atlas or self-hosted MongoDB
2. Configure production environment variables
3. Deploy using your preferred platform
4. Set up SSL certificates
5. Configure domain and DNS

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=https://your-frontend-domain.com
# ... other production variables
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with love by <strong>Anjali</strong></p>
  <p>© 2024 Connect Campus. All rights reserved.</p>
</div>
