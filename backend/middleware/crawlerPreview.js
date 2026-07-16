import Product from '../models/Product.js';

const isCrawler = (userAgent) => {
  if (!userAgent) return false;
  const crawlers = [
    'facebookexternalhit',
    'twitterbot',
    'whatsapp',
    'linkedinbot',
    'slackbot',
    'telegrambot',
    'discordbot',
    'googlebot',
    'bingbot',
    'applebot'
  ];
  const ua = userAgent.toLowerCase();
  return crawlers.some(c => ua.includes(c));
};

export const crawlerPreviewMiddleware = async (req, res, next) => {
  // Only intercept GET requests for page routes
  if (req.method !== 'GET') {
    return next();
  }

  const userAgent = req.headers['user-agent'];
  if (!isCrawler(userAgent)) {
    return next();
  }

  const urlPath = req.path;
  const clientUrl = process.env.CLIENT_URL || 'https://eyeleads.com';
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  const defaultImage = `${clientUrl}/android-chrome-512x512.png`;

  // 1. Product Detail Page: /product/:id
  const productMatch = urlPath.match(/^\/product\/([a-fA-F0-9]{24})$/);
  if (productMatch) {
    try {
      const productId = productMatch[1];
      const product = await Product.findById(productId);
      if (product) {
        let imageUrl = product.image || '';
        // If image is a local path (starts with /uploads), prefix with backend URL
        if (imageUrl.startsWith('/')) {
          imageUrl = `${backendUrl}${imageUrl}`;
        }

        const title = `${product.name} | EyeLeads`;
        const description = product.description || 'Shop this premium eyewear style at EyeLeads.';

        return res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta property="og:type" content="product">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:url" content="${clientUrl}${urlPath}">
  <meta property="og:site_name" content="EyeLeads">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
</head>
<body>
  <h1>${product.name}</h1>
  <p>${description}</p>
  <img src="${imageUrl}" alt="${product.name}">
</body>
</html>`);
      }
    } catch (err) {
      console.error('[Crawler Middleware Error]', err.message);
    }
  }

  // 2. Shop Page: /shop
  if (urlPath === '/shop') {
    const title = 'Shop Premium Eyewear | EyeLeads';
    const description = 'Explore our curated collections of premium prescription eyeglasses, statement sunglasses, blue-light computer glasses, and sports frames.';
    return res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${defaultImage}">
  <meta property="og:url" content="${clientUrl}${urlPath}">
  <meta property="og:site_name" content="EyeLeads">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${defaultImage}">
</head>
<body>
  <h1>${title}</h1>
  <p>${description}</p>
</body>
</html>`);
  }

  // 3. Home Page: /
  if (urlPath === '/' || urlPath === '') {
    const title = 'EyeLeads | Premium Eyewear Store';
    const description = 'EyeLeads offers high-quality prescription eyeglasses, stylish sunglasses, blue-light computer glasses, sports frames, and kids eyewear. Shop premium styles today.';
    return res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${defaultImage}">
  <meta property="og:url" content="${clientUrl}">
  <meta property="og:site_name" content="EyeLeads">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${defaultImage}">
</head>
<body>
  <h1>${title}</h1>
  <p>${description}</p>
</body>
</html>`);
  }

  // Fallback to next (let the standard SPA serve)
  return next();
};
