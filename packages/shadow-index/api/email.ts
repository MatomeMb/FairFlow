import { Resend } from 'resend';

let _resend: InstanceType<typeof Resend> | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY ?? '');
  return _resend;
}

const FROM_ORDERS = process.env.RESEND_FROM_ORDERS ?? 'Fairflow Orders <orders@fairflow.co.za>';
const FROM_MERCHANTS = process.env.RESEND_FROM_MERCHANTS ?? 'Fairflow <merchants@fairflow.co.za>';
const portalUrl = process.env.AUTH_PORTAL_BASE_URL ?? 'https://portal.fairflow.co.za';

/** Public URL for the ff mark in emails (SVG/PNG). Override if your CDN serves a PNG for better client support. */
const brandLogoUrl = (): string => {
  const fromEnv = process.env.FAIRFLOW_EMAIL_LOGO_URL?.trim();
  if (fromEnv) return fromEnv;
  const base = portalUrl.replace(/\/$/, '');
  return `${base}/fairflow-logo.svg`;
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Only allow embedding http(s) product images in HTML email. */
const allowedImageUrl = (url: string | undefined | null): string | null => {
  if (!url?.trim()) return null;
  try {
    const u = new URL(url.trim());
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    return url.trim();
  } catch {
    return null;
  }
};

const emailBrandHeader = (): string => {
  const logo = escapeHtml(brandLogoUrl());
  return `<tr>
  <td style="background:#0D1B2A;padding:22px 32px;border-bottom:3px solid #1a9e4a;">
    <table cellpadding="0" cellspacing="0" role="presentation"><tr>
      <td style="vertical-align:middle;padding-right:14px;">
        <img src="${logo}" alt="fairflow" width="40" height="40" style="display:block;width:40px;height:40px;border:0;" />
      </td>
      <td style="vertical-align:middle;">
        <span style="font-size:20px;font-weight:700;color:#FFFFFF;letter-spacing:-0.03em;">fairflow</span>
        <span style="display:block;font-size:11px;color:#8A99AA;letter-spacing:0.12em;text-transform:uppercase;margin-top:2px;">Distributed commerce</span>
      </td>
    </tr></table>
  </td>
</tr>`;
};

const emailFooter = (line = 'This is an automated message from Fairflow.'): string => `<tr>
  <td style="padding:18px 32px;border-top:1px solid #e4e4e7;background:#fafafa;">
    <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.5;">${escapeHtml(line)}</p>
  </td>
</tr>`;

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
  /** HTTPS URL of product image (merchant upload). */
  productImageUrl?: string | null;
  currency?: string;
  paystackReference?: string | null;
}

interface LowStockDetails {
  merchantEmail: string;
  merchantBusinessName: string;
  productTitle: string;
  stockCount: number;
  dashboardUrl?: string;
  productImageUrl?: string | null;
}

interface KycStatusDetails {
  merchantEmail: string;
  merchantBusinessName: string;
  approved: boolean;
  notes?: string;
  dashboardUrl?: string;
  /** ISO date — first scheduled payout after KYC approval */
  nextPayoutDate?: string | null;
  /** Use “payouts active” subject/body (Smile ID / auto-approval path) */
  payoutsActivated?: boolean;
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

const formatMoney = (cents: number, currency = 'ZAR'): string => {
  const c = (currency || 'ZAR').toUpperCase().slice(0, 3);
  const amount = (cents / 100).toFixed(2);
  if (c === 'ZAR') return `R${amount}`;
  if (c === 'USD') return `$${amount}`;
  if (c === 'EUR') return `€${amount}`;
  return `${c} ${amount}`;
};

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
  const addressBlock = escapeHtml(formatAddress(order.deliveryAddress));
  const cur = order.currency ?? 'ZAR';
  const title = escapeHtml(order.productTitle);
  const biz = escapeHtml(order.merchantBusinessName);
  const custEmail = escapeHtml(order.customerEmail);
  const oid = escapeHtml(order.orderId);
  const productImg = allowedImageUrl(order.productImageUrl ?? undefined);
  const imgCell = productImg
    ? `<td width="100" valign="top" style="padding-right:16px;">
         <img src="${escapeHtml(productImg)}" alt="" width="88" height="88" style="display:block;width:88px;height:88px;object-fit:cover;border-radius:10px;border:1px solid #e4e4e7;" />
       </td>`
    : '';
  const payRefMerchant = order.paystackReference?.trim()
    ? `<br/>Payment reference: <span style="font-family:ui-monospace,monospace;color:#52525b;">${escapeHtml(order.paystackReference)}</span>`
    : '';

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
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;box-shadow:0 4px 24px rgba(13,27,42,0.08);">
        ${emailBrandHeader()}
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:0.14em;">Order invoice</p>
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;">New order received</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#71717a;">${biz}</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;border-radius:10px;padding:18px;margin-bottom:24px;">
              <tr>
                ${imgCell}
                <td valign="top">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-size:12px;color:#71717a;padding-bottom:6px;text-transform:uppercase;letter-spacing:0.06em;">Item</td>
                      <td align="right" style="font-size:12px;color:#71717a;padding-bottom:6px;text-transform:uppercase;letter-spacing:0.06em;">Amount</td>
                    </tr>
                    <tr>
                      <td style="font-size:16px;font-weight:600;color:#18181b;line-height:1.35;">${title}</td>
                      <td align="right" style="font-size:16px;font-weight:700;color:#0D1B2A;white-space:nowrap;">${formatMoney(order.amountCents, cur)}</td>
                    </tr>
                    <tr>
                      <td colspan="2" style="padding-top:14px;font-size:12px;color:#a1a1aa;border-top:1px solid #e4e4e7;">
                        Order ID: <span style="font-family:ui-monospace,monospace;color:#52525b;">${oid}</span>${payRefMerchant}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <h2 style="margin:0 0 8px;font-size:12px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:0.1em;">Customer</h2>
            <p style="margin:0 0 24px;font-size:15px;color:#18181b;">${custEmail}</p>
            <h2 style="margin:0 0 8px;font-size:12px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:0.1em;">Deliver to</h2>
            <p style="margin:0 0 24px;font-size:15px;color:#18181b;white-space:pre-line;line-height:1.6;">${addressBlock}</p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#0D1B2A;border-radius:8px;padding:14px 26px;">
                  <a href="${escapeHtml(dashboardLink)}" style="color:#1a9e4a;font-size:15px;font-weight:600;text-decoration:none;">View order in dashboard</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ${emailFooter('This is an automated notification from Fairflow.')}
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await getResend().emails.send({
    from: FROM_MERCHANTS,
    to: merchantEmail,
    subject: `New order: ${order.productTitle} - ${formatMoney(order.amountCents, cur)}`,
    html,
  });
}

export async function sendCustomerOrderConfirmation(order: OrderDetails): Promise<void> {
  if (!shouldSendEmails()) return;

  const addressBlock = escapeHtml(formatAddress(order.deliveryAddress));
  const orderStatusUrl = escapeHtml(`${portalUrl}/order/${order.orderId}`);
  const cur = order.currency ?? 'ZAR';
  const title = escapeHtml(order.productTitle);
  const biz = escapeHtml(order.merchantBusinessName);
  const oid = escapeHtml(order.orderId);
  const receiptDate = new Date().toLocaleDateString('en-ZA', { dateStyle: 'long' });
  const payRef = order.paystackReference?.trim()
    ? `<br/>Payment reference: <strong style="font-family:ui-monospace,monospace;">${escapeHtml(order.paystackReference)}</strong>`
    : '';
  const productImg = allowedImageUrl(order.productImageUrl ?? undefined);
  const imgCell = productImg
    ? `<td width="100" valign="top" style="padding-right:16px;">
         <img src="${escapeHtml(productImg)}" alt="" width="88" height="88" style="display:block;width:88px;height:88px;object-fit:cover;border-radius:10px;border:1px solid #e4e4e7;" />
       </td>`
    : '';

  const estimatedDeliveryLine = order.estimatedDeliveryDate
    ? `<p style="margin:0 0 24px;font-size:15px;color:#18181b;">Estimated delivery date: <strong>${escapeHtml(new Date(order.estimatedDeliveryDate).toLocaleDateString('en-ZA', { dateStyle: 'long' }))}</strong></p>`
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
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;box-shadow:0 4px 24px rgba(13,27,42,0.08);">
        ${emailBrandHeader()}
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:0.14em;">Payment receipt</p>
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;">Your order is confirmed</h1>
            <p style="margin:0 0 8px;font-size:13px;color:#52525b;line-height:1.5;">
              Order <span style="font-family:ui-monospace,monospace;font-weight:600;color:#18181b;">${oid}</span> · ${receiptDate}${payRef}
            </p>
            <p style="margin:0 0 24px;font-size:15px;color:#71717a;">Thanks for your purchase. <strong style="color:#18181b;">${biz}</strong> will be in touch about delivery.</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;border-radius:10px;padding:18px;margin-bottom:24px;">
              <tr>
                ${imgCell}
                <td valign="top">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-size:12px;color:#71717a;padding-bottom:6px;text-transform:uppercase;letter-spacing:0.06em;">Item</td>
                      <td align="right" style="font-size:12px;color:#71717a;padding-bottom:6px;text-transform:uppercase;letter-spacing:0.06em;">Amount paid</td>
                    </tr>
                    <tr>
                      <td style="font-size:16px;font-weight:600;color:#18181b;line-height:1.35;">${title}</td>
                      <td align="right" style="font-size:16px;font-weight:700;color:#0D1B2A;white-space:nowrap;">${formatMoney(order.amountCents, cur)}</td>
                    </tr>
                    <tr>
                      <td colspan="2" style="padding-top:14px;font-size:12px;color:#a1a1aa;border-top:1px solid #e4e4e7;">
                        This email is your proof of payment for the amount shown above.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <h2 style="margin:0 0 8px;font-size:12px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:0.1em;">Delivering to</h2>
            <p style="margin:0 0 24px;font-size:15px;color:#18181b;white-space:pre-line;line-height:1.6;">${addressBlock}</p>
            ${estimatedDeliveryLine}
            <table cellpadding="0" cellspacing="0" style="margin-top:8px;">
              <tr>
                <td style="background:#0D1B2A;border-radius:8px;padding:14px 26px;">
                  <a href="${orderStatusUrl}" style="color:#1a9e4a;font-size:15px;font-weight:600;text-decoration:none;">Track your order</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ${emailFooter('Powered by Fairflow — your payment is held securely until you confirm receipt.')}
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await getResend().emails.send({
    from: FROM_ORDERS,
    to: order.customerEmail,
    subject: `Receipt: ${order.productTitle} — ${formatMoney(order.amountCents, cur)}`,
    html,
  });
}

export async function sendLowStockWarning(details: LowStockDetails): Promise<void> {
  if (!shouldSendEmails()) return;

  const dashboardLink = escapeHtml(details.dashboardUrl ?? `${portalUrl}/dashboard/merchant`);
  const biz = escapeHtml(details.merchantBusinessName);
  const ptitle = escapeHtml(details.productTitle);
  const productImg = allowedImageUrl(details.productImageUrl ?? undefined);
  const imgRow = productImg
    ? `<tr><td style="padding-bottom:20px;"><img src="${escapeHtml(productImg)}" alt="" width="120" height="120" style="display:block;width:120px;height:120px;object-fit:cover;border-radius:10px;border:1px solid #e4e4e7;" /></td></tr>`
    : '';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>Low Stock</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;box-shadow:0 4px 24px rgba(13,27,42,0.08);">
        ${emailBrandHeader()}
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;">Low stock alert</h1>
          <p style="margin:0 0 24px;font-size:15px;color:#71717a;">${biz}</p>
          <table cellpadding="0" cellspacing="0" width="100%">${imgRow}
            <tr><td>
          <p style="margin:0 0 24px;font-size:15px;color:#18181b;"><strong>${ptitle}</strong> has only <strong>${details.stockCount} unit${details.stockCount === 1 ? '' : 's'}</strong> remaining.</p>
            </td></tr>
          </table>
          <table cellpadding="0" cellspacing="0"><tr><td style="background:#0D1B2A;border-radius:8px;padding:14px 26px;"><a href="${dashboardLink}" style="color:#1a9e4a;font-size:15px;font-weight:600;text-decoration:none;">Restock in dashboard</a></td></tr></table>
        </td></tr>
        ${emailFooter()}
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

  const dashboardLink = escapeHtml(details.dashboardUrl ?? `${portalUrl}/dashboard/merchant`);
  const biz = escapeHtml(details.merchantBusinessName);
  const notesBlock = details.notes
    ? `<br/><br/><strong>Reason:</strong> ${escapeHtml(details.notes)}`
    : '';
  const payoutLine =
    details.approved && details.nextPayoutDate
      ? `<p style="margin:0 0 24px;font-size:15px;color:#18181b;"><strong>First payout:</strong> ${escapeHtml(
          new Date(details.nextPayoutDate).toLocaleDateString('en-ZA', { dateStyle: 'long' })
        )} (ZAR, per your payout schedule).</p>`
      : '';
  const subject = details.approved
    ? details.payoutsActivated
      ? "You're verified — payouts are now active"
      : 'Your Fairflow account is verified'
    : 'Action required: Fairflow KYC update';

  const bodyHtml = details.approved
    ? `
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;">${details.payoutsActivated ? 'Identity verified — payouts unlocked' : 'Account verified ✓'}</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#71717a;">${biz}</p>
      <p style="margin:0 0 24px;font-size:15px;color:#18181b;">Congratulations! Your identity verification is approved. Your account is fully verified on Fairflow.</p>
      ${payoutLine}
      <p style="margin:0 0 24px;font-size:15px;color:#18181b;"><strong>Payouts:</strong> Earnings can be paid out according to your schedule once your bank details are on file.</p>`
    : `
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;">KYC verification update</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#71717a;">${biz}</p>
      <p style="margin:0 0 24px;font-size:15px;color:#18181b;">We were unable to verify your account with the information provided.${notesBlock}<br/><br/>Please log in to your dashboard and try verification again or contact support.</p>`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>KYC Status</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;box-shadow:0 4px 24px rgba(13,27,42,0.08);">
        ${emailBrandHeader()}
        <tr><td style="padding:32px;">
          ${bodyHtml}
          <table cellpadding="0" cellspacing="0"><tr><td style="background:#0D1B2A;border-radius:8px;padding:14px 26px;"><a href="${dashboardLink}" style="color:#1a9e4a;font-size:15px;font-weight:600;text-decoration:none;">Go to dashboard</a></td></tr></table>
        </td></tr>
        ${emailFooter()}
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

  const ptitle = escapeHtml(details.productTitle);
  const mbiz = escapeHtml(details.merchantBusinessName);
  const statusUrl = escapeHtml(details.orderStatusUrl);
  const ordShort = escapeHtml(details.orderId.slice(0, 8).toUpperCase());
  const deliveryLine = details.estimatedDeliveryDate
    ? `<p style="margin:0 0 24px;font-size:15px;color:#18181b;">Your estimated delivery date is <strong>${escapeHtml(new Date(details.estimatedDeliveryDate).toLocaleDateString('en-ZA', { dateStyle: 'long' }))}</strong>.</p>`
    : `<p style="margin:0 0 24px;font-size:15px;color:#71717a;">No estimated delivery date has been set yet. ${mbiz} will be in touch soon.</p>`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>Order Update</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;box-shadow:0 4px 24px rgba(13,27,42,0.08);">
        ${emailBrandHeader()}
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;">Update on your order</h1>
          <p style="margin:0 0 24px;font-size:15px;color:#71717a;">${ptitle} — Order ${ordShort}</p>
          <p style="margin:0 0 24px;font-size:15px;color:#18181b;">${mbiz} is preparing your order.</p>
          ${deliveryLine}
          <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr><td style="background:#0D1B2A;border-radius:8px;padding:14px 26px;"><a href="${statusUrl}" style="color:#1a9e4a;font-size:15px;font-weight:600;text-decoration:none;">View order status</a></td></tr></table>
          <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.6;">Questions? Reply to this email or contact ${mbiz} directly.</p>
        </td></tr>
        ${emailFooter('Powered by Fairflow.')}
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

  const formattedDatePlain = new Date(details.estimatedDeliveryDate).toLocaleDateString('en-ZA', {
    dateStyle: 'long',
  });
  const formattedDate = escapeHtml(formattedDatePlain);
  const orderStatusUrl = escapeHtml(`${portalUrl}/order/${details.orderId}`);
  const ptitle = escapeHtml(details.productTitle);
  const mbiz = escapeHtml(details.merchantBusinessName);
  const ordShort = escapeHtml(details.orderId.slice(0, 8).toUpperCase());

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>Delivery Date Confirmed</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;box-shadow:0 4px 24px rgba(13,27,42,0.08);">
        ${emailBrandHeader()}
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;">Delivery date confirmed</h1>
          <p style="margin:0 0 24px;font-size:15px;color:#71717a;">${ptitle} — Order ${ordShort}</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;padding:20px;margin-bottom:24px;">
            <tr><td><p style="margin:0 0 4px;font-size:13px;color:#16a34a;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Estimated delivery</p><p style="margin:0;font-size:20px;font-weight:700;color:#14532d;">${formattedDate}</p></td></tr>
          </table>
          <p style="margin:0 0 24px;font-size:15px;color:#18181b;">${mbiz} has confirmed your order will arrive by this date. You will receive another update when it is marked as shipped.</p>
          <table cellpadding="0" cellspacing="0"><tr><td style="background:#0D1B2A;border-radius:8px;padding:14px 26px;"><a href="${orderStatusUrl}" style="color:#1a9e4a;font-size:15px;font-weight:600;text-decoration:none;">View order status</a></td></tr></table>
        </td></tr>
        ${emailFooter('Powered by Fairflow.')}
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await getResend().emails.send({
      from: FROM_ORDERS,
      to: details.customerEmail,
      subject: `Your delivery date: ${formattedDatePlain} - ${details.productTitle}`,
      html,
    });
    console.log(`[Email] Delivery date email sent to ${details.customerEmail}`);
  } catch (error) {
    console.error('[Email] Failed to send delivery date email:', error);
  }
}
