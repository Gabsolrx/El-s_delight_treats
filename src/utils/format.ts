import { StoredOrder, CustomCakeFormData } from '../types';
import { BUSINESS_INFO } from '../data/products';

export function formatNaira(amount: number | string | undefined | null): string {
  const num = typeof amount === 'number' ? amount : Number(amount);
  const safeAmount = isNaN(num) ? 0 : num;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(safeAmount).replace('NGN', '₦').trim();
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
}

export function generateWhatsAppOrderUrl(
  order: StoredOrder,
  whatsappUrlNumber?: string,
  bankInfo?: { bank: string; accountNumber: string }
): string {
  const itemsText = order.items
    .map(
      (item, idx) =>
        `*${idx + 1}. ${item.product.name}*\n` +
        `   • Size: ${item.selectedSize.name}\n` +
        `   • Flavour: ${item.selectedFlavour}\n` +
        `   • Quantity: ${item.quantity}\n` +
        `   • Item Price: ${formatNaira(item.unitPrice * item.quantity)}\n` +
        (item.cakeMessage ? `   • Inscription: "${item.cakeMessage}"\n` : '') +
        (item.specialInstructions ? `   • Notes: ${item.specialInstructions}\n` : '')
    )
    .join('\n');

  const deliveryDetails =
    order.customer.fulfillmentType === 'pickup'
      ? `*Fulfillment:* Self-Pickup at Lakeview Phase 1, Amuwo-Odofin, Lagos (${order.customer.deliveryMethod || "El's Delight Store Pickup"})\n   • Note: Free pickup (No delivery charge)`
      : `*Fulfillment:* ${order.customer.deliveryMethod || 'Doorstep Delivery'}\n` +
        `   • Address: ${order.customer.address || 'N/A'}\n` +
        `   • Area/LGA: ${order.customer.area || 'N/A'}\n` +
        `   • Landmark: ${order.customer.landmark || 'N/A'}\n` +
        `   • Preferred Date: ${order.customer.deliveryDate || 'ASAP'}\n` +
        `   • Preferred Time: ${order.customer.deliveryTime || 'Flexible'}\n` +
        `   • Delivery Fee: Pay on delivery directly to driver (Uber/dispatch live rate)`;

  const bankName = bankInfo?.bank || BUSINESS_INFO.payment.bank;
  const accNum = bankInfo?.accountNumber || BUSINESS_INFO.payment.accountNumber;
  const targetWhatsapp = whatsappUrlNumber || BUSINESS_INFO.whatsappUrlNumber;

  const message =
    `Hello El’s Delight Treats,\n\n` +
    `I have made payment for my order.\n\n` +
    `*ORDER SUMMARY (Order #${order.orderId})*\n\n` +
    `${itemsText}\n\n` +
    `*Customer Details:*\n` +
    `• Name: ${order.customer.fullName}\n` +
    `• Phone: ${order.customer.phone}\n` +
    `• Email: ${order.customer.email}\n\n` +
    `${deliveryDetails}\n\n` +
    `*TOTAL AMOUNT TRANSFERRED:* ${formatNaira(order.total)}\n` +
    `*Payment Method:* Bank Transfer to ${bankName} (${accNum})\n\n` +
    `Please confirm my payment and process my order.\n\n` +
    `Thank you!`;

  return `https://wa.me/${targetWhatsapp}?text=${encodeURIComponent(message)}`;
}

export function generateCustomCakeWhatsAppUrl(
  form: CustomCakeFormData,
  whatsappUrlNumber?: string
): string {
  const targetWhatsapp = whatsappUrlNumber || BUSINESS_INFO.whatsappUrlNumber;
  const message =
    `Hello El’s Delight Treats,\n\n` +
    `I would like to request a bespoke custom cake consultation.\n\n` +
    `*CUSTOM CAKE DETAILS*\n` +
    `• Occasion: ${form.occasion}\n` +
    `• Size / Tiers: ${form.cakeSize} (${form.tiers} Tier(s))\n` +
    `• Preferred Flavour: ${form.flavour}\n` +
    `• Colour Palette: ${form.colourTheme}\n` +
    `• Theme / Concept: ${form.themeDescription}\n` +
    `• Inscription on Cake: "${form.cakeMessage || 'None'}"\n` +
    `• Estimated Budget: ${form.budgetRange}\n` +
    `• Event Date: ${form.preferredDate}\n` +
    `• Fulfillment: ${form.deliveryType === 'pickup' ? `Store Pickup at Amuwo-Odofin (${form.deliveryMethod || 'El\'s Delight Store'})` : `${form.deliveryMethod || 'Delivery'} to ${form.deliveryArea || 'Address provided'} (Pay courier on delivery based on Uber/rider rate)`}\n` +
    (form.specialInstructions ? `• Special Instructions: ${form.specialInstructions}\n` : '') +
    (form.referenceUrl ? `• Inspiration Reference: ${form.referenceUrl}\n` : '') +
    `\n*Contact Person:*\n` +
    `• Name: ${form.fullName}\n` +
    `• Phone: ${form.phone}\n` +
    `• Email: ${form.email}\n\n` +
    `Looking forward to your pricing breakdown and availability!`;

  return `https://wa.me/${targetWhatsapp}?text=${encodeURIComponent(message)}`;
}

export function generateDirectProductWhatsAppUrl(
  productName: string,
  price: number,
  sizeName: string,
  flavour: string,
  whatsappUrlNumber?: string
): string {
  const targetWhatsapp = whatsappUrlNumber || BUSINESS_INFO.whatsappUrlNumber;
  const message =
    `Hello El's Delight Treats,\n\n` +
    `I am interested in ordering the *${productName}* (${sizeName}, ${flavour}) for ${formatNaira(price)}.\n\n` +
    `Could you confirm current availability and delivery schedule to my location in Lagos?\n\n` +
    `Thank you!`;

  return `https://wa.me/${targetWhatsapp}?text=${encodeURIComponent(message)}`;
}
