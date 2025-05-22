// src/pages/LoginPage.jsx
import { SignIn } from '@clerk/clerk-react';
import './LoginPage.css';

export default function LoginPage() {
  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Admin Sign In</h1>
        <SignIn
          routing="path"
          path="/login"
          signUpUrl="/register"
          afterSignInUrl="/dashboard"
        />
      </div>
    </div>
  );
}
