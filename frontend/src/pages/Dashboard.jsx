// src/pages/Dashboard.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from "chart.js";
import {
    FaChartLine, FaPlus, FaTrash, FaSearch,
    FaArrowUp, FaBell, FaBoxOpen, FaUserCircle, FaBolt,
    FaWallet, FaArrowRight, FaPaperPlane, FaSignOutAlt, FaFire, FaCheck
} from "react-icons/fa";
import logo from "../assets/logo.png";

// Footer Component එක import කරගන්න
import Footer from "../components/Common/Footer";

// Chart.js Register කිරීම
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const Dashboard = () => {
    // --- STATE MANAGEMENT ---
    const [products, setProducts] = useState([]);
    const [newUrl, setNewUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null); // For Modal
    const navigate = useNavigate();

    const userEmail = localStorage.getItem("userEmail");
    const userName = localStorage.getItem("userName");

    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    const fetchNotifications = useCallback(async () => {
        if (!userEmail) return;
        try {
            const res = await axios.get(`http://localhost:5000/api/notifications?userEmail=${userEmail}`);
            setNotifications(res.data);
        } catch (error) {
            console.error("Failed to load notifications", error);
        }
    }, [userEmail]);

    const markAsRead = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/notifications/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);


    // --- API FUNCTIONS ---

    // 1. Fetch Products
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/products?userEmail=${userEmail}`);
            setProducts(res.data);
        } catch (error) {
            console.error("Failed to load products", error);
        } finally {
            setLoading(false);
        }
    }, [userEmail]);

    // Check Auth on Load
    useEffect(() => {
        if (!userEmail) {
            navigate("/login"); // Email නැත්නම් Login එකට යවනවා
        } else {
            fetchProducts();
        }
    }, [userEmail, navigate, fetchProducts]);

    // 2. Add Product
    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!newUrl) return alert("Please paste a link first!");

        setAdding(true);
        try {
            const response = await axios.post("http://localhost:5000/api/products", {
                url: newUrl,
                userEmail: userEmail,
            });

            // Check for duplicate status
            if (response.data.status === "exists") {
                alert("⚠️ You are already tracking this item!");
                setNewUrl("");
                return; // Stop here
            }

            alert("✨ Product Added Successfully! Tracking started.");
            setNewUrl("");
            fetchProducts(); // Refresh list
        } catch (error) {
            const errorMsg = error.response?.data?.error || "Failed to add product.";
            alert(`❌ Error: ${errorMsg}`);
        } finally {
            setAdding(false);
        }
    };

    // 3. Delete Product
    const handleDelete = async (id, title) => {
        if (!confirm(`Stop tracking "${title}"?`)) return;
        try {
            await axios.delete(`http://localhost:5000/api/products/${id}`);
            // UI එකෙන් අයින් කරනවා (Reload නොකර)
            setProducts(products.filter((p) => p._id !== id));
        } catch (error) {
            alert("Delete Failed!");
        }
    };

    // 4. Logout
    const handleLogout = () => {
        if (confirm("Log out?")) {
            localStorage.clear();
            navigate("/");
        }
    };

    // --- STATS CALCULATIONS (Dynamic) ---
    const totalItems = products.length;

    const priceDropsCount = products.filter(p => {
        const startPrice = p.priceHistory?.[0]?.price || p.currentPrice;
        return p.currentPrice < startPrice;
    }).length;

    const totalSavings = products.reduce((acc, p) => {
        const startPrice = p.priceHistory?.[0]?.price || p.currentPrice;
        const diff = startPrice - p.currentPrice;
        return acc + (diff > 0 ? diff : 0);
    }, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-sans flex flex-col">

            {/* --- NAVBAR --- */}
            <nav className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 shadow-xl py-4 sticky top-0 z-50 transition-all duration-300">
                <div className="container mx-auto px-6 flex flex-wrap justify-between items-center max-w-7xl relative">
                    {/* Background Texture (Subtle) */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light pointer-events-none"></div>

                    <div className="flex items-center gap-3 cursor-pointer group relative z-10" onClick={() => window.location.reload()}>
                        <img src={logo} alt="PricePulse" className="h-10 w-auto drop-shadow-md group-hover:scale-105 transition duration-300" />
                    </div>

                    <div className="flex items-center gap-6 relative z-10">
                        {/* Styled Popular Button */}
                        <Link
                            to="/popular"
                            className="hidden md:flex items-center gap-2 bg-white text-orange-600 px-6 py-2.5 rounded-full font-bold text-sm shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 transform active:scale-95 group/btn"
                        >
                            <FaFire className="text-orange-500 group-hover/btn:animate-bounce" />
                            Popular Products
                        </Link>

                        
                        <div className="relative">
                            <button onClick={() => setShowNotifications(!showNotifications)} className="text-white relative p-2 bg-white/20 rounded-full hover:bg-white/30 transition border border-white/20 shadow-md">
                                <FaBell className="text-lg" />
                                {notifications.filter(n => !n.isRead).length > 0 && (
                                    <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 border-2 border-orange-500 rounded-full animate-bounce"></span>
                                )}
                            </button>

                            {/* Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 transform origin-top-right transition-all">
                                    <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                                        <h3 className="font-bold text-slate-800">Notifications</h3>
                                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-bold">{notifications.filter(n => !n.isRead).length} New</span>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <p className="p-6 text-center text-sm text-slate-400 font-medium">No notifications yet.</p>
                                        ) : (
                                            notifications.map((n) => (
                                                <div key={n._id} onClick={() => !n.isRead && markAsRead(n._id)} className={`p-4 border-b border-slate-50 cursor-pointer transition-colors ${!n.isRead ? 'bg-orange-50/50 hover:bg-orange-50' : 'bg-white hover:bg-slate-50'}`}>
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className={`text-sm font-bold ${!n.isRead ? 'text-slate-800' : 'text-slate-600'}`}>{n.title}</h4>
                                                        {n.isRead && <FaCheck className="text-green-500 text-xs" />}
                                                    </div>
                                                    <p className="text-xs text-slate-500">{n.message}</p>
                                                    <p className="text-[10px] text-slate-400 mt-2 font-bold">{new Date(n.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4 pl-6 border-l border-white/20">
                            <div className="text-right hidden md:block leading-tight">
                                <div className="font-bold text-sm text-white drop-shadow-sm">{userName || "User"}</div>
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

            {/* --- MAIN CONTENT --- */}
            <div className="container mx-auto px-6 py-10 max-w-7xl flex-grow">

                {/* 1. TRACKER INPUT SECTION */}
                <div className="bg-gradient-to-br from-orange-50 via-white to-red-50 rounded-[2rem] shadow-xl border border-red-100 p-10 sm:p-12 mb-10 relative overflow-hidden group hover:shadow-2xl transition duration-500">
                    {/* Background Blobs */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-200 opacity-20 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-200 opacity-20 rounded-full -ml-20 -mb-20 blur-3xl pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="md:w-1/3 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 bg-red-500 text-white text-xs font-extrabold px-3 py-1 rounded-full mb-3 uppercase tracking-wider shadow-sm">
                                <FaBolt /> NEW
                            </div>
                            <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Track Any Price</h2>
                            <p className="text-gray-500 font-medium text-sm">Paste URL from Wasi.lk or SimplyTek.</p>
                        </div>

                        <div className="flex-1 w-full bg-white p-2 rounded-2xl shadow-lg border border-gray-100 flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 flex items-center pl-5 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-amber-500 focus-within:bg-white transition h-14">
                                <FaSearch className="text-gray-400 mr-3 text-lg" />
                                <input
                                    type="text"
                                    placeholder="Paste product link here..."
                                    className="w-full bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 font-medium text-base"
                                    value={newUrl}
                                    onChange={(e) => setNewUrl(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={handleAddProduct}
                                disabled={adding}
                                className="bg-gradient-to-r from-amber-400 to-red-600 hover:from-amber-500 hover:to-red-700 text-white font-bold px-8 rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-95 disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2 whitespace-nowrap h-14 sm:h-auto text-base"
                            >
                                {adding ? "Adding..." : <><FaPlus className="animate-pulse" /> Track Now</>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. STATS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                    <StatsCard
                        icon={<FaWallet />}
                        gradient="from-emerald-50 to-teal-100"
                        borderColor="border-emerald-100"
                        iconColor="text-emerald-200"
                        title="Total Savings"
                        value={`LKR ${totalSavings.toLocaleString()}`}
                        sub="Accumulated"
                    />
                    <StatsCard
                        icon={<FaBoxOpen />}
                        gradient="from-blue-50 to-indigo-100"
                        borderColor="border-blue-100"
                        iconColor="text-blue-200"
                        title="Tracked Items"
                        value={`${totalItems} Products`}
                        sub="All Active"
                    />
                    <StatsCard
                        icon={<FaBell />}
                        gradient="from-red-50 to-orange-100"
                        borderColor="border-red-100"
                        iconColor="text-red-200"
                        title="Active Alerts"
                        value={`${priceDropsCount} Pending`}
                        sub="Price Drops!"
                        pulse={priceDropsCount > 0}
                    />
                </div>

                {/* 3. WATCHLIST GRID */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">Your Watchlist</h3>
                    <button onClick={fetchProducts} className="text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg transition shadow-sm flex items-center gap-2">
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                        <p className="text-sm font-medium">Scanning prices...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-gray-200">
                        <div className="text-gray-300 text-5xl mb-4 flex justify-center"><FaSearch /></div>
                        <p className="text-gray-500 font-bold mb-1 text-lg">Your watchlist is empty.</p>
                        <p className="text-gray-400">Paste a product link above to start!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                onDelete={handleDelete}
                                onViewHistory={() => setSelectedProduct(product)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* --- FOOTER --- */}
            <Footer />

            {/* --- CHART MODAL --- */}
            {selectedProduct && (
                <ChartModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
            )}
        </div>
    );
};

// --- SUB COMPONENTS ---

// 1. Stats Card
const StatsCard = ({ icon, gradient, borderColor, iconColor, title, value, sub, pulse }) => (
    <div className={`relative bg-gradient-to-br ${gradient} p-8 rounded-2xl shadow-md border ${borderColor} hover:shadow-lg hover:-translate-y-1 transition duration-300 overflow-hidden`}>
        <div className={`absolute -bottom-4 -right-4 ${iconColor} opacity-50 text-8xl`}>{icon}</div>
        <div className="relative z-10">
            <p className="text-gray-600 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-3xl font-extrabold text-gray-800">{value}</h3>
            <div className={`inline-flex items-center gap-1 mt-2 bg-white/60 px-2 py-1 rounded-md border ${borderColor} shadow-sm ${pulse ? 'animate-pulse' : ''}`}>
                <span className="text-xs font-semibold text-gray-600">{sub}</span>
            </div>
        </div>
    </div>
);

// 2. Product Card
const ProductCard = ({ product, onDelete, onViewHistory }) => {
    const currentPrice = product.currentPrice || 0;
    const initialPrice = product.priceHistory?.length > 0 ? product.priceHistory[0].price : currentPrice;
    const diff = initialPrice - currentPrice;
    const isDrop = diff > 0;

    // Badge Logic
    const siteName = (product.site || 'Store').toLowerCase();
    let badgeClass = 'bg-purple-100 text-purple-800';
    if (siteName.includes('wasi')) badgeClass = 'bg-orange-100 text-orange-800';
    else if (siteName.includes('daraz')) badgeClass = 'bg-blue-100 text-blue-800';

    return (
        <div className="group bg-gradient-to-br from-indigo-50 to-blue-100 rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative">
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></div>

            <div className="h-60 p-6 bg-white/50 backdrop-blur-sm flex items-center justify-center border-b border-gray-50/50 relative group-hover:bg-white/80 transition">
                {isDrop && (
                    <span className="absolute top-3 left-3 bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded-full border border-red-100 z-10 animate-pulse flex items-center gap-1">
                        <FaArrowUp className="rotate-180" /> Save Rs. {diff.toLocaleString()}
                    </span>
                )}
                <img
                    src={product.image || 'https://via.placeholder.com/300?text=No+Image'}
                    alt={product.title}
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300?text=Image+Not+Found'; }}
                    className="h-full w-full object-contain transform group-hover:scale-105 transition duration-500 mix-blend-multiply"
                />
            </div>

            <div className="p-6 flex flex-col flex-1">
                <div className="mb-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}>
                        {product.site || "Store"}
                    </span>
                </div>

                <h4 className="font-bold text-gray-900 text-xl leading-snug line-clamp-2 mb-3 min-h-[3.5rem]" title={product.title}>
                    {product.title}
                </h4>

                <div className="mt-auto mb-6">
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-3xl font-extrabold text-green-600">Rs. {currentPrice.toLocaleString()}</span>
                        {isDrop && <span className="text-sm text-gray-400 line-through">Rs. {initialPrice.toLocaleString()}</span>}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 font-medium">
                        Updated: {new Date(product.lastChecked || Date.now()).toLocaleDateString()}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={onViewHistory} className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-95">
                        <FaChartLine /> View History
                    </button>

                    <a href={product.url} target="_blank" rel="noopener noreferrer" className="p-3.5 flex items-center justify-center bg-white/80 backdrop-blur-sm text-gray-400 rounded-xl hover:bg-white hover:text-blue-600 hover:border-blue-200 transition border border-gray-100 shadow-sm">
                        <FaArrowRight className="-rotate-45" />
                    </a>

                    <button onClick={() => onDelete(product._id, product.title)} className="bg-white/80 backdrop-blur-sm text-red-500 hover:bg-red-50 hover:text-red-600 p-3.5 rounded-xl transition-colors border border-red-50 shadow-sm">
                        <FaTrash />
                    </button>
                </div>
            </div>
        </div>
    );
};

// 3. Chart Modal
const ChartModal = ({ product, onClose }) => {
    const chartData = {
        labels: product.priceHistory?.map(h => new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) || [],
        datasets: [{
            label: 'Price (LKR)',
            data: product.priceHistory?.map(h => h.price) || [],
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            pointBackgroundColor: '#fff',
            pointBorderColor: '#2563eb',
            pointBorderWidth: 2,
            pointRadius: 4,
            fill: true,
            tension: 0.3
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: false }, x: { grid: { display: false } } }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform scale-100" onClick={e => e.stopPropagation()}>
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">{product.title}</h3>
                        <p className="text-xs text-gray-500">Price Trend</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition text-2xl">&times;</button>
                </div>
                <div className="p-6 h-72">
                    {product.priceHistory && product.priceHistory.length > 1 ? (
                        <Line data={chartData} options={chartOptions} />
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 flex-col">
                            <FaChartLine className="text-4xl mb-2 opacity-50" />
                            <p>Collecting data... Check back later!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;