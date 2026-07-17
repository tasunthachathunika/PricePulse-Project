import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
    FaTrash, FaEye, FaSearch, FaUserShield, FaUsers,
    FaShoppingBag, FaChartLine, FaSignOutAlt, FaBolt, FaCrown, FaMagic, FaTimes, FaFileDownload
} from "react-icons/fa";
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { FaEdit, FaBell, FaGlobe } from "react-icons/fa";
import logo from "../assets/logo.png";
// PDF Libraries
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";

// --- MODERN STATS CARD ---
const StatsCard = ({ title, value, icon, color, trend, delay }) => {
    // Professional Vivid Gradients & Shadows
    const themes = {
        blue: "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-indigo-500/25",
        emerald: "bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 shadow-teal-500/25",
        orange: "bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 shadow-red-500/25",
    };

    return (
        <div
            style={{ animationDelay: `${delay}ms` }}
            className={`relative overflow-hidden p-6 rounded-[2.5rem] ${themes[color]} text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-500 group animate-fade-in-up border border-white/10`}
        >
            {/* --- Glass/Noise Overlay --- */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none"></div>

            {/* Background Glows */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/20 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700 mix-blend-overlay"></div>
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-black/10 blur-2xl rounded-full"></div>

            <div className="relative z-10 flex justify-between items-start">
                <div className="flex flex-col justify-center h-full">
                    <p className="text-xs font-bold text-white/90 uppercase tracking-widest mb-1 drop-shadow-sm flex items-center gap-2 opacity-90">
                        {title}
                    </p>
                    <h3 className="text-5xl font-black text-white tracking-tighter drop-shadow-md mt-1 leading-none">{value}</h3>
                </div>

                {/* Icon Container with Frosted Glass */}
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-3xl shadow-inner transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 group-hover:bg-white/30">
                    {icon}
                </div>
            </div>

            {/* Render trend ONLY if it exists */}
            {trend && (
                <div className="mt-6 flex items-center gap-2">
                    <span className="text-[10px] font-extrabold px-3 py-1.5 rounded-lg bg-white/20 text-white uppercase tracking-widest border border-white/20 shadow-sm backdrop-blur-md flex items-center gap-2 group-hover:bg-white/25 transition-colors">
                        {/* Dot Indicator */}
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>
                        {trend}
                    </span>
                </div>
            )}
        </div>
    );
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [adminUser, setAdminUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUserItems, setSelectedUserItems] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [globalItems, setGlobalItems] = useState([]);
    const [activeTab, setActiveTab] = useState("users");
    const [notificationData, setNotificationData] = useState({ userId: "", title: "", message: "", show: false });

    const fetchGlobalItems = async () => {
        try {
            setLoading(true);
            const res = await axios.get("http://localhost:5000/api/products/all");
            setGlobalItems(res.data);
            setActiveTab("global");
        } catch (error) {
            console.error("Error fetching global items:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUserSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/auth/user/${editingUser._id}`, editingUser);
            alert("User updated successfully");
            setEditingUser(null);
            fetchUsersData();
        } catch (error) {
            alert("Failed to update user");
        }
    };

    const handleSendNotification = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:5000/api/notifications", {
                userId: notificationData.userId || null,
                title: notificationData.title,
                message: notificationData.message
            });
            alert("Notification sent successfully!");
            setNotificationData({ userId: "", title: "", message: "", show: false });
        } catch (error) {
            alert("Failed to send notification");
        }
    };


    // --- STATS CALCULATION (Moved up for PDF access) ---
    const totalUsers = users.length;
    const totalItems = users.reduce((acc, user) => acc + (user.trackedItems?.length || 0), 0);

    // --- AUTH CHECK ---
    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (!userInfo || (userInfo.role && userInfo.role.trim() !== "admin")) {
            navigate("/login");
        } else {
            setAdminUser(userInfo);
            fetchUsersData();
        }
    }, [navigate]);

    // --- FETCH DATA ---
    const fetchUsersData = async () => {
        try {
            setLoading(true);
            const res = await axios.get("http://localhost:5000/api/auth/users-with-data");
            setUsers(res.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- UPDATED PROFESSIONAL PDF GENERATE FUNCTION ---
    const downloadPDF = async () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Load Logo
        const loadImage = (src) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = src;
                img.onload = () => resolve(img);
                img.onerror = () => resolve(null);
            });
        };
        const logoImg = await loadImage(logo);


        // 1. Header Design (Orange Bar)
        doc.setFillColor(249, 115, 22); // PricePulse Orange
        doc.rect(0, 0, pageWidth, 25, 'F');

        // Add Logo if loaded
        if (logoImg) {
            doc.addImage(logoImg, 'PNG', 14, 5, 15, 15); // Adjust position and size
            doc.setFontSize(22);
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.text("PricePulse", 32, 17); // Shift text to right of logo
        } else {
            doc.setFontSize(22);
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.text("PricePulse", 14, 17);
        }

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Administrative Summary Report", pageWidth - 65, 16);

        // 2. Report Info
        doc.setTextColor(40);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("System Overview", 14, 40);

        // 3. Summary Boxes (Draw a light gray box)
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, 45, 182, 20, 2, 2, 'FD');

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Total Registered Users", 20, 53);
        doc.text("Total Tracked Products", 80, 53);
        doc.text("Report Generated On", 140, 53);

        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42); // Slate 900
        doc.text(`${totalUsers}`, 20, 60);
        doc.text(`${totalItems}`, 80, 60);
        doc.text(`${new Date().toLocaleDateString()}`, 140, 60);

        // 4. Data Table Configuration
        const tableColumn = ["User Details", "Role", "Tracked Items List", "Registration"];
        const tableRows = users.map(user => [
            { content: `${user.name}\n${user.email}`, styles: { fontStyle: 'bold' } },
            user.role ? user.role.toUpperCase() : "USER",
            user.trackedItems?.length > 0
                ? user.trackedItems.map(i => `• ${i.title || i.name || "Item Name"} (Rs. ${(i.currentPrice || i.price || 0).toLocaleString()})`).join("\n")
                : "No items tracked",
            user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"
        ]);

        // 5. Generate Table
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 75,
            theme: 'striped',
            headStyles: {
                fillColor: [30, 41, 59], // Slate 800 
                textColor: 255,
                fontSize: 10,
                fontStyle: 'bold',
                halign: 'center'
            },
            bodyStyles: {
                fontSize: 9,
                cellPadding: 4,
                valign: 'middle'
            },
            columnStyles: {
                0: { cellWidth: 45 },
                2: { cellWidth: 85, fontSize: 8 }
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252]
            },
            didDrawPage: (data) => {
                // Footer (Page Number)
                doc.setFontSize(8);
                doc.setTextColor(150);
                const str = "Page " + doc.internal.getNumberOfPages();
                doc.text(str, pageWidth - 25, doc.internal.pageSize.getHeight() - 10);
                doc.text("PricePulse © 2026 | Confidential Admin Report", 14, doc.internal.pageSize.getHeight() - 10);
            }
        });

        // 6. Final Save
        doc.save(`PricePulse_Admin_Report_${new Date().getTime()}.pdf`);
        toast.success("Professional Report Generated!");
    };

    // --- DELETE USER ---
    const deleteUser = async (id) => {
        if (window.confirm("Are you sure you want to remove this user? This action cannot be undone.")) {
            try {
                await axios.delete(`http://localhost:5000/api/auth/user/${id}`);
                setUsers(users.filter((user) => user._id !== id));
                alert("User deleted successfully.");
            } catch (error) {
                alert("Failed to delete user.");
            }
        }
    };

    // --- ITEM DELETE FUNCTION ---
    const handleDeleteItem = async (itemId) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                await axios.delete(`http://localhost:5000/api/products/${itemId}`);
                const updatedItems = selectedUserItems.trackedItems.filter(item => item._id !== itemId);
                setSelectedUserItems({ ...selectedUserItems, trackedItems: updatedItems });
                fetchUsersData();
                alert("Item Deleted!");
            } catch (error) {
                alert("Error deleting item");
            }
        }
    };

    // --- ITEM UPDATE FUNCTION ---
    const handleUpdateItem = async (item) => {
        const newPrice = prompt("Enter new price:", item.price || item.currentPrice);
        if (newPrice && newPrice !== item.price) {
            try {
                await axios.put(`http://localhost:5000/api/products/${item._id}`, { price: newPrice });
                const updatedItems = selectedUserItems.trackedItems.map(i =>
                    i._id === item._id ? { ...i, price: newPrice, currentPrice: newPrice } : i
                );
                setSelectedUserItems({ ...selectedUserItems, trackedItems: updatedItems });
                fetchUsersData();
                alert("Price Updated!");
            } catch (error) {
                alert("Error updating price");
            }
        }
    };

    // --- SEARCH FILTER ---
    const filteredUsers = users.filter(user =>
        (user.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );



    return (
        <div className="min-h-screen font-sans selection:bg-pink-200 selection:text-pink-900 relative overflow-hidden bg-[#F8FAFC]">

            {/* --- ADVANCED BACKGROUND --- */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob"></div>
                <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-orange-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-pink-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 contrast-125 brightness-100 mix-blend-overlay"></div>
            </div>

            {/* --- NAVBAR --- */}
            <nav className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 shadow-xl py-4 sticky top-0 z-50 transition-all duration-300">
                <div className="container mx-auto px-6 flex flex-wrap justify-between items-center max-w-7xl relative z-10">

                    {/* Background Texture */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light pointer-events-none"></div>

                    {/* LOGO AREA */}
                    <div className="flex items-center gap-5 cursor-pointer relative z-10" onClick={() => navigate('/')}>
                        <img src={logo} alt="PricePulse" className="h-10 w-auto drop-shadow-md hover:scale-105 transition duration-300" />
                        <div className="hidden md:flex flex-col text-white drop-shadow-md">
                            <span className="text-sm font-black tracking-tight leading-none">PricePulse</span>
                            <div className="flex items-center gap-1 mt-0.5">
                                <FaCrown className="text-[10px] text-yellow-300" />
                                <span className="text-[10px] font-bold uppercase tracking-widest leading-none text-yellow-100">Admin Panel</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT ACTIONS */}
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="text-right hidden sm:block mr-2">
                            <p className="text-sm font-bold text-white drop-shadow-sm">{adminUser?.name}</p>
                            <div className="flex items-center justify-end gap-1.5">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse"></span>
                                <p className="text-[10px] font-bold text-white/80 uppercase tracking-wide">Online</p>
                            </div>
                        </div>

                        {/* ✅ NEW PDF DOWNLOAD BUTTON */}
                        <button
                            onClick={downloadPDF}
                            className="relative group px-5 py-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all duration-300 font-bold text-sm flex items-center gap-2 overflow-hidden border border-emerald-400/50"
                            title="Download Report"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                            <FaFileDownload className="relative z-10 text-lg group-hover:-translate-y-0.5 transition-transform duration-300" />
                            <span className="relative z-10 hidden sm:inline tracking-wide drop-shadow-sm">Download Report</span>
                        </button>

                        <button
                            onClick={() => { localStorage.removeItem("userInfo"); navigate("/login"); }}
                            className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white text-white hover:text-red-600 transition-all duration-300 font-bold text-xs shadow-sm flex items-center gap-2 backdrop-blur-sm border border-white/30"
                        >
                            <FaSignOutAlt />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- MAIN LAYOUT --- */}
            <main className="max-w-7xl mx-auto px-6 py-24 relative z-10">

                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6 animate-fade-in-up">
                    <div>
                        <div className="flex items-center gap-2 text-orange-600 font-bold text-xs uppercase tracking-widest mb-1">
                            <FaMagic className="animate-pulse" /> Admin Dashboard
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
                            Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-600">{adminUser?.name.split(' ')[0]}</span>.
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">Manage your community and tracked items efficiently.</p>
                    </div>

                    <div className="relative group w-full md:w-80">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                            <FaSearch className="text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search database..."
                            className="w-full pl-11 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all shadow-sm group-hover:shadow-md"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* --- STATS GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* ✅ Removed +12% as requested */}
                    <StatsCard title="Total Users" value={totalUsers} icon={<FaUsers />} color="blue" delay="0" />
                    <StatsCard title="Active Trackers" value={totalItems} icon={<FaShoppingBag />} color="emerald" trend="Live" delay="100" />
                    <StatsCard title="System Role" value="Admin" icon={<FaCrown />} color="orange" trend="Privileged" delay="200" />
                </div>

                {/* --- CONTENT SECTION --- */}
                
                    <div className="flex gap-4 mb-4">
                        <button onClick={() => {setActiveTab('users'); fetchUsersData();}} className={`px-4 py-2 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'bg-orange-500 text-white shadow-md' : 'bg-white/80 text-slate-600 hover:bg-orange-100'}`}>Users</button>
                        <button onClick={fetchGlobalItems} className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'global' ? 'bg-emerald-500 text-white shadow-md' : 'bg-white/80 text-slate-600 hover:bg-emerald-100'}`}><FaGlobe/> All Tracked Items</button>
                        <button onClick={() => setNotificationData({ ...notificationData, show: true })} className="px-4 py-2 rounded-xl font-bold transition-all bg-blue-500 text-white shadow-md hover:bg-blue-600 flex items-center gap-2"><FaBell/> Broadcast Notification</button>
                    </div>

                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-800 pl-1 flex items-center gap-2">
                        <FaUserShield className="text-slate-400" /> Recent Members
                    </h2>

                    {activeTab === 'global' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {globalItems.map((item, index) => (
                                <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                    <div className="flex items-center gap-4 mb-3">
                                        <img src={item.image || item.img || "https://via.placeholder.com/150"} className="w-16 h-16 object-contain mix-blend-multiply" alt=""/>
                                        <div>
                                            <h3 className="font-bold text-sm text-slate-800 line-clamp-2">{item.title || item.name}</h3>
                                            <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-bold uppercase">{item.site}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                                        <span className="font-black text-emerald-600 text-lg">Rs. {item.currentPrice?.toLocaleString()}</span>
                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-400">Tracked By</p>
                                            <p className="text-xs font-bold text-slate-700">{item.user?.name || "Unknown"}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : loading ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-white/40 rounded-3xl border border-white/60">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
                            <p className="text-sm font-bold text-slate-500 mt-4">Loading data...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-24 bg-white/40 rounded-3xl border border-white/60">
                            <h3 className="text-xl font-bold text-slate-700">No results found</h3>
                            <p className="text-slate-500">Try adjusting your search criteria</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredUsers.map((user, index) => (
                                <div
                                    key={user._id}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                    className="group flex flex-col md:flex-row items-center justify-between p-4 bg-white/80 backdrop-blur-sm border border-white/60 hover:border-orange-200 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
                                >
                                    {/* USER INFO */}
                                    <div className="flex items-center gap-4 w-full md:w-1/3">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-inner ${user.role === 'admin' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'}`}>
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-slate-800 truncate">{user.name}</h3>
                                            <p className="text-xs font-medium text-slate-500 truncate">{user.email}</p>
                                        </div>
                                    </div>

                                    {/* ROLE */}
                                    <div className="w-full md:w-1/6 flex justify-start my-2 md:my-0">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-green-100/50 text-green-700 border-green-200'}`}>
                                            {user.role || 'USER'}
                                        </span>
                                    </div>

                                    {/* STATS */}
                                    <div className="w-full md:w-1/6 flex items-center gap-2 my-2 md:my-0 text-slate-600 font-bold text-sm">
                                        <FaChartLine className="text-slate-400" />
                                        {user.trackedItems?.length || 0} Items
                                    </div>

                                    {/* DATE */}
                                    <div className="w-full md:w-1/6 text-xs font-bold text-slate-400 my-2 md:my-0">
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                                    </div>

                                    {/* ACTIONS */}
                                    <div className="w-full md:w-auto flex items-center gap-2 justify-end">
                                        <button onClick={() => setSelectedUserItems(user)} className="p-2.5 rounded-xl text-blue-500 hover:bg-blue-50 hover:scale-105 transition-all bg-white border border-slate-100 shadow-sm" title="View Items">
                                            <FaEye />
                                        </button>
                                        {user.role !== 'admin' && (
                                            <button onClick={() => deleteUser(user._id)} className="p-2.5 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-500 hover:scale-105 transition-all bg-white border border-slate-100 shadow-sm" title="Delete User">
                                                <FaTrash />
                                            </button>
                                        )}

                                        <button onClick={() => setNotificationData({ userId: user._id, title: "", message: "", show: true })} className="p-2.5 rounded-xl text-yellow-500 hover:bg-yellow-50 hover:scale-105 transition-all bg-white border border-slate-100 shadow-sm" title="Send Notification">
                                            <FaBell />
                                        </button>
                                        <button onClick={() => setEditingUser(user)} className="p-2.5 rounded-xl text-green-500 hover:bg-green-50 hover:scale-105 transition-all bg-white border border-slate-100 shadow-sm" title="Edit User">
                                            <FaEdit />
                                        </button>

                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* --- MODAL --- */}
            {selectedUserItems && (
                <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-[100] backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform scale-100 animate-in zoom-in-95 duration-300 border border-white/20">
                        {/* Modal Header */}
                        <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 rounded-full blur-[50px] opacity-20"></div>
                            <div className="relative z-10">
                                <h2 className="text-xl font-bold tracking-wide">User Portfolio</h2>
                                <p className="text-sm opacity-80">Tracking details for <span className="font-semibold text-orange-400">{selectedUserItems.name}</span></p>
                            </div>
                            <button onClick={() => setSelectedUserItems(null)} className="text-gray-400 hover:text-white transition-colors focus:outline-none bg-white/10 hover:bg-white/20 rounded-full p-2 relative z-50">
                                <FaTimes />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar bg-slate-50">
                            {selectedUserItems.trackedItems && selectedUserItems.trackedItems.length > 0 ? (
                                selectedUserItems.trackedItems.map((item, index) => (
                                    <div key={index} className="flex items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group">
                                        <div className="flex-shrink-0 w-20 h-20 bg-gray-50 rounded-lg p-2 border border-gray-100 mr-4 flex items-center justify-center mix-blend-multiply">
                                            <img src={item.image || item.img || "https://via.placeholder.com/150"} alt={item.name} className="max-w-full max-h-full object-contain" />
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <h3 className="text-slate-800 font-bold text-sm leading-tight mb-2 truncate group-hover:text-orange-600 transition-colors">
                                                {item.title || item.name || "Item Name"}
                                            </h3>
                                            <span className="inline-block text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md tracking-wide">
                                                {item.site || item.store || "Store"}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end ml-4 space-y-3 flex-shrink-0">
                                            <span className="text-emerald-600 font-black text-lg">
                                                Rs. {(item.currentPrice || item.price || 0).toLocaleString()}
                                            </span>
                                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <button onClick={() => handleUpdateItem(item)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors focus:outline-none shadow-sm" title="Edit Item">
                                                    <FiEdit className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDeleteItem(item._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg border border-red-200 transition-colors focus:outline-none shadow-sm" title="Delete Item">
                                                    <FiTrash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                                    <FaShoppingBag className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                                    <p className="text-slate-400 font-medium text-sm">No items being tracked yet.</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-white px-6 py-4 flex justify-center border-t border-slate-100">
                            <button onClick={() => setSelectedUserItems(null)} className="text-slate-600 font-bold hover:text-slate-900 hover:bg-slate-100 px-6 py-2 rounded-xl transition-colors focus:outline-none text-sm">
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* --- EDIT USER MODAL --- */}
            {editingUser && (
                <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-6">
                        <h2 className="text-xl font-bold mb-4">Edit User</h2>
                        <form onSubmit={handleUpdateUserSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700">Name</label>
                                <input type="text" className="w-full border border-slate-200 rounded-lg p-2" value={editingUser.name || ""} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700">Email</label>
                                <input type="email" className="w-full border border-slate-200 rounded-lg p-2" value={editingUser.email || ""} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700">Role</label>
                                <select className="w-full border border-slate-200 rounded-lg p-2" value={editingUser.role || "user"} onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}>
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex gap-2 justify-end mt-4">
                                <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 bg-slate-100 rounded-lg font-bold">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- NOTIFICATION MODAL --- */}
            {notificationData.show && (
                <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-6">
                        <h2 className="text-xl font-bold mb-4">{notificationData.userId ? "Send Notification to User" : "Broadcast Notification"}</h2>
                        <form onSubmit={handleSendNotification} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700">Title</label>
                                <input type="text" className="w-full border border-slate-200 rounded-lg p-2" value={notificationData.title} onChange={(e) => setNotificationData({...notificationData, title: e.target.value})} required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700">Message</label>
                                <textarea className="w-full border border-slate-200 rounded-lg p-2 h-24" value={notificationData.message} onChange={(e) => setNotificationData({...notificationData, message: e.target.value})} required></textarea>
                            </div>
                            <div className="flex gap-2 justify-end mt-4">
                                <button type="button" onClick={() => setNotificationData({ userId: "", title: "", message: "", show: false })} className="px-4 py-2 bg-slate-100 rounded-lg font-bold">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600">Send</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; opacity: 0; transform: translateY(10px); }
        @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
      `}</style>
        </div>
    );
};




export default AdminDashboard;
