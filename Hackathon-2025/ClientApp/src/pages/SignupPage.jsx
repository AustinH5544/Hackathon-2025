﻿"use client"

import { useState } from "react"
import api from "../api"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import "./SignupPage.css"
import EyeOpen from "../assets/eye-open.svg";
import EyeClosed from "../assets/eye-closed.svg";

const SignupPage = () => {
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [membership, setMembership] = useState("")
    const [showPwd, setShowPwd] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Client-side validation (mirrors server rules)
        const uname = username.trim()
        const usernameRe = /^[a-z0-9._-]{3,24}$/ // a–z, 0–9, dot, underscore, hyphen
        if (!usernameRe.test(uname)) {
            alert("Username must be 3–24 chars: a–z, 0–9, dot, underscore or hyphen.")
            return
        }

        if (password !== confirm) {
            alert("Passwords don't match")
            return
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters.")
            return
        }

        const basic = /^(?=.*[A-Za-z])(?=.*\d).+$/
        if (!basic.test(password)) {
            alert("Password should include both letters and numbers.")
            return
        }

        if (!membership) {
            alert("Please select a membership plan.")
            return
        }

        if (membership === "free") {
            // Free flow — create the account immediately
            try {
                const { data } = await api.post("/auth/signup", {
                    email,
                    username: uname,
                    password,
                    membership,
                })

                // If your backend requires email verification before issuing a token
                if (data?.requiresVerification) {
                    alert("Account created! Please verify your email to continue.")
                    navigate("/login")
                    return
                }

                // If backend returns a token directly, keep this for convenience
                login(data)
                navigate("/profile")
            } catch (err) {
                console.error(err)
                const msg = err?.response?.data?.message || err?.response?.data || "Signup failed"
                alert(msg)
            }
        } else {
            // Paid flow — start Stripe Checkout; include username so backend can use it after success
            try {
                const { data } = await api.post("/payments/create-checkout-session", {
                    email,
                    username: uname,
                    membership,
                })
                window.location.href = data.checkoutUrl
            } catch (err) {
                console.error(err)
                alert("Error starting payment session")
            }
        }
    }

    return (
        <div className="signup-page">
            <div className="stars"></div>
            <div className="small-clouds"></div>
            <div className="clouds"></div>

            <div className="signup-container">
                <div className="signup-header">
                    <h1 className="signup-title">Join the Magic</h1>
                    <p className="signup-subtitle">Start creating personalized bedtime stories for your little ones</p>
                </div>

                <form onSubmit={handleSubmit} className="signup-form">
                    {/* Username */}
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            placeholder="Choose a username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            pattern="^[a-z0-9._-]{3,24}$"
                            title="3–24 chars: a–z, 0–9, dot, underscore, hyphen"
                        />
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-with-toggle">
                            <input
                                id="password"
                                className="input"
                                type={showPwd ? "text" : "password"}
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="toggle-visibility"
                                aria-label={showPwd ? "Hide password" : "Show password"}
                                aria-pressed={showPwd}
                                onClick={() => setShowPwd(s => !s)}
                                title={showPwd ? "Hide password" : "Show password"}
                            >
                                <img
                                    src={showPwd ? EyeClosed : EyeOpen}
                                    alt=""
                                    className="icon-eye"
                                    width="22"
                                    height="22"
                                />
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="form-group">
                        <label htmlFor="confirm">Confirm Password</label>
                        <div className="input-with-toggle">
                            <input
                                id="confirm"
                                className="input"
                                type={showConfirm ? "text" : "password"}
                                placeholder="Confirm your password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="toggle-visibility"
                                aria-label={showConfirm ? "Hide confirmation" : "Show confirmation"}
                                aria-pressed={showConfirm}
                                aria-controls="confirm"
                                onClick={() => setShowConfirm((s) => !s)}
                                title={showConfirm ? "Hide confirmation" : "Show confirmation"}
                            >
                                <img
                                    src={showConfirm ? EyeClosed : EyeOpen}
                                    alt=""
                                    className="icon-eye"
                                    width="22"
                                    height="22"
                                    draggable="false"
                                />
                            </button>
                        </div>
                    </div>

                    {/* Plan selection */}
                    <div className="form-group">
                        <label htmlFor="membership">Choose Your Plan</label>
                        <div className="membership-options">
                            <div
                                className={`membership-card ${membership === "free" ? "selected" : ""}`}
                                onClick={() => setMembership("free")}
                            >
                                <div className="plan-icon">📖</div>
                                <h3>Free</h3>
                                <p className="plan-price">$0/month</p>
                                <p className="plan-description">Perfect for trying out our service</p>
                                <ul className="plan-features">
                                    <li>✓ 1 personalized story</li>
                                    <li>✓ Basic customization</li>
                                    <li>✓ Digital format only</li>
                                </ul>
                                <input
                                    type="radio"
                                    name="membership"
                                    value="free"
                                    checked={membership === "free"}
                                    onChange={(e) => setMembership(e.target.value)}
                                    style={{ display: "none" }}
                                />
                            </div>

                            <div
                                className={`membership-card ${membership === "pro" ? "selected" : ""}`}
                                onClick={() => setMembership("pro")}
                            >
                                <div className="plan-icon">✨</div>
                                <h3>Pro</h3>
                                <p className="plan-price">$4/month</p>
                                <p className="plan-description">Great for regular storytelling</p>
                                <ul className="plan-features">
                                    <li>✓ 5 stories per month</li>
                                    <li>✓ Advanced customization</li>
                                    <li>✓ High-quality illustrations</li>
                                    <li>✓ Download & share</li>
                                </ul>
                                <input
                                    type="radio"
                                    name="membership"
                                    value="pro"
                                    checked={membership === "pro"}
                                    onChange={(e) => setMembership(e.target.value)}
                                    style={{ display: "none" }}
                                />
                            </div>

                            <div
                                className={`membership-card premium ${membership === "premium" ? "selected" : ""}`}
                                onClick={() => setMembership("premium")}
                            >
                                <div className="plan-badge">Most Popular</div>
                                <div className="plan-icon">🌟</div>
                                <h3>Premium</h3>
                                <p className="plan-price">$8/month</p>
                                <p className="plan-description">Perfect for families who love stories</p>
                                <ul className="plan-features">
                                    <li>✓ 11 stories per month</li>
                                    <li>✓ Premium illustrations</li>
                                    <li>✓ Multiple characters</li>
                                    <li>✓ Print-ready format</li>
                                    <li>✓ Priority support</li>
                                </ul>
                                <input
                                    type="radio"
                                    name="membership"
                                    value="premium"
                                    checked={membership === "premium"}
                                    onChange={(e) => setMembership(e.target.value)}
                                    style={{ display: "none" }}
                                />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="signup-button">
                        <span className="button-icon">🚀</span>
                        <span>Start My Journey</span>
                    </button>
                </form>

                <div className="signup-footer">
                    <p>
                        Already have an account? <a href="/login">Sign in here</a>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default SignupPage