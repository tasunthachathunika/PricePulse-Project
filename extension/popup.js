// Live backend URL
const API_URL = "https://pricepulse-project-production.up.railway.app/api";

// DOM
const views = { login: document.getElementById("login-view"), dashboard: document.getElementById("dashboard-view") };
const inputs = { email: document.getElementById("email"), password: document.getElementById("password"), productUrl: document.getElementById("product-url") };
const buttons = { login: document.getElementById("login-btn"), track: document.getElementById("track-btn"), logout: document.getElementById("logout-btn"), refresh: document.getElementById("refresh-btn") };
const containers = { itemList: document.getElementById("item-list"), itemCount: document.getElementById("item-count") };
const toastEl = { container: document.getElementById("toast"), msg: document.getElementById("toast-msg"), icon: document.getElementById("toast-icon") };

// --- INIT ---
document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
    buttons.login.addEventListener("click", handleLogin);
    buttons.track.addEventListener("click", handleTrackItem);
    buttons.logout.addEventListener("click", handleLogout);
    buttons.refresh.addEventListener("click", loadItems);
    inputs.password.addEventListener("keypress", (e) => { if (e.key === "Enter") handleLogin(); });
    inputs.productUrl.addEventListener("keypress", (e) => { if (e.key === "Enter") handleTrackItem(); });
});

// --- AUTH ---
function checkAuth() {
    chrome.storage.local.get(["token", "email"], (r) => {
        if (r.token && r.email) { showDashboard(); loadItems(); }
        else showLogin();
    });
}

async function handleLogin() {
    const email = inputs.email.value.trim();
    const password = inputs.password.value.trim();
    if (!email || !password) return showToast("Enter email & password.", "error");

    setBtnLoading(buttons.login, true, "Signing In...");
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            chrome.storage.local.set({ token: data.token, email: data.email }, () => {
                showDashboard(); loadItems();
                inputs.email.value = ""; inputs.password.value = "";
                showToast("Welcome back!", "success");
            });
        } else {
            showToast(data.message || "Login failed.", "error");
        }
    } catch (err) {
        showToast("Server unreachable.", "error");
    } finally {
        setBtnLoading(buttons.login, false);
    }
}

function handleLogout() {
    chrome.storage.local.remove(["token", "email"], () => {
        showLogin();
        showToast("Logged out.", "success");
    });
}

// --- ITEMS ---
function showSkeleton() {
    containers.itemList.innerHTML = [1, 2].map(() =>
        `<div class="skeleton-card"><div class="skeleton-img"></div><div class="skeleton-lines"><div class="skeleton-line"></div><div class="skeleton-line short"></div></div></div>`
    ).join("");
}

async function loadItems() {
    showSkeleton();
    const { token, email } = await getAuth();
    if (!token || !email) return handleLogout();

    try {
        const res = await fetch(`${API_URL}/products?userEmail=${encodeURIComponent(email)}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const items = await res.json();
        containers.itemCount.textContent = items.length || 0;
        renderItems(items);
    } catch (err) {
        containers.itemList.innerHTML = '<div class="empty-state"><p style="color:#ef4444;">Failed to load.</p></div>';
    }
}

async function handleTrackItem() {
    const url = inputs.productUrl.value.trim();
    if (!url) return;

    const { token, email } = await getAuth();
    if (!token || !email) return handleLogout();

    setBtnLoading(buttons.track, true, "Tracking...");
    try {
        const res = await fetch(`${API_URL}/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ url, userEmail: email })
        });
        const data = await res.json();
        if (res.ok || res.status === 200) {
            if (data.status === "exists") {
                showToast("Already tracking this item!", "error");
            } else {
                inputs.productUrl.value = "";
                showToast("Tracking started!", "success");
                loadItems();
            }
        } else {
            showToast(data.error || "Failed to add.", "error");
        }
    } catch (err) {
        showToast("Server error.", "error");
    } finally {
        setBtnLoading(buttons.track, false);
    }
}

async function handleDeleteItem(id) {
    if (!confirm("Stop tracking this item?")) return;
    const { token } = await getAuth();
    if (!token) return handleLogout();

    try {
        const res = await fetch(`${API_URL}/products/${id}`, {
            method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) { showToast("Item removed.", "success"); loadItems(); }
        else showToast("Delete failed.", "error");
    } catch (err) {
        showToast("Error deleting.", "error");
    }
}

// --- RENDER ---
function renderItems(items) {
    containers.itemList.innerHTML = "";

    if (!items || items.length === 0) {
        containers.itemList.innerHTML = `
            <div class="empty-state">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <p>No items yet.<br>Paste a URL above to start!</p>
            </div>`;
        return;
    }

    items.forEach(item => {
        const cur = item.currentPrice || 0;
        const start = item.priceHistory?.length > 0 ? item.priceHistory[0].price : cur;
        const diff = start - cur;
        const isDrop = diff > 0;

        const badge = isDrop
            ? `<span class="price-badge price-down"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 9 12 15 18 9"/></svg>Rs. ${cur.toLocaleString()}</span>`
            : `<span class="price-badge price-up">Rs. ${cur.toLocaleString()}</span>`;

        const div = document.createElement("div");
        div.className = "item-card";
        div.innerHTML = `
            <img src="${item.image || 'icon_128.png'}" class="item-img" alt="">
            <div class="item-info">
                <a href="${item.url}" target="_blank" class="item-name" title="${item.name}">${item.name}</a>
                ${badge}
            </div>
            <button class="delete-btn" title="Remove">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>`;
        div.querySelector(".delete-btn").addEventListener("click", () => handleDeleteItem(item._id));
        containers.itemList.appendChild(div);
    });
}

// --- HELPERS ---
function getAuth() { return new Promise(r => chrome.storage.local.get(["token", "email"], r)); }

function showLogin() {
    views.login.classList.remove("hidden"); views.dashboard.classList.add("hidden"); buttons.logout.classList.add("hidden");
}
function showDashboard() {
    views.login.classList.add("hidden"); views.dashboard.classList.remove("hidden"); buttons.logout.classList.remove("hidden");
}

let toastTimer;
function showToast(msg, type = "success") {
    toastEl.msg.textContent = msg;
    toastEl.icon.innerHTML = type === "success"
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>'
        : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
    toastEl.container.className = `toast ${type} show`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.container.classList.remove("show"), 2500);
}

function setBtnLoading(btn, loading, text) {
    if (loading) {
        btn.dataset.html = btn.dataset.html || btn.innerHTML;
        btn.disabled = true; btn.style.opacity = "0.7";
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> ${text}`;
        if (!document.getElementById("sp")) {
            const s = document.createElement("style"); s.id = "sp";
            s.textContent = "@keyframes spin{100%{transform:rotate(360deg)}}";
            document.head.appendChild(s);
        }
    } else {
        btn.disabled = false; btn.style.opacity = "1";
        if (btn.dataset.html) btn.innerHTML = btn.dataset.html;
    }
}
