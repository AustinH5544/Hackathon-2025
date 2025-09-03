﻿"use client"

import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import api from "../api"
import "./ResetPasswordPage.css"

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [token, setToken] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        const emailParam = searchParams.get("email")
        const tokenParam = searchParams.get("token")

        if (emailParam && tokenParam) {
            setEmail(emailParam)
            setToken(tokenParam)
        } else {
            setError("Invalid reset link. Please request a new password reset.")
        }
    }, [searchParams])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (newPassword !== confirmPassword) {
            setError("Passwords don't match.")
            return
        }

        if (newPassword.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }
        // require at least letters and numbers (light-touch)
        const basic = /^(?=.*[A-Za-z])(?=.*\d).+$/;
        if (!basic.test(newPassword)) {
            alert("Use letters and numbers for better security.");
            return;
        }

        setIsLoading(true)

        try {
            await api.post("/auth/reset-password", {
                email,
                token,
                newPassword,
            })
            setIsSuccess(true)
        } catch (err) {
            console.error("Reset password error:", err)
            const message =
                err?.response?.data?.message || "Invalid or expired reset token. Please request a new password reset."
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="reset-password-page">
                <div className="stars"></div>
                <div className="twinkling"></div>
                <div className="clouds"></div>

                <div className="reset-password-container">
                    <div className="success-content">
                        <div className="success-icon">🎉</div>
                        <h1 className="success-title">Password Reset Successfully!</h1>
                        <p className="success-message">
                            Your password has been updated. You can now sign in with your new password.
                        </p>

                        <div className="success-actions">
                            <button onClick={() => navigate("/login")} className="sign-in-btn">
                                <span className="button-icon">🔮</span>
                                <span>Sign In Now</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="reset-password-page">
            <div className="stars"></div>
            <div className="twinkling"></div>
            <div className="clouds"></div>

            <div className="reset-password-container">
                <div className="reset-password-header">
                    <button onClick={() => navigate("/login")} className="back-button">
                        <span>←</span> Back to Sign In
                    </button>
                    <h1 className="reset-password-title">Set New Password</h1>
                    <p className="reset-password-subtitle">Enter your new password below</p>
                </div>

                <form onSubmit={handleSubmit} className="reset-password-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input id="email" type="email" value={email} disabled className="form-input disabled" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="newPassword">New Password</label>
                        <input
                            id="newPassword"
                            type="password"
                            placeholder="Enter your new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                            className="form-input"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm your new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                            className="form-input"
                            disabled={isLoading}
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            <span className="error-icon">⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <button type="submit" className="reset-button" disabled={isLoading || !email || !token}>
                        {isLoading ? (
                            <>
                                <div className="loading-spinner">
                                    <div className="spinner"></div>
                                </div>
                                <span>Updating Password...</span>
                            </>
                        ) : (
                            <>
                                <span className="button-icon">🔒</span>
                                <span>Update Password</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="reset-password-footer">
                    <div className="security-tips">
                        <div className="security-icon">🛡️</div>
                        <div className="security-content">
                            <h4>Password Security Tips</h4>
                            <ul className="tips-list">
                                <li>Use at least 8 characters</li>
                                <li>Include uppercase and lowercase letters</li>
                                <li>Add numbers and special characters</li>
                                <li>Avoid common words or personal information</li>
                            </ul>
                        </div>
                    </div>

                    <div className="alternative-options">
                        <p>
                            Need help? <a href="mailto:support@StarlitStories.com">Contact our support team</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ResetPasswordPage