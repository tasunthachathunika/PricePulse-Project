const puppeteer = require('puppeteer');
const fs = require('fs');

const scrapeProduct = async (url) => {
    let browser;
    try {
        const options = {
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--window-size=1920,1080']
        };

        // For cloud environments like Render, use the provided chromium path if it exists
        if (process.env.PUPPETEER_EXECUTABLE_PATH) {
            options.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
        }

        browser = await puppeteer.launch(options);

        const page = await browser.newPage();

        // Optimization
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['font', 'media'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log(`🔍 Navigating to: ${url}`);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        const data = await page.evaluate(() => {
            // --- CLEANING LOGIC ---
            const cleanPrice = (priceStr) => {
                if (!priceStr) return 0;
                // Strip "Rs.", "LKR", "," and spaces. Keep only digits and dots.
                // Example: "Rs. 4,349.00" -> "4349.00"
                const cleaned = priceStr.replace(/[^\d.]/g, '');
                return parseFloat(cleaned) || 0;
            };

            const hostname = window.location.hostname;
            let site = hostname.includes('wasi') ? 'Wasi.lk' :
                hostname.includes('simplytek') ? 'SimplyTek' : 'Unknown';

            // --- TITLE ---
            let title = document.querySelector('.product_title')?.innerText ||
                document.querySelector('meta[property="og:title"]')?.content ||
                document.title;

            // --- IMAGE ---
            let image = null;
            if (hostname.includes('wasi')) {
                const imgEl = document.querySelector('.woocommerce-product-gallery__image img');
                if (imgEl) image = imgEl.src;
            }
            if (!image) {
                image = document.querySelector('meta[property="og:image"]')?.content ||
                    document.querySelector('.wp-post-image')?.src;
            }
            if (image && !image.startsWith('http')) {
                image = window.location.origin + image;
            }

            // --- PRICE PRIORITY ---
            let priceText = null;

            // Priority 1: Sale/Discounted Price (inside <ins>)
            // Common in WooCommerce for sale items (SimpyTek etc.)
            const salePriceEl = document.querySelector('.price ins .woocommerce-Price-amount bdi') ||
                document.querySelector('.price ins .amount');

            // Priority 2: Regular Price (Fallback)
            // If no sale price, take the standard price
            const regularPriceEl = document.querySelector('.price .woocommerce-Price-amount bdi') ||
                document.querySelector('.product-price') ||
                document.querySelector('.price .amount');

            if (salePriceEl) {
                priceText = salePriceEl.innerText;
            } else if (regularPriceEl) {
                priceText = regularPriceEl.innerText;
            }

            const price = cleanPrice(priceText);

            return { title, price, image, site };
        });

        if (!data.price || data.price === 0 || isNaN(data.price)) {
            console.error(`❌ Price undetected (Rs. 0) for ${url}`);
            throw new Error("Price not found");
        }

        console.log(`✅ Scraped: ${data.title} - Rs. ${data.price} (${data.site})`);
        return data;

    } catch (error) {
        console.error("❌ Scraping Failed:", error.message);
        throw error;
    } finally {
        if (browser) await browser.close();
    }
};

module.exports = { scrapeProduct };