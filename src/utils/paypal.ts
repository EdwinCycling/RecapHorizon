export function validatePayPalMeLink(link: string): boolean {
  if (!link) return false;
  // Normalize
  const trimmed = link.trim();
  // Allow with or without protocol, but must contain paypal.me/<handle>
  const regex = /^(https?:\/\/)?(www\.)?paypal\.me\/[A-Za-z0-9_.-]+(\/)?$/i;
  return regex.test(trimmed);
}

export const PAYPAL_ME_INFO_URL = 'https://www.paypal.com/uk/digital-wallet/send-receive-money/paypal-me';