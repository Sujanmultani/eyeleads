import https from 'https';
import { storeSettings } from '../routes/settings.js';
import {
  getMaterialDetail,
  getFeatureDetail,
  getLensTypeDetail
} from './lensPricing.js';

/**
 * Sends a raw email using the Resend API.
 * @param {Object} payload - The Resend email payload.
 * @returns {Promise<Object>} - The API response.
 */
export const sendRawEmail = (payload) => {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return reject(new Error('RESEND_API_KEY is not configured in environment variables.'));
    }

    const data = JSON.stringify(payload);
    const options = {
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve({ success: true, body });
          }
        } else {
          reject(new Error(`Resend API error (Status ${res.statusCode}): ${body}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
};

/**
 * Generates and sends a premium HTML purchase invoice to the buyer via Resend.
 * @param {Object} order - The Order document/object containing order details.
 * @param {Object} user - The user object representing the buyer.
 * @returns {Promise<Object>} - Resend API response.
 */
export const sendInvoiceEmail = async (order, user) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.CLIENT_URL) {
        throw new Error('CLIENT_URL environment variable is missing in production mode.');
      }
      if (!process.env.BACKEND_URL) {
        throw new Error('BACKEND_URL environment variable is missing in production mode.');
      }
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'EyeLeads Optics <onboarding@resend.dev>';
    
    const recipientEmail = order.shippingAddress?.email || user?.email || order.paymentResult?.email_address;
    const customerName = order.shippingAddress?.name || user?.name || 'Valued Customer';
    
    if (!recipientEmail) {
      throw new Error(`Cannot send invoice for order ${order._id} because no recipient email address was found.`);
    }

    const orderDate = new Date(order.paidAt || order.createdAt || Date.now()).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Helper to calculate pricing breakdown for each item matching frontend logic
    const getItemBreakdown = (item) => {
      const lensTypeVal = (item.options?.lensType || '').toLowerCase();
      const isPrescription = lensTypeVal.includes('single vision') || 
                             lensTypeVal.includes('bifocal') || 
                             lensTypeVal.includes('progressive') ||
                             lensTypeVal.includes('prescription');
      const opticianFee = isPrescription ? (typeof storeSettings.opticianFee === 'number' ? storeSettings.opticianFee : 500) : 0;

      const config = item.options?.prescriptionData?.lensConfig || {};
      const typeDetail = isPrescription ? getLensTypeDetail(item.options?.lensType, storeSettings) : { name: '', price: 0 };
      const materialDetail = isPrescription ? getMaterialDetail(config.material, storeSettings) : { name: '', price: 0 };
      const featuresSum = isPrescription
        ? (config.features || []).reduce((sum, f) => sum + (getFeatureDetail(f, storeSettings).price || 0), 0)
        : 0;

      // FIXED: addOnPrice is now derived from the SAME type/material/feature prices
      // rendered as line items below — never from the separately-stored
      // config.addOnPrice number. Guarantees the bill's breakdown always sums to
      // exactly item.price.
      const addOnPrice = typeDetail.price + materialDetail.price + featuresSum;
      const basePrice = isPrescription ? (item.price - opticianFee - addOnPrice) : item.price;

      return {
        isPrescription,
        basePrice,
        opticianFee,
        addOnPrice,
        totalPrice: item.price
      };
    };

    // Compile Itemized Rows
    let itemRows = '';
    for (const item of order.orderItems) {
      const breakdown = getItemBreakdown(item);
      const optionsText = [];
      
      if (item.options?.color) optionsText.push(`<strong>Color:</strong> ${item.options.color}`);
      if (item.options?.size) optionsText.push(`<strong>Size:</strong> ${item.options.size}`);
      
      // Render prescription details if present
      if (item.options?.prescriptionData) {
        const rx = item.options.prescriptionData;
        const rxDetails = [];
        if (rx.rightSph || rx.rightCyl || rx.rightAxis) {
          rxDetails.push(`R: ${rx.rightSph || '0.00'}/${rx.rightCyl || '0.00'}x${rx.rightAxis || '0'}`);
        }
        if (rx.leftSph || rx.leftCyl || rx.leftAxis) {
          rxDetails.push(`L: ${rx.leftSph || '0.00'}/${rx.leftCyl || '0.00'}x${rx.leftAxis || '0'}`);
        }
        if (rx.pd) {
          rxDetails.push(`PD: ${rx.pd}mm`);
        }
        if (rxDetails.length > 0) {
          optionsText.push(`<strong>Rx:</strong> ${rxDetails.join(' | ')}`);
        }
      }

      const basicOptionsHtml = optionsText.length > 0
        ? `<div style="font-size: 11px; color: #777777; margin-top: 4px; line-height: 1.4;">${optionsText.join(' &bull; ')}</div>`
        : '';

      // Compile detailed price breakdown list
      let breakdownHtml = '';
      const isCustomized = breakdown.isPrescription;
      
      if (isCustomized) {
        breakdownHtml += `
          <div style="margin-top: 8px; padding-top: 6px; border-top: 1px dashed #e1e8ed; font-size: 11px; color: #666666; line-height: 1.6;">
            <div style="font-weight: bold; color: #0B132B; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px; margin-bottom: 3px;">Price Breakdown:</div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span>&bull; Base Frame Price:</span>
              <span style="font-family: monospace;">₹${breakdown.basePrice.toLocaleString('en-IN')}</span>
            </div>
        `;
        
        if (breakdown.opticianFee > 0) {
          breakdownHtml += `
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span>&bull; Optician Prescription Fee:</span>
              <span style="font-family: monospace;">+ ₹${breakdown.opticianFee.toLocaleString('en-IN')}</span>
            </div>
          `;
        }

        if (item.options?.prescriptionData?.lensConfig) {
          const config = item.options.prescriptionData.lensConfig;
          
          // Lens Type Price
          if (item.options.lensType) {
            const lType = getLensTypeDetail(item.options.lensType, storeSettings);
            if (lType.price > 0) {
              breakdownHtml += `
                <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                  <span>&bull; ${lType.name}:</span>
                  <span style="font-family: monospace;">+ ₹${lType.price.toLocaleString('en-IN')}</span>
                </div>
              `;
            }
          }

          // Material Price
          if (config.material) {
            const mat = getMaterialDetail(config.material, storeSettings);
            if (mat.price > 0) {
              breakdownHtml += `
                <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                  <span>&bull; Material (${mat.name}):</span>
                  <span style="font-family: monospace;">+ ₹${mat.price.toLocaleString('en-IN')}</span>
                </div>
              `;
            }
          }

          // Features/Coatings Prices
          if (config.features && config.features.length > 0) {
            for (const f of config.features) {
              const feat = getFeatureDetail(f, storeSettings);
              if (feat.price > 0) {
                breakdownHtml += `
                  <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                    <span>&bull; Coating (${feat.name}):</span>
                    <span style="font-family: monospace;">+ ₹${feat.price.toLocaleString('en-IN')}</span>
                  </div>
                `;
              }
            }
          }
        }

        breakdownHtml += `
            <div style="display: flex; justify-content: space-between; margin-top: 4px; padding-top: 4px; border-top: 1px dotted #e1e8ed; font-weight: bold; color: #1B3F6E;">
              <span>&bull; Unit Subtotal:</span>
              <span style="font-family: monospace;">₹${item.price.toLocaleString('en-IN')}</span>
            </div>
          </div>
        `;
      }

      // Format image URL
      let imageUrl = item.image || '';
      if (imageUrl && imageUrl.startsWith('/')) {
        imageUrl = `${backendUrl}${imageUrl}`;
      }

      itemRows += `
        <tr>
          <td style="padding: 15px 10px; border-bottom: 1px solid #eef2f6; width: 60px; text-align: center; vertical-align: middle;">
            ${imageUrl ? `<img src="${imageUrl}" style="width: 50px; height: auto; max-height: 35px; object-fit: contain; border-radius: 4px; background-color: #f9f9f9; border: 1px solid #eaeaea;" alt="${item.name}">` : ''}
          </td>
          <td style="padding: 15px 10px; border-bottom: 1px solid #eef2f6; text-align: left; vertical-align: middle;">
            <div style="font-weight: bold; color: #333333; font-size: 14px;">${item.name}</div>
            ${basicOptionsHtml}
            ${breakdownHtml}
          </td>
          <td style="padding: 15px 10px; border-bottom: 1px solid #eef2f6; text-align: center; font-size: 14px; vertical-align: middle; color: #555555;">
            ${item.qty}
          </td>
          <td style="padding: 15px 10px; border-bottom: 1px solid #eef2f6; text-align: right; font-family: monospace; font-size: 14px; vertical-align: middle; color: #333333; font-weight: bold;">
            ₹${(item.price * item.qty).toLocaleString('en-IN')}
          </td>
        </tr>
      `;
    }

    const itemsPriceStr = (order.itemsPrice || 0).toLocaleString('en-IN');
    const shippingPriceStr = order.shippingPrice === 0 ? 'Free' : `₹${(order.shippingPrice || 0).toLocaleString('en-IN')}`;
    const totalPriceStr = (order.totalPrice || 0).toLocaleString('en-IN');
    
    const paymentId = order.paymentResult?.id || 'N/A';
    const paymentMethod = order.paymentMethod || 'Razorpay';

    const shippingName = order.shippingAddress?.name || customerName;
    const shippingAddressStr = order.shippingAddress?.address || '';
    const shippingCity = order.shippingAddress?.city || '';
    const shippingState = order.shippingAddress?.state || '';
    const shippingZip = order.shippingAddress?.zipCode || '';
    const shippingPhone = order.shippingAddress?.phone || '';

    // Complete Luxury Navy & Gold HTML Template
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EyeLeads Optics - Purchase Invoice</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #f6f8fa;
      color: #333333;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
  </style>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f6f8fa; color: #333333; margin: 0; padding: 0; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e1e8ed; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
    <!-- Header with deep Navy & Gold -->
    <div style="background-color: #0B132B; padding: 35px 30px; text-align: center; border-bottom: 3px solid #C5A880;">
      <h1 style="color: #C5A880; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; font-weight: 400; font-family: Garamond, 'Georgia', serif;">EyeLeads</h1>
      <p style="color: #ffffff; margin: 5px 0 0 0; font-size: 11px; opacity: 0.8; letter-spacing: 1px; text-transform: uppercase;">Luxury Eyewear &amp; Precision Care</p>
    </div>
    
    <div style="padding: 30px;">
      <div style="font-size: 18px; font-weight: bold; color: #0B132B; margin-bottom: 10px;">Thank you for your purchase!</div>
      <div style="font-size: 14px; line-height: 1.6; color: #555555; margin-bottom: 25px;">
        Dear ${customerName}, we have successfully processed your payment. Your order is now being verified and prepared by our laboratory technicians. Below is your detailed purchase invoice.
      </div>
      
      <!-- Order Details Grid Box -->
      <div style="background-color: #f9fbfd; border: 1px solid #eef2f6; border-radius: 6px; padding: 15px; margin-bottom: 25px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; line-height: 1.6;">
          <tr>
            <td style="padding: 3px 0; font-weight: bold; color: #0B132B; width: 130px; vertical-align: top;">Order Number:</td>
            <td style="padding: 3px 0; color: #333333;">${order.orderNumber}</td>
          </tr>
          <tr>
            <td style="padding: 3px 0; font-weight: bold; color: #0B132B; vertical-align: top;">Order Date:</td>
            <td style="padding: 3px 0; color: #333333;">${orderDate}</td>
          </tr>
          <tr>
            <td style="padding: 3px 0; font-weight: bold; color: #0B132B; vertical-align: top;">Payment Details:</td>
            <td style="padding: 3px 0; color: #333333;">${paymentMethod} (ID: ${paymentId})</td>
          </tr>
          <tr>
            <td style="padding: 3px 0; font-weight: bold; color: #0B132B; vertical-align: top;">Payment Status:</td>
            <td style="padding: 3px 0; color: #2e7d32; font-weight: bold;">PAID / CONFIRMED</td>
          </tr>
        </table>
      </div>
      
      <!-- Itemized Products Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
        <thead>
          <tr style="background-color: #f4f6f9;">
            <th colspan="2" style="color: #0B132B; text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #e1e8ed; font-weight: bold;">Product Details</th>
            <th style="color: #0B132B; text-align: center; padding: 10px; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #e1e8ed; font-weight: bold; width: 50px;">Qty</th>
            <th style="color: #0B132B; text-align: right; padding: 10px; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #e1e8ed; font-weight: bold; width: 100px;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>
      
      <!-- Financial Summary Section -->
      <div style="width: 260px; margin-left: auto; margin-bottom: 30px; font-size: 14px; line-height: 1.6;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; text-align: left; color: #666666;">Subtotal Items:</td>
            <td style="padding: 4px 0; text-align: right; font-family: monospace; color: #333333;">₹${itemsPriceStr}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; text-align: left; color: #666666;">Shipping &amp; Handling:</td>
            <td style="padding: 4px 0; text-align: right; font-family: monospace; color: #333333;">${shippingPriceStr}</td>
          </tr>
          <tr style="border-top: 2px solid #C5A880;">
            <td style="padding: 10px 0 4px 0; text-align: left; font-weight: bold; color: #0B132B; font-size: 15px;">Total Paid:</td>
            <td style="padding: 10px 0 4px 0; text-align: right; font-family: monospace; font-weight: bold; color: #0B132B; font-size: 16px;">₹${totalPriceStr}</td>
          </tr>
        </table>
      </div>
      
      <!-- Shipping Address Box -->
      <div style="border-top: 1px solid #e1e8ed; padding-top: 20px; margin-top: 20px;">
        <div style="font-size: 13px; font-weight: bold; color: #0B132B; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Shipping Destination</div>
        <div style="font-size: 13px; line-height: 1.6; color: #555555; background-color: #fafafa; border: 1px solid #f0f0f0; border-radius: 4px; padding: 12px 15px;">
          <strong>${shippingName}</strong><br>
          ${shippingAddressStr}<br>
          ${shippingCity}, ${shippingState} - ${shippingZip}<br>
          <strong>Phone:</strong> ${shippingPhone}
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f4f6f9; padding: 25px 20px; text-align: center; font-size: 11px; color: #777777; border-top: 1px solid #e1e8ed; line-height: 1.5;">
      <p style="margin: 0 0 8px 0;">If you have any questions regarding this invoice or need to update your prescription details, please reply directly to this email or reach out to our support team.</p>
      <p style="margin: 0 0 8px 0; font-weight: bold;">&copy; 2026 EyeLeads Optics Private Limited. All rights reserved.</p>
      <p style="margin: 0;">Visit our luxury storefront at <a href="${clientUrl}" style="color: #C5A880; text-decoration: none; font-weight: bold;">eyeleads.com</a></p>
    </div>
  </div>
</body>
</html>
    `;

    // Construct Resend email payload
    const payload = {
      from: fromEmail,
      to: [recipientEmail],
      subject: `Invoice for Order #${order.orderNumber} - EyeLeads Optics`,
      html: htmlContent
    };

    console.log(`[Resend Email Setup] Preparing invoice dispatch for Order #${order.orderNumber} to: ${recipientEmail}`);
    
    try {
      const result = await sendRawEmail(payload);
      console.log(`[Resend Email Success] Invoice sent successfully for Order #${order.orderNumber}. Resend Response ID: ${result.id}`);
      return result;
    } catch (apiError) {
      const errorMessage = apiError.message || '';
      const isSandboxError = errorMessage.includes('403') || 
                             errorMessage.includes('testing emails') || 
                             errorMessage.includes('validation_error');
      
      if (isSandboxError && recipientEmail.toLowerCase() !== 'eyeleadscare@gmail.com') {
        console.warn(`[Resend Sandbox Fallback] Target recipient ${recipientEmail} is not verified in Resend sandbox. Rerouting invoice to verified owner email: eyeleadscare@gmail.com...`);
        
        const fallbackPayload = {
          ...payload,
          to: ['eyeleadscare@gmail.com'],
          subject: `[SANDBOX FORWARD to ${recipientEmail}] ${payload.subject}`
        };
        
        const result = await sendRawEmail(fallbackPayload);
        console.log(`[Resend Sandbox Fallback Success] Invoice successfully rerouted and sent to eyeleadscare@gmail.com. Resend Response ID: ${result.id}`);
        return result;
      } else {
        throw apiError;
      }
    }
  } catch (error) {
    console.error(`[Resend Email Error] Failed to dispatch purchase invoice for order ${order?._id || 'unknown'}:`, error.message);
    throw error;
  }
};
