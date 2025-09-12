# Connect Campus Frontend

A modern, scalable networking platform connecting students and alumni from top Tier 1 and Tier 2 colleges in India.

## Features
- College email verification for students, alumni verification for graduates
- Searchable alumni directory (by college, branch, year, domain, company, skills, location)
- Real-time messaging (direct and group chats) with Socket.io
- Social community feed (posts, images, hashtags, likes, comments, pinning)
- Job and internship board with resume drop and application flow
- Referral request system with status tracking
- Event module (webinars, guest lectures, alumni meets, RSVP, calendar sync)
- Moderation tools (reporting, blocking, admin dashboard)
- Minimalistic, modern, responsive, and accessible UI
- Dark mode support

## Tech Stack
- **Frontend:** React, Tailwind CSS, React Router, React Query, Socket.io-client
- **Backend:** Node.js, Express, MongoDB, Socket.io, Firebase Auth/Auth0 (see `/Backend`)
- **Media/Uploads:** Cloudinary
- **Deployment:** Vercel (frontend), Render/AWS (backend)

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn

### Installation
```bash
cd Frontend
npm install
```

### Running the App
```bash
npm start
```
The app will run at [http://localhost:3000](http://localhost:3000).

### Building for Production
```bash
npm run build
```

## Folder Structure
```
Frontend/
  ├── public/
  │   └── index.html
  ├── src/
  │   ├── components/
  │   │   ├── Auth/
  │   │   │   └── ProtectedRoute.js
  │   │   ├── Layout/
  │   │   ├── UI/
  │   │   │   ├── Button.js
  │   │   │   ├── Input.js
  │   │   │   └── LoadingSpinner.js
  │   ├── contexts/
  │   │   ├── AuthContext.js
  │   │   ├── ThemeContext.js
  │   │   └── SocketContext.js
  │   ├── pages/
  │   │   ├── LandingPage.js
  │   │   ├── Auth/
  │   │   │   ├── LoginPage.js
  │   │   │   ├── RegisterPage.js
  │   │   │   ├── VerifyEmailPage.js
  │   │   │   ├── ForgotPasswordPage.js
  │   │   │   └── ResetPasswordPage.js
  │   │   ├── Dashboard/
  │   │   │   └── Dashboard.js
  │   │   ├── Profile/
  │   │   │   └── ProfilePage.js
  │   │   ├── Directory/
  │   │   │   └── AlumniDirectoryPage.js
  │   │   ├── Feed/
  │   │   │   └── FeedPage.js
  │   │   ├── Messages/
  │   │   │   └── MessagesPage.js
  │   │   ├── Referrals/
  │   │   │   └── ReferralsPage.js
  │   │   ├── Jobs/
  │   │   │   └── JobsPage.js
  │   │   ├── Events/
  │   │   │   └── EventsPage.js
  │   │   └── Admin/
  │   │       └── AdminDashboard.js
  │   ├── App.js
  │   ├── index.js
  │   └── index.css
  ├── tailwind.config.js
  ├── postcss.config.js
  ├── package.json
  └── README.md
```

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](../LICENSE) 