# AeroSense Authentication System

Implemented on January 10, 2026.

## Overview
Added a comprehensive user authentication system to AeroSense, transforming it from a public-only platform to a secure, personalized application.

## Key Features
- **Secure Registration & Login**: Users can create accounts with email/password.
- **JWT Session Management**: 7-day persistent sessions using industry-standard JWT tokens.
- **Protected Routes**: All personal data (Settings, Simulations, History) is now gated behind authentication.
- **Premium UI**: A high-fidelity authentication page with glassmorphism and motion effects.
- **Session Continuity**: Automatic token verification on app load to maintain user sessions.

## Technical Details
- **Hashing**: Passlib with Bcrypt.
- **Tokens**: Python-JOSE for JWT creation and decoding.
- **Frontend**: Custom AuthContext with persistent storage and auto-verification.
- **Backend**: FastAPI Depends(get_current_user) for route protection.

## Usage
- Access `/auth` to sign in or create an account.
- The app will automatically redirect unauthenticated users to the auth page.
- Logout is available in the user profile and layout header.
