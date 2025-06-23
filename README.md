# MoneyMate 💰

<div align="center">
  <img src="./assets/images/icon.png" alt="MoneyMate Logo" width="120" height="120">
  
  **A modern, secure loan management application built with React Native and Expo**
  
  [![React Native](https://img.shields.io/badge/React%20Native-0.79.4-blue.svg)](https://reactnative.dev/)
  [![Expo SDK](https://img.shields.io/badge/Expo-53.0.12-black.svg)](https://expo.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
  [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Development](#-development)
- [Building](#-building)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

## 🌟 Overview

MoneyMate is a comprehensive loan management application designed to help users track, manage, and analyze their loans with ease. Built with React Native and Expo, it provides a seamless cross-platform experience with robust security features and intuitive design.

### Key Highlights

- 🔐 **Secure Authentication** with Clerk integration
- 📊 **Interactive Analytics** with beautiful charts and statistics
- 💾 **Reliable Data Management** using Prisma ORM
- 🎨 **Modern UI/UX** with Material Design principles
- 🔒 **Biometric Security** support for enhanced protection
- 📱 **Cross-Platform** compatibility (iOS, Android, Web)

## ✨ Features

### Core Functionality

- **Loan Management**: Add, edit, and track multiple loans
- **Payment Processing**: Record payments and track payment history
- **Analytics Dashboard**: Visual insights into loan statistics
- **Document Management**: Upload and manage payment proofs
- **Notification System**: Payment reminders and alerts
- **Profile Management**: User profile and preferences

### Security Features

- **Authentication**: Secure login with Clerk
- **Biometric Authentication**: Fingerprint and face recognition
- **Data Encryption**: Secure storage of sensitive information
- **Session Management**: Automatic logout and session handling

### User Experience

- **Dark Theme**: Modern dark UI with professional design
- **Responsive Design**: Optimized for all screen sizes
- **Offline Support**: Core functionality available offline
- **Performance Optimized**: Efficient caching and data management

## 🛠 Tech Stack

### Frontend

- **React Native** 0.79.4 - Cross-platform mobile framework
- **Expo** 53.0.12 - Development platform and build tools
- **TypeScript** 5.8.3 - Type-safe JavaScript
- **React Native Paper** 5.12.1 - Material Design components
- **Expo Router** 5.1.0 - File-based navigation

### Backend & Database

- **Prisma** 6.9.0 - Database ORM and query builder
- **Expo API Routes** - Serverless API endpoints

### Authentication & Security

- **Clerk** 2.11.4 - Authentication and user management
- **Expo Secure Store** - Encrypted local storage
- **Expo Local Authentication** - Biometric authentication

### UI & Animation

- **React Native Reanimated** 3.17.4 - Smooth animations
- **React Native Gesture Handler** 2.24.0 - Touch interactions
- **React Native Chart Kit** 6.12.0 - Data visualization
- **React Native SVG** 15.11.2 - Vector graphics

### Development Tools

- **Metro** 0.82.3 - JavaScript bundler
- **EAS CLI** 16.12.0 - Build and deployment
- **ESLint** - Code linting and formatting

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **EAS CLI** (`npm install -g eas-cli`)

### For Mobile Development

- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)

### For Database

- **PostgreSQL** or **SQLite** (depending on your setup)

## 🚀 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/moneymate.git
   cd moneymate
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Configure the following variables in your `.env` file:

   ```env
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
   DATABASE_URL=your_database_url
   ```

4. **Set up the database**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

## 🔧 Development

### Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Start on Android emulator/device
- `npm run ios` - Start on iOS simulator/device
- `npm run web` - Start web development server
- `npm run build` - Build the project for production

### Development Workflow

1. **Start the development server**

   ```bash
   npm start
   ```

2. **Run on your preferred platform**

   - Scan QR code with Expo Go app
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Press `w` for web browser

3. **Database operations**
   ```bash
   npx prisma studio  # Open database browser
   npx prisma generate  # Regenerate Prisma client
   npx prisma db push  # Push schema changes
   ```

## 📱 Building

### Development Build

```bash
eas build --profile development --platform android
eas build --profile development --platform ios
```

### Production Build

```bash
eas build --profile production --platform android
eas build --profile production --platform ios
```

### Local Build (Android)

```bash
eas build --local --platform android --profile development
```

## 📁 Project Structure

```
moneymate/
├── app/                          # App screens and routes
│   ├── (tabs)/                   # Tab-based navigation
│   │   ├── index.tsx             # Home/Dashboard screen
│   │   ├── profile.tsx           # Profile screen
│   │   └── stats.tsx             # Statistics screen
│   ├── api/                      # API routes
│   │   ├── loans+api.ts          # Loan management API
│   │   ├── add-loan+api.ts       # Add loan API
│   │   └── loan-stats+api.ts     # Statistics API
│   ├── _layout.tsx               # Root layout
│   ├── add-loan.tsx              # Add loan screen
│   └── loan-details.tsx          # Loan details screen
├── components/                   # Reusable UI components
│   ├── LoanCard.tsx              # Loan display component
│   ├── SummaryCards.tsx          # Dashboard summary
│   ├── PaymentModal.tsx          # Payment form modal
│   └── ...                       # Other components
├── context/                      # React Context providers
│   └── ThemeContext.tsx          # Theme management
├── types/                        # TypeScript type definitions
│   ├── loan.ts                   # Loan-related types
│   └── navigation.ts             # Navigation types
├── utils/                        # Utility functions
│   ├── db.ts                     # Database utilities
│   ├── cache.ts                  # Caching utilities
│   └── useLoanStats.ts           # Statistics hooks
├── prisma/                       # Database schema and migrations
│   └── schema.prisma             # Prisma schema
├── assets/                       # Static assets
│   ├── fonts/                    # Custom fonts
│   └── images/                   # Images and icons
└── Configuration Files
    ├── app.json                  # Expo configuration
    ├── eas.json                  # EAS Build configuration
    ├── package.json              # Dependencies and scripts
    └── tsconfig.json             # TypeScript configuration
```

## 🔌 API Documentation

### Loan Management

#### Get All Loans

```http
GET /api/loans
```

#### Add New Loan

```http
POST /api/add-loan
Content-Type: application/json

{
  "borrowerName": "string",
  "amount": "number",
  "interestRate": "number",
  "startDate": "string",
  "endDate": "string"
}
```

#### Get Loan Statistics

```http
GET /api/loan-stats
```

#### Update Loan Payment

```http
POST /api/payment-proof/[id]
Content-Type: multipart/form-data

{
  "amount": "number",
  "paymentDate": "string",
  "proof": "file"
}
```

### User Profile

#### Get User Profile

```http
GET /api/user-profile
```

## 🔐 Security

MoneyMate implements multiple layers of security:

### Authentication

- **Clerk Integration**: Secure user authentication and session management
- **Biometric Authentication**: Fingerprint and face recognition support
- **Session Timeout**: Automatic logout for inactive sessions

### Data Protection

- **Encrypted Storage**: Sensitive data encrypted using Expo Secure Store
- **HTTPS Only**: All network communications use HTTPS
- **Input Validation**: Comprehensive validation on all user inputs
- **SQL Injection Prevention**: Parameterized queries with Prisma ORM

### Privacy

- **Local Data Storage**: Sensitive data stored locally when possible
- **Minimal Data Collection**: Only necessary data is collected
- **Data Anonymization**: Personal data is anonymized in analytics

## 🤝 Contributing

We welcome contributions to MoneyMate! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests and linting**
   ```bash
   npm run lint
   npm run test
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Code Style

- Follow TypeScript best practices
- Use meaningful component and variable names
- Add JSDoc comments for complex functions
- Maintain consistent indentation and formatting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

If you encounter any issues or have questions:

- **Create an issue** on GitHub
- **Check the documentation** for common solutions
- **Review existing issues** for similar problems

---

<div align="center">
  Made with ❤️ by the MoneyMate Team
  
  **[Website](https://moneymate.app) • [Documentation](https://docs.moneymate.app) • [Support](https://support.moneymate.app)**
</div>
