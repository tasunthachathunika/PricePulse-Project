<div align="center">

  # <img src="https://img.icons8.com/fluency/48/orange/price-tag-usd.png" alt="PricePulse Logo" width="36" align="center"/> PricePulse — Smart Price Tracker
  
  <h3>Fighting Inflation, One Drop at a Time.</h3>

  <p align="center">
    <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" /></a>
    <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" /></a>
    <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=61DAFB" alt="Express" /></a>
    <a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="https://developer.chrome.com/docs/extensions/"><img src="https://img.shields.io/badge/Chrome_Extension-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Chrome Extension" /></a>
  </p>

  <p align="center">
    <a href="#-overview">Overview</a> •
    <a href="#-key-features">Key Features</a> •
    <a href="#️-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-screenshots">Screenshots</a>
  </p>

</div>

---

## 🚀 Overview

**PricePulse** is Sri Lanka's premier price tracking application designed to help smart shoppers save money on electronics. By monitoring real-time price changes on major online stores like **Wasi.lk** and **SimplyTek**, PricePulse ensures you never miss a deal.

Whether you're eyeing a new laptop or the latest smartphone, PricePulse tracks the price 24/7. Use our custom **Chrome Extension** to add items instantly while you browse your favorite stores!

---

## ✨ Key Features

- **🔍 Real-Time Tracking**: Automatically monitors product prices from supported e-commerce sites using Puppeteer web scraping.
- **🧩 Chrome Extension**: Track items instantly from any product page without leaving the site.
- **📩 Instant Alerts**: Get notified via email immediately when a price drops below your target.
- **📊 Visual Analytics**: View interactive price history charts (Chart.js) to identify trends and the best time to buy.
- **🔥 Popular Drops**: Explore trending products and recent price drops in the community.
- **🛡️ Admin Dashboard**: Comprehensive admin tools to manage users, products, and system stats.
- **📱 Responsive Design**: A beautiful, mobile-friendly interface built with Tailwind CSS.

---

## 🛠️ Tech Stack

### Frontend Application
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS, PostCSS
- **State Management & Routing**: React Hooks, React Router DOM
- **Data Fetching**: Axios
- **Data Visualization**: Chart.js, React-Chartjs-2
- **Utilities**: React Toastify, React Icons, jsPDF

### Backend Server
- **Runtime & API**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Web Scraping Engine**: Puppeteer, Cheerio
- **Task Scheduling**: Node-cron (for automated price checks)
- **Email Service**: Nodemailer
- **Authentication**: JWT (JSON Web Tokens), BcryptJS

### Browser Extension
- **Core**: HTML5, CSS3, JavaScript (ES6+)
- **Architecture**: Manifest V3
- **Communication**: REST API Integration

---

## ⚡ Getting Started

Follow these steps to set up the PricePulse project locally.

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (Local instance or MongoDB Atlas URI)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Tasuntha-Chathunika/PricePulse-Project.git
   cd PricePulse-Project
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   # Server runs on http://localhost:5000
   ```

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   # Client runs on http://localhost:5173
   ```

3. **Load the Chrome Extension**
   - Open Chrome and navigate to `chrome://extensions`.
   - Enable **Developer mode** (top right toggle).
   - Click **Load unpacked**.
   - Select the `extension` folder located in this project directory.
   - Pin the extension and log in to start tracking!

---

## 🔐 Environment Variables

Create a `.env` file in the `backend` directory and configure the following required variables:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/pricepulse
JWT_SECRET=your_jwt_secret_key_here
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
CLIENT_URL=http://localhost:5173
```

---

## 📸 Screenshots

| Landing Page | User Dashboard |
|:---:|:---:|
| <img src="./screenshots/screenshots1.png" alt="Landing Page" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" /> | <img src="./screenshots/screenshots2.png" alt="Dashboard" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" /> |

| Product Analytics | Chrome Extension |
|:---:|:---:|
| <img src="./screenshots/screenshots3.png" alt="Product Page" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" /> | <img src="./screenshots/extension.png" alt="Extension UI" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" /> |

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/Tasuntha-Chathunika">Tasuntha Chathunika</a>
</div>
