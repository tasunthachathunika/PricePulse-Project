import React, { useState } from 'react';
import axios from 'axios';
import forgotPasswordBg from '../assets/forgot_password_bg.jpg';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            // Backend API call
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
            const res = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
            setMessage("Check your email! Password reset link sent.");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to send email. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: `url(${forgotPasswordBg})` }}
        >
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 border border-white/50">

                <h2 className="text-3xl font-bold mb-4 text-slate-800 text-center">Forgot Password?</h2>
                <p className="mb-6 text-slate-600 text-center text-sm">
                    Enter your email address and we'll send you a link to reset your password.
                </p>

                {message && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm text-center">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-2">Email Address</label>
                        <input
                            type="email"
                            placeholder="example@email.com"
                            className="w-full p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 bg-white"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full font-bold py-3 rounded-lg transition duration-300 ${loading ? "bg-orange-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700 text-white"}`}
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>

                <p className="mt-6 text-center text-slate-600 text-sm">
                    Remembered your password?{' '}
                    <Link to="/login" className="text-orange-600 hover:underline font-bold">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;