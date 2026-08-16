const nodemailer = require('nodemailer');
require('dotenv').config();

// Email Config
// Email Config (Updated to use Port 587 for better firewall compatibility)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// --- 1. WELCOME EMAIL TEMPLATE ---
const welcomeTemplate = (name) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; }
            .container { width: 100%; max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
            .header-bar { height: 8px; background: linear-gradient(90deg, #f97316, #ea580c, #dc2626); width: 100%; }
            .content { padding: 40px 30px; text-align: center; }
            .logo { font-size: 24px; font-weight: 800; color: #1f2937; margin-bottom: 10px; display: inline-block; }
            .logo span { color: #f97316; }
            .hero-icon { font-size: 60px; margin: 20px 0; display: block; }
            .title { font-size: 26px; font-weight: 800; color: #111827; margin: 0 0 10px 0; }
            .text { color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px; }
            .steps-box { background: #fff7ed; padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #ffedd5; text-align: left; }
            .step { display: flex; align-items: start; margin-bottom: 15px; }
            .step:last-child { margin-bottom: 0; }
            .step-num { background: #f97316; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 12px; flex-shrink: 0; margin-top: 3px; }
            .step-text { font-size: 14px; color: #374151; font-weight: 500; }
            .step-text b { color: #9a3412; }
            .btn { display: inline-block; background: linear-gradient(90deg, #f97316, #ea580c); color: #ffffff; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3); transition: all 0.3s ease; margin-top: 10px; }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header-bar"></div>
            <div class="content">
                <div class="logo"><span>📈</span> PricePulse</div>
                <div class="hero-icon">🚀</div>
                <h1 class="title">Welcome to the Club!</h1>
                <p class="text">Hi <strong>${name}</strong>,<br>You've just joined the smartest community of shoppers in Sri Lanka.</p>
                <div class="steps-box">
                    <p style="font-weight: bold; color: #9a3412; margin-top: 0; margin-bottom: 15px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Get Started in 3 Steps:</p>
                    <div class="step">
                        <div class="step-num">1</div>
                        <div class="step-text">Copy a product link from <b>Wasi.lk</b> or <b>SimplyTek</b>.</div>
                    </div>
                    <div class="step">
                        <div class="step-num">2</div>
                        <div class="step-text">Paste it in your <b>PricePulse Dashboard</b>.</div>
                    </div>
                    <div class="step">
                        <div class="step-num">3</div>
                        <div class="step-text">Relax! We'll email you instantly when the <b>Price Drops</b>.</div>
                    </div>
                </div>
                <a href="http://localhost:5173/dashboard" class="btn">Go to Dashboard</a>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} PricePulse. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// --- 2. PRICE DROP EMAIL TEMPLATE ---
const priceDropTemplate = (data) => {
    const savedAmount = (data.oldPrice - data.newPrice).toLocaleString();
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; }
            .container { width: 100%; max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
            .header-bar { height: 8px; background: linear-gradient(90deg, #f97316, #ea580c, #dc2626); width: 100%; }
            .content { padding: 40px 30px; text-align: center; }
            .logo { font-size: 24px; font-weight: 800; color: #1f2937; margin-bottom: 20px; display: inline-block; }
            .logo span { color: #f97316; }
            .badge { background-color: #fff7ed; color: #c2410c; padding: 5px 12px; border-radius: 50px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 15px; border: 1px solid #ffedd5; }
            .product-title { font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 10px 0; line-height: 1.4; }
            .price-box { background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e2e8f0; }
            .old-price { color: #94a3b8; text-decoration: line-through; font-size: 16px; margin-bottom: 5px; }
            .new-price { color: #16a34a; font-size: 32px; font-weight: 800; margin: 0; }
            .save-label { color: #ea580c; font-size: 14px; font-weight: bold; margin-top: 5px; }
            .btn { display: inline-block; background: linear-gradient(90deg, #f97316, #ea580c); color: #ffffff; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3); transition: all 0.3s ease; }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header-bar"></div>
            <div class="content">
                <div class="logo"><span>📈</span> PricePulse</div><br>
                <div class="badge">🔥 Price Drop Alert</div>
                <p style="color: #6b7280; font-size: 16px; margin-bottom: 5px;">Hi ${data.name || 'Shopper'},</p>
                <h2 class="product-title">The price for <br> <span style="color: #4b5563;">"${data.productName}"</span> <br> just dropped!</h2>
                
                <div class="price-box">
                    <div class="old-price">Rs. ${data.oldPrice.toLocaleString()}</div>
                    <div class="new-price">Rs. ${data.newPrice.toLocaleString()}</div>
                    <div class="save-label">You Save Rs. ${savedAmount}</div>
                </div>

                <a href="${data.url}" class="btn">Buy Now</a>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} PricePulse. Automated Alert System.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// --- 3. PASSWORD RESET EMAIL TEMPLATE ---
const resetPasswordTemplate = (data) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Password Reset</title>
        <style>
            body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; }
            .container { width: 100%; max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
            .header-bar { height: 6px; background: linear-gradient(90deg, #f97316, #ea580c, #dc2626); width: 100%; }
            .content { padding: 40px 30px; text-align: center; }
            .logo-text { font-size: 24px; font-weight: 800; color: #1f2937; margin-bottom: 20px; display: inline-block; }
            .logo-icon { color: #f97316; }
            .heading { font-size: 26px; font-weight: bold; color: #111827; margin-bottom: 10px; }
            .text { color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
            .btn { display: inline-block; background-color: #f97316; color: #ffffff; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(249, 115, 22, 0.2); transition: background-color 0.3s; }
            .btn:hover { background-color: #ea580c; }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #9ca3af; font-size: 13px; border-top: 1px solid #e5e7eb; }
            .link-text { color: #f97316; text-decoration: none; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header-bar"></div>
            <div class="content">
                <div class="logo-text"><span class="logo-icon">📈</span> PricePulse</div>
                <h1 class="heading">Password Reset</h1>
                <p class="text">
                    Hi <strong>${data.name || 'there'}</strong>,<br>
                    We received a request to reset your password. Click the button below to create a new strong password.
                </p>
                <a href="${data.resetLink}" class="btn">Reset Password</a>
                <p style="margin-top: 30px; font-size: 14px; color: #9ca3af;">
                    This link will expire in 15 minutes.<br>
                    If you didn't request this, you can safely ignore this email.
                </p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} PricePulse. All rights reserved.</p>
                <p>Need help? <a href="#" class="link-text">Contact Support</a></p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// --- 4. MAIN SEND FUNCTION ---
const sendEmail = async (to, type, data) => {
    let subject = "";
    let htmlContent = "";

    switch (type) {
        case 'welcome':
            subject = "Welcome to PricePulse! 🚀";
            htmlContent = welcomeTemplate(data.name);
            break;

        case 'price_drop':
            subject = `🔥 Price Drop: ${data.productName ? data.productName.substring(0, 20) : 'Item'}...`;
            htmlContent = priceDropTemplate(data);
            break;

        case 'reset_password':
            subject = "Reset Your Password - PricePulse 🔒";
            htmlContent = resetPasswordTemplate(data);
            break;
    }

    try {
        await transporter.sendMail({
            from: `"PricePulse" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: htmlContent
        });
        console.log(`✅ Email (${type}) sent to ${to}`);
        return true;
    } catch (error) {
        console.error("❌ Email Error:", error);
        return false;
    }
};

module.exports = { sendEmail };
