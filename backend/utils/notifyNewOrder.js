import { sendEmail } from './sendEmail.js';

/**
 * Emails the admin whenever a new order is paid for. Fire-and-forget — call
 * this without awaiting if you don't want it to delay the response to the
 * customer.
 */
export async function notifyAdminNewOrder(order) {
  const itemsSummary = order.orderItems.map((item) => `${item.qty}x ${item.name}`).join(', ');
  const addr = order.shippingAddress;

  const emailHtml = `
    <h2>New Order Received — ${order.orderNumber}</h2>
    <p><strong>Customer:</strong> ${addr.name || 'N/A'} (${addr.email || 'no email'})</p>
    <p><strong>Phone:</strong> ${addr.phone || 'N/A'}</p>
    <p><strong>Items:</strong> ${itemsSummary}</p>
    <p><strong>Total:</strong> ₹${order.totalPrice}</p>
    <p><strong>Shipping to:</strong> ${addr.address}, ${addr.city}, ${addr.state} - ${addr.zipCode}, ${addr.country || 'India'}</p>
    ${order.isInternational
      ? '<p style="color:#B8952A;"><strong>⚠️ International order — manual Shiprocket X / courier shipping required.</strong></p>'
      : '<p>Domestic order — Shiprocket order is being created automatically.</p>'
    }
  `;

  await sendEmail({
    to: process.env.ADMIN_NOTIFICATION_EMAIL,
    subject: `New Order — ${order.orderNumber} (₹${order.totalPrice})`,
    html: emailHtml
  });
}
