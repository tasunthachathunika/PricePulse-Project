import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FaShieldAlt, FaLock, FaCheckDouble, FaEye, FaEyeSlash, FaArrowRight, FaArrowLeft, FaCircleNotch } from 'react-icons/fa';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token'); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            alert('❌ Passwords do not match!');
            return;
        }

        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
            const response = await fetch(`${API_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword })
            });

            const data = await response.json();

            if (response.ok) {
                alert('✅ Password changed successfully!');
                navigate('/login');
            } else {
                alert('❌ Error: ' + (data.message || data.error));
            }
        } catch (error) {
            alert('❌ Server connection failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-slate-50 via-white to-orange-50 min-h-screen flex items-center justify-center p-6 font-sans">
            <div className="bg-white rounded-[2rem] shadow-2xl shadow-orange-500/10 p-8 sm:p-12 max-w-md w-full relative overflow-hidden border border-slate-100">
                
                {/* Top Orange Bar Decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-gradient-to-r from-orange-400 to-red-500 rounded-b-full"></div>

                {/* Header Icon & Title */}
                <div className="text-center mb-10 mt-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-orange-50 text-orange-500 mb-6 shadow-sm border border-orange-100 rotate-3 hover:rotate-6 transition-transform duration-300">
                        <FaShieldAlt className="text-3xl drop-shadow-sm" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">New Password</h2>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-[280px] mx-auto">
                        Create a strong password to secure your account.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* New Password Field */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">New Password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-orange-500">
                                <FaLock className="text-slate-400 text-lg group-focus-within:text-orange-500 transition-colors" />
                            </div>
                            <input 
                                type={showPassword ? "text" : "password"}
                                required minLength="6"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder-slate-400 font-bold text-slate-700 text-sm shadow-inner"
                                placeholder="••••••••"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-orange-500 cursor-pointer transition-colors focus:outline-none">
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-orange-500">
                                <FaCheckDouble className="text-slate-400 text-lg group-focus-within:text-orange-500 transition-colors" />
                            </div>
                            <input 
                                type={showPassword ? "text" : "password"}
                                required minLength="6"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder-slate-400 font-bold text-slate-700 text-sm shadow-inner"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit"
                        disabled={loading}
                        className={`w-full text-white font-bold py-4 rounded-2xl shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-3 text-sm tracking-wide ${loading ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-orange-500 to-red-600'}`}
                    >
                        {loading ? (
                            <>
                                <FaCircleNotch className="animate-spin text-lg" /> Updating...
                            </>
                        ) : (
                            <>
                                Update Password <FaArrowRight />
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center mt-10 pt-6 border-t border-slate-100">
                    <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-orange-600 transition-colors uppercase tracking-wider group">
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;