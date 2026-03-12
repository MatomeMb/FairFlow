import { Resend } from 'resend';

let _resend: InstanceType<typeof Resend> | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY ?? '');
  return _resend;
}

const FROM_ORDERS = process.env.RESEND_FROM_ORDERS ?? 'Fairflow Orders <orders@fairflow.co.za>';
const FROM_MERCHANTS = process.env.RESEND_FROM_MERCHANTS ?? 'Fairflow <merchants@fairflow.co.za>';
const portalUrl = process.env.AUTH_PORTAL_BASE_URL ?? 'https://portal.fairflow.co.za';

interface DeliveryAddress {
  name?: string;
  line1?: string;
  line2?: string;
  suburb?: string;
  city?: string;
  postal_code?: string;
  phone?: string;
}

interface OrderDetails {
  orderId: string;
  productTitle: string;
  amountCents: number;
  customerEmail: string;
  deliveryAddress: DeliveryAddress | null;
  estimatedDeliveryDate?: string | null;
  merchantBusinessName: string;
  dashboardUrl?: string;
}

interface LowStockDetails {
  merchantEmail: string;
  merchantBusinessName: string;
  productTitle: string;
  stockCount: number;
  dashboardUrl?: string;
}

interface KycStatusDetails {
  merchantEmail: string;
  merchantBusinessName: string;
  approved: boolean;
  notes?: string;
  dashboardUrl?: string;
}

interface OrderCheckinEmailDetails {
  customerEmail: string;
  orderId: string;
  productTitle: string;
  estimatedDeliveryDate: string | null;
  merchantBusinessName: string;
  checkinNumber: number;
  orderStatusUrl: string;
}

interface DeliveryDateEmailDetails {
  customerEmail: string;
  orderId: string;
  productTitle: string;
  estimatedDeliveryDate: string;
  merchantBusinessName: string;
}

const formatRand = (cents: number) => `R${(cents / 100).toFixed(2)}`;

const formatAddress = (addr: OrderDetails['deliveryAddress']): string => {
  if (!addr) return 'No delivery address provided.';
  return [
    addr.name,
    addr.line1,
    addr.line2,
    addr.suburb,
    [addr.city, addr.postal_code].filter(Boolean).join(' '),
    addr.phone ? `Tel: ${addr.phone}` : undefined,
  ].filter(Boolean).join('\n');
};

const shouldSendEmails = (): boolean => {
  if (!process.env.RESEND_API_KEY) return false;
  if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') return false;
  return true;
};

export async function sendMerchantOrderNotification(
  merchantEmail: string,
  order: OrderDetails,
): Promise<void> {
  if (!shouldSendEmails()) return;

  const dashboardLink = order.dashboardUrl ?? `${portalUrl}/dashboard/merchant`;
  const addressBlock = formatAddress(order.deliveryAddress);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>New Order</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">
        <tr>
          <td style="background:#18181b;padding:24px 32px;">
            <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px;">fairflow</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;">New order received</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#71717a;">${order.merchantBusinessName}</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;border-radius:6px;padding:16px;margin-bottom:24px;">
              <tr>
                <td style="font-size:13px;color:#71717a;padding-bottom:4px;">Product</td>
                <td align="right" style="font-size:13px;color:#71717a;padding-bottom:4px;">Amount</td>
              </tr>
              <tr>
                <td style="font-size:15px;font-weight:600;color:#18181b;">${order.productTitle}</td>
                <td align="right" style="font-size:15px;font-weight:700;color:#18181b;">${formatRand(order.amountCents)}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding-top:12px;font-size:12px;color:#a1a1aa;">Order ID: ${order.orderId}</td>
              </tr>
            </table>
            <h2 style="margin:0 0 8px;font-size:14px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">Customer</h2>
            <p style="margin:0 0 24px;font-size:15px;color:#18181b;">${order.customerEmail}</p>
            <h2 style="margin:0 0 8px;font-size:14px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">Deliver to</h2>
            <p style="margin:0 0 24px;font-size:15px;color:#18181b;white-space:pre-line;line-height:1.6;">${addressBlock}</p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#18181b;border-radius:6px;padding:12px 24px;">
                  <a href="${dashboardLink}" style="color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">View order in dashboard</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #e4e4e7;">
            <p style="margin:0;font-size:12px;color:#a1a1aa;">This is an automated notification from Fairflow.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await getResend().emails.send({
    from: FROM_MERCHANTS,
    to: merchantEmail,
    subject: `New order: ${order.productTitle} - ${formatRand(order.amountCents)}`,
    html,
  });
}

export async function sendCustomerOrderConfirmation(order: OrderDetails): Promise<void> {
  if (!shouldSendEmails()) return;

  const addressBlock = formatAddress(order.deliveryAddress);
  const orderStatusUrl = `${portalUrl}/order/${order.orderId}`;
  const estimatedDeliveryLine = order.estimatedDeliveryDate
    ? `<p style="margin:0 0 24px;font-size:15px;color:#18181b;">Estimated delivery date: <strong>${new Date(order.estimatedDeliveryDate).toLocaleDateString('en-ZA', { dateStyle: 'long' })}</strong></p>`
    : '';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Order Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">
        <tr>
          <td style="background:#18181b;padding:24px 32px;">
            <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px;">fairflow</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;">Your order is confirmed</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#71717a;">Thanks for your purchase. ${order.merchantBusinessName} will be in touch about delivery.</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;border-radius:6px;padding:16px;margin-bottom:24px;">
              <tr>
                <td style="font-size:13px;color:#71717a;padding-bottom:4px;">Product</td>
                <td align="right" style="font-size:13px;color:#71717a;padding-bottom:4px;">Amount paid</td>
              </tr>
              <tr>
                <td style="font-size:15px;font-weight:600;color:#18181b;">${order.productTitle}</td>
                <td align="right" style="font-size:15px;font-weight:700;color:#18181b;">${formatRand(order.amountCents)}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding-top:12px;font-size:12px;color:#a1a1aa;">Order ID: ${order.orderId}</td>
              </tr>
            </table>
            <h2 style="margin:0 0 8px;font-size:14px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">Delivering to</h2>
            <p style="margin:0 0 24px;font-size:15px;color:#18181b;white-space:pre-line;line-height:1.6;">${addressBlock}</p>
            ${estimatedDeliveryLine}
            <table cellpadding="0" cellspacing="0" style="margin-top:24px;">
              <tr>
                <td style="background:#f4f4f5;border-radius:6px;padding:12px 20px;">
                  <a href="${orderStatusUrl}" style="color:#18181b;font-size:14px;font-weight:500;text-decoration:none;">Track your order</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #e4e4e7;">
            <p style="margin:0;font-size:12px;color:#a1a1aa;">Powered by Fairflow.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await getResend().emails.send({
    from: FROM_ORDERS,
    to: order.customerEmail,
    subject: `Order confirmed: ${order.productTitle}`,
    html,
  });
}

export async function sendLowStockWarning(details: LowStockDetails): Promise<void> {
  if (!shouldSendEmails()) return;

  const dashboardLink = details.dashboardUrl ?? `${portalUrl}/dashboard/merchant`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>Low Stock</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">
        <tr><td style="background:#18181b;padding:24px 32px;"><span style="color:#ffffff;font-size:20px;font-weight:700;">fairflow</span></td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;">Low stock alert</h1>
          <p style="margin:0 0 24px;font-size:15px;color:#71717a;">${details.merchantBusinessName}</p>
          <p style="margin:0 0 24px;font-size:15px;color:#18181b;"><strong>${details.productTitle}</strong> has only <strong>${details.stockCount} unit${details.stockCount === 1 ? '' : 's'}</strong> remaining.</p>
          <table cellpadding="0" cellspacing="0"><tr><td style="background:#18181b;border-radius:6px;padding:12px 24px;"><a href="${dashboardLink}" style="color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">Restock in dashboard</a></td></tr></table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await getResend().emails.send({
    from: FROM_MERCHANTS,
    to: details.merchantEmail,
    subject: `Low stock: ${details.productTitle} (${details.stockCount} left)`,
    html,
  });
}

export async function sendKycStatusEmail(details: KycStatusDetails): Promise<void> {
  if (!shouldSendEmails()) return;

  const dashboardLink = details.dashboardUrl ?? `${portalUrl}/dashboard/merchant`;
  const subject = details.approved
    ? 'Your Fairflow account is verified'
    : 'Action required: Fairflow KYC update';

  const bodyHtml = details.approved
    ? `
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;">Account verified</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#71717a;">${details.merchantBusinessName}</p>
      <p style="margin:0 0 24px;font-size:15px;color:#18181b;">Your KYC verification is approved. You can now receive payouts from sales made through Fairflow.</p>`
    : `
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;">KYC verification update</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#71717a;">${details.merchantBusinessName}</p>
      <p style="margin:0 0 24px;font-size:15px;color:#18181b;">We were unable to verify your account with the information provided.${details.notes ? `<br/><br/><strong>Reason:</strong> ${details.notes}` : ''}<br/><br/>Please log in to your dashboard and resubmit your KYC information.</p>`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>KYC Status</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">
        <tr><td style="background:#18181b;padding:24px 32px;"><span style="color:#ffffff;font-size:20px;font-weight:700;">fairflow</span></td></tr>
        <tr><td style="padding:32px;">
          ${bodyHtml}
          <table cellpadding="0" cellspacing="0"><tr><td style="background:#18181b;border-radius:6px;padding:12px 24px;"><a href="${dashboardLink}" style="color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">Go to dashboard</a></td></tr></table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await getResend().emails.send({
    from: FROM_MERCHANTS,
    to: details.merchantEmail,
    subject,
    html,
  });
}

export async function sendOrderCheckinEmail(details: OrderCheckinEmailDetails): Promise<void> {
  if (!shouldSendEmails()) return;

  const deliveryLine = details.estimatedDeliveryDate
    ? `<p style="margin:0 0 24px;font-size:15px;color:#18181b;">Your estimated delivery date is <strong>${new Date(details.estimatedDeliveryDate).toLocaleDateString('en-ZA', { dateStyle: 'long' })}</strong>.</p>`
    : `<p style="margin:0 0 24px;font-size:15px;color:#71717a;">No estimated delivery date has been set yet. ${details.merchantBusinessName} will be in touch soon.</p>`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>Order Update</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">
        <tr><td style="background:#18181b;padding:24px 32px;"><span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px;">fairflow</span></td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;">Update on your order</h1>
          <p style="margin:0 0 24px;font-size:15px;color:#71717a;">${details.productTitle} - Order ${details.orderId.slice(0, 8).toUpperCase()}</p>
          <p style="margin:0 0 24px;font-size:15px;color:#18181b;">${details.merchantBusinessName} is preparing your order.</p>
          ${deliveryLine}
          <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr><td style="background:#18181b;border-radius:6px;padding:12px 24px;"><a href="${details.orderStatusUrl}" style="color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">View order status</a></td></tr></table>
          <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.6;">Questions? Reply to this email or contact ${details.merchantBusinessName} directly.</p>
        </td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid #e4e4e7;"><p style="margin:0;font-size:12px;color:#a1a1aa;">Powered by Fairflow.</p></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await getResend().emails.send({
      from: FROM_ORDERS,
      to: details.customerEmail,
      subject: `Update on your ${details.productTitle} order`,
      html,
    });
    console.log(`[Email] Check-in #${details.checkinNumber} sent to ${details.customerEmail}`);
  } catch (error) {
    console.error('[Email] Failed to send order check-in:', error);
    throw error;
  }
}

export async function sendDeliveryDateEmail(details: DeliveryDateEmailDetails): Promise<void> {
  if (!shouldSendEmails()) return;

  const formattedDate = new Date(details.estimatedDeliveryDate).toLocaleDateString('en-ZA', {
    dateStyle: 'long',
  });
  const orderStatusUrl = `${portalUrl}/order/${details.orderId}`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>Delivery Date Confirmed</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">
        <tr><td style="background:#18181b;padding:24px 32px;"><span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px;">fairflow</span></td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;">Delivery date confirmed</h1>
          <p style="margin:0 0 24px;font-size:15px;color:#71717a;">${details.productTitle} - Order ${details.orderId.slice(0, 8).toUpperCase()}</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-radius:6px;border:1px solid #bbf7d0;padding:20px;margin-bottom:24px;">
            <tr><td><p style="margin:0 0 4px;font-size:13px;color:#16a34a;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Estimated delivery</p><p style="margin:0;font-size:20px;font-weight:700;color:#14532d;">${formattedDate}</p></td></tr>
          </table>
          <p style="margin:0 0 24px;font-size:15px;color:#18181b;">${details.merchantBusinessName} has confirmed your order will arrive by this date. You will receive another update when it is marked as shipped.</p>
          <table cellpadding="0" cellspacing="0"><tr><td style="background:#18181b;border-radius:6px;padding:12px 24px;"><a href="${orderStatusUrl}" style="color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">View order status</a></td></tr></table>
        </td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid #e4e4e7;"><p style="margin:0;font-size:12px;color:#a1a1aa;">Powered by Fairflow.</p></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await getResend().emails.send({
      from: FROM_ORDERS,
      to: details.customerEmail,
      subject: `Your delivery date: ${formattedDate} - ${details.productTitle}`,
      html,
    });
    console.log(`[Email] Delivery date email sent to ${details.customerEmail}`);
  } catch (error) {
    console.error('[Email] Failed to send delivery date email:', error);
  }
}
