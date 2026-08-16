// src/pages/Popular.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    FaSearch, FaUserCircle, FaHeart, FaRegHeart, FaFire, FaExternalLinkAlt, FaTag, FaFilter, FaSignOutAlt
} from "react-icons/fa";
import logo from "../assets/logo.png";
import Footer from "../components/Common/Footer";
import popBg1 from "../assets/popular_bg_1.png";
import popBg2 from "../assets/popular_bg_2.png";
import popBg3 from "../assets/popular_bg_3.png";

const Popular = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    // Background Slideshow Logic
    const bgImages = [popBg1, popBg2, popBg3];
    const [currentBgIndex, setCurrentBgIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBgIndex((prev) => (prev === bgImages.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(interval);
    }, [bgImages.length]);

    // User Info
    const userName = localStorage.getItem("userName");

    // Categories
    const categories = ["All", "Phones", "Audio", "Laptops"];

    // Sample Data for Fallback/Testing
    const SAMPLE_PRODUCTS = [
        {
            _id: "1",
            title: "iPhone 15 Pro Max",
            subtitle: "Blue Titanium (256GB)",
            brand: "Apple",
            site: "Wasi.lk",
            currentPrice: 415000,
            priceHistory: [{ price: 450000 }],
            image: "https://www.apple.com/newsroom/images/2023/09/apple-unveils-iphone-15-pro-and-iphone-15-pro-max/article/Apple-iPhone-15-Pro-lineup-hero-230912_Full-Bleed-Image.jpg.large.jpg",
            url: "https://wasi.lk",
            tag: "Best Seller",
            tagColor: "bg-orange-100 text-orange-800"
        },
        {
            _id: "2",
            title: "Galaxy S24 Ultra",
            subtitle: "Titanium Grey (12GB/256GB)",
            brand: "Samsung",
            site: "SimplyTek",
            currentPrice: 245000,
            priceHistory: [{ price: 285000 }],
            image: "https://images.samsung.com/is/image/samsung/p6pim/lk/sm-s928bztqxhl/gallery/lk-galaxy-s24-s928-sm-s928bztqxhl-539609783?$650_519_PNG$",
            url: "https://simplytek.lk",
            tag: "Trending",
            tagColor: "bg-yellow-100 text-yellow-800"
        },
        {
            _id: "3",
            title: "WH-1000XM5",
            subtitle: "Noise Canceling Headphones",
            brand: "Sony",
            site: "Daraz",
            currentPrice: 108000,
            priceHistory: [{ price: 125000 }],
            image: "https://www.sony.lk/image/6145c1d32e6ac8e63a46c912dc834794?fmt=pjpeg&wid=330&bgcolor=FFFFFF&bgc=FFFFFF",
            url: "https://daraz.lk",
            tag: "Price Drop",
            tagColor: "bg-red-100 text-red-800"
        },
        {
            _id: "4",
            title: "Charge 5",
            subtitle: "Portable Bluetooth Speaker",
            brand: "JBL",
            site: "Wasi.lk",
            currentPrice: 36900,
            priceHistory: [{ price: 45000 }],
            image: "https://uk.jbl.com/dw/image/v2/AAUJ_PRD/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw1d9b3252/JBL_Charge_5_Teal_Hero_1605x1605px.png?sw=537&sfrm=png&ixlib=js-2.3.2",
            url: "https://wasi.lk",
            tag: "Hot",
            tagColor: "bg-pink-100 text-pink-800"
        },
        {
            _id: "5",
            title: "Watch Ultra 2",
            subtitle: "GPS + Cellular (Titanium)",
            brand: "Apple",
            site: "SimplyTek",
            currentPrice: 255000,
            priceHistory: [{ price: 275000 }],
            image: "https://www.istore.lk/wp-content/uploads/2023/09/Apple-Watch-Ultra-2-Alpine-Loop-Blue-1.jpg",
            url: "https://simplytek.lk",
            tag: "New",
            tagColor: "bg-blue-100 text-blue-800"
        }
    ];

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchPopular = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
                const res = await axios.get(`${API_URL}/api/products/popular`);
                if (res.data.length > 0) {
                    setProducts(res.data);
                } else {
                    setProducts(SAMPLE_PRODUCTS);
                }
            } catch (error) {
                console.error("Using sample data", error);
                setProducts(SAMPLE_PRODUCTS);
            } finally {
                setLoading(false);
            }
        };
        fetchPopular();
    }, []);

    // Filter Logic
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());

        let category = "Other";
        const t = p.title.toLowerCase();
        if (t.includes("iphone") || t.includes("samsung") || t.includes("pixel")) category = "Phones";
        else if (t.includes("macbook") || t.includes("laptop")) category = "Laptops";
        else if (t.includes("headphone") || t.includes("speaker") || t.includes("buds")) category = "Audio";

        const matchesCategory = activeCategory === "All" || category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    // Logout
    const handleLogout = () => {
        if (confirm("Log out?")) {
            localStorage.clear();
            navigate("/login");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col text-slate-800 overflow-x-hidden relative selection:bg-orange-200 selection:text-orange-900">
            {/* --- PROFESSIONAL BACKGROUND (Mesh Gradient + Noise + Grid) --- */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                {/* 1. Base Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100"></div>

                {/* 2. Subtle Animated Mesh Blurs */}
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-100/40 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute top-[40%] right-[-10%] w-[40%] h-[40%] bg-orange-100/40 rounded-full blur-[100px] animate-pulse delay-700"></div>
                <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-[120px] animate-pulse delay-1000"></div>

                {/* 3. Noise Texture for Professional Finish */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>

                {/* 4. Very Subtle Grid Overlay */}
                <div className="absolute inset-0 bg-[url('https://mini-projects-assets.s3.amazonaws.com/grid-pattern.png')] opcode-5 bg-[length:40px_40px] opacity-[0.03]"></div>
            </div>

            {/* --- NAVBAR (Synced with Dashboard) --- */}
            <nav className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 shadow-xl py-4 sticky top-0 z-50 transition-all duration-300">
                <div className="container mx-auto px-6 flex flex-wrap justify-between items-center max-w-7xl relative">
                    {/* Background Texture (Subtle) */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light pointer-events-none"></div>

                    {/* Logo Area */}
                    <Link to="/" className="flex items-center gap-3 cursor-pointer group relative z-10">
                        <img src={logo} alt="PricePulse" className="h-10 w-auto drop-shadow-md group-hover:scale-105 transition duration-300" />
                    </Link>

                    {/* Centered Search Bar (Colorful Gradient) */}
                    <div className="hidden md:flex flex-1 max-w-md mx-6 relative group z-10 transition-transform duration-300 hover:scale-105">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Find your next gadget..."
                                className="w-full bg-white text-slate-800 placeholder-slate-400 border-none py-2.5 pl-10 pr-4 rounded-full focus:ring-0 focus:outline-none shadow-sm font-medium text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-500 text-sm pointer-events-none" />
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-6 relative z-10">
                        {/* Dashboard Link (Instead of Popular) */}
                        <Link
                            to="/dashboard"
                            className="hidden md:flex items-center gap-2 bg-white text-orange-600 px-5 py-2 rounded-full font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 transform active:scale-95 group/btn"
                        >
                            <FaFire className="text-orange-500 group-hover/btn:animate-bounce" />
                            Dashboard
                        </Link>

                        <div className="flex items-center gap-4 pl-6 border-l border-white/20">
                            <div className="text-right hidden md:block leading-tight">
                                <div className="font-bold text-sm text-white drop-shadow-sm">{userName || "Guest"}</div>
                                <button onClick={handleLogout} className="text-[10px] font-semibold text-white/80 hover:text-white hover:underline transition uppercase tracking-wider flex items-center justify-end gap-1 ml-auto">
                                    Log Out <FaSignOutAlt className="text-[10px]" />
                                </button>
                            </div>
                            <div className="h-11 w-11 rounded-full bg-white text-orange-600 flex items-center justify-center font-bold shadow-md border-2 border-yellow-300 text-lg hover:rotate-12 transition-transform duration-300 cursor-pointer">
                                {userName ? userName.charAt(0).toUpperCase() : <FaUserCircle />}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <section className="relative h-[600px] flex items-center overflow-hidden">

                {/* Background Slideshow with Dark Overlay */}
                <div className="absolute inset-0 w-full h-full z-0">
                    {bgImages.map((img, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out transform scale-105
                            ${index === currentBgIndex ? "opacity-100" : "opacity-0"}
                            `}
                            style={{ backgroundImage: `url(${img})` }}
                        />
                    ))}
                    {/* Professional Dark Overlay & Gradient */}
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/70 to-transparent"></div>
                    <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-[#F8FAFC] to-transparent"></div>
                </div>

                {/* Hero Content */}
                <div className="relative z-10 container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center h-full pb-20 pt-20">
                    <div className="text-white space-y-8 max-w-2xl pl-2 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-md rounded-full px-5 py-2 text-white text-xs font-bold uppercase tracking-widest animate-pulse shadow-lg">
                            <FaFire className="text-orange-500" />
                            <span>Exclusive Deals</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tight drop-shadow-2xl">
                            The Best <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500 filter drop-shadow-lg">Technology</span> <br />
                            For You.
                        </h1>

                        <p className="text-slate-300 text-lg md:text-xl font-light leading-relaxed max-w-lg border-l-2 border-orange-500/50 pl-6">
                            Upgrade your lifestyle with top-tier gadgets from trusted stores.
                        </p>
                    </div>
                </div>
            </section>

            {/* --- PRODUCT GRID SECTION --- */}
            <div className="relative z-20 pb-24 -mt-12">
                <div className="container mx-auto px-6">

                    {/* Simplified Filter Design (No Container) */}
                    <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-orange-500 text-lg">
                                <FaFilter />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                                {activeCategory} <span className="font-light text-slate-400">Collection</span>
                            </h2>
                        </div>

                        {/* Minimal Pills */}
                        <div className="flex flex-wrap gap-3">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 border ${activeCategory === cat
                                        ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20 scale-105"
                                        : "bg-white text-slate-500 border-slate-200 hover:border-orange-200 hover:text-orange-600 hover:shadow-sm"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-12 h-12 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4 md:px-0">
                            {filteredProducts.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

// --- PREMIUM PRODUCT CARD ---
const ProductCard = ({ product }) => {
    const [liked, setLiked] = useState(false);

    // Price Calculation
    const currentPrice = product.currentPrice || 0;
    const initialPrice = product.priceHistory?.[0]?.price || currentPrice;
    const diff = initialPrice - currentPrice;

    const discountPerc = diff > 0 ? Math.round((diff / initialPrice) * 100) : 0;

    return (
        <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block h-full z-10"
        >
            {/* 1. Animated Gradient Border (Glow Effect) */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-orange-300 via-red-300 to-purple-400 rounded-[2rem] blur opacity-0 group-hover:opacity-100 transition duration-500 group-hover:duration-200"></div>

            {/* 2. Main Card Content */}
            <div className="relative h-full bg-white rounded-[1.9rem] p-4 flex flex-col overflow-hidden border border-slate-100 shadow-sm transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-2">

                {/* Image Container with Subtle Background */}
                <div className="relative h-60 w-full rounded-[1.5rem] bg-gradient-to-b from-slate-50 to-white overflow-hidden mb-5 flex items-center justify-center group-hover:bg-orange-50/30 transition-colors duration-500">

                    {/* Discount Badge */}
                    {discountPerc > 0 && (
                        <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-red-600 border border-red-100 text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm">
                            <FaFire /> {discountPerc}% OFF
                        </div>
                    )}

                    {/* Like Button */}
                    <button
                        onClick={(e) => { e.preventDefault(); setLiked(!liked); }}
                        className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-white transition-all shadow-sm border border-slate-100"
                    >
                        {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                    </button>

                    {/* Product Image */}
                    <img
                        src={product.image}
                        alt={product.title}
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }}
                        className="h-4/5 w-4/5 object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110 drop-shadow-md"
                    />
                </div>

                {/* Text Content */}
                <div className="px-2 pb-2 flex-grow flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{product.brand}</span>
                        <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">{product.site}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-800 leading-tight mb-1 line-clamp-2 group-hover:text-orange-600 transition-colors">
                        {product.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1 mb-4">{product.subtitle}</p>

                    {/* Price Section */}
                    <div className="mt-auto border-t border-slate-50 pt-4 flex items-center justify-between">
                        <div>
                            <div className="text-lg font-black text-slate-900">
                                Rs. {(currentPrice).toLocaleString()}
                            </div>
                            {diff > 0 && (
                                <div className="text-[10px] font-semibold text-slate-400 line-through">
                                    Rs. {(initialPrice).toLocaleString()}
                                </div>
                            )}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
                            <FaExternalLinkAlt className="text-xs" />
                        </div>
                    </div>
                </div>
            </div>
        </a>
    );
};

export default Popular;