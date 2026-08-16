import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

// Firebase & Icons
import { auth, googleProvider } from "../firebase";
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { FaArrowLeft } from "react-icons/fa";

// Assets
import logo from "../assets/logo.png";
import img1 from "../assets/feature_1.png";
import img2 from "../assets/feature_2.png";
import img3 from "../assets/feature_3.png";
import img4 from "../assets/feature_4.png";
import img5 from "../assets/feature_5.png";

const Signup = () => {
    const navigate = useNavigate();
    const images = [img1, img2, img3, img4, img5];
    const [currentIndex, setCurrentIndex] = useState(0);

    // Form States
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(interval);
    }, [images.length]);

    // --- 2. GOOGLE SIGNUP ---
    const handleGoogleAuth = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
            const res = await axios.post(`${API_URL}/api/auth/google`, {
                name: user.displayName, email: user.email, img: user.photoURL
            });

            // Success Popup & Redirect
            alert("Google Signup Successful! Redirecting...");
            localStorage.setItem("userInfo", JSON.stringify(res.data.user));
            localStorage.setItem("userEmail", res.data.user.email);
            localStorage.setItem("userName", res.data.user.name);
            navigate("/dashboard");

        } catch (error) {
            console.error(error);
            alert("Google Sign In Failed");
        }
    };

    // --- 1. MANUAL SIGNUP ---
    const handleEmailSignup = async (e) => {
        e.preventDefault();
        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
            const res = await axios.post(`${API_URL}/api/auth/register`, {
                name, email, password
            });

            // Success Popup & Redirect
            alert("Registration Successful! Redirecting to Dashboard...");
            localStorage.setItem("userInfo", JSON.stringify(res.data));
            localStorage.setItem("userEmail", res.data.email);
            localStorage.setItem("userName", res.data.name);
            navigate("/dashboard");

        } catch (error) {
            alert(error.response?.data?.message || "Signup Failed");
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-white">

            {/* --- LEFT SIDE: IMAGE SLIDER --- */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900">
                {images.map((img, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out
              ${index === currentIndex ? "opacity-100 scale-110" : "opacity-0 scale-100"}
            `}
                        style={{ backgroundImage: `url(${img})` }}
                    />
                ))}
                <div className="absolute inset-0 bg-slate-900/40"></div>
                <div className="absolute inset-0 flex flex-col justify-center px-16 text-white z-10">
                    <h1 className="text-5xl font-bold mb-6 drop-shadow-xl leading-tight">
                        Join the <br /> Revolution.
                    </h1>
                    <p className="text-lg text-slate-200 max-w-md drop-shadow-md">
                        Create an account to unlock exclusive deals, price tracking features, and personalized alerts.
                    </p>
                </div>
            </div>

            {/* --- RIGHT SIDE: SIGNUP FORM --- */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 relative">

                {/* 1. BACK BUTTON */}
                <Link
                    to="/"
                    className="absolute top-8 left-8 flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-slate-600 font-semibold hover:border-orange-500 hover:text-orange-600 shadow-sm hover:shadow-lg transition-all duration-300 group z-50"
                >
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-orange-100 transition-colors duration-300">
                        <FaArrowLeft className="text-sm transition-transform group-hover:-translate-x-0.5" />
                    </div>
                    <span className="pr-2">Back</span>
                </Link>

                <div className="max-w-[400px] w-full">

                    {/* 2. LOGO AREA */}
                    <div className="flex flex-col items-center mb-8">
                        <img src={logo} alt="PricePulse Logo" className="h-12 w-auto mb-4 object-contain" />
                        <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
                        <p className="text-slate-500 mt-2 text-center">Start saving money today!</p>
                    </div>

                    <button
                        onClick={handleGoogleAuth}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold py-3.5 rounded-xl transition duration-300 shadow-sm mb-6 group"
                    >
                        <FcGoogle className="text-2xl group-hover:scale-110 transition-transform" />
                        Sign up with Google
                    </button>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-slate-400 font-medium">OR REGISTER WITH EMAIL</span>
                        </div>
                    </div>

                    <form onSubmit={handleEmailSignup} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                placeholder="name@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-orange-500/30 transform hover:-translate-y-0.5 mt-2">
                            Create Account
                        </button>
                    </form>

                    <p className="mt-8 text-center text-slate-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-orange-600 font-bold hover:underline">Login</Link>
                    </p>

                </div>
            </div>
        </div>
    );
};

export default Signup;