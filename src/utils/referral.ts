export function generateReferralCode(length: number = 20): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  const array = new Uint32Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      code += chars[array[i] % chars.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return code;
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const maskedLocal = local.length <= 2
    ? local[0] + '*'.repeat(Math.max(0, local.length - 1))
    : local.slice(0, 2) + '*'.repeat(Math.max(0, local.length - 2));
  const domainParts = domain.split('.');
  const domainName = domainParts[0];
  const maskedDomain = domainName.length <= 2
    ? domainName[0] + '*'.repeat(Math.max(0, domainName.length - 1))
    : domainName.slice(0, 2) + '*'.repeat(Math.max(0, domainName.length - 2));
  const tld = domainParts.slice(1).join('.');
  // Return without '@' or '.' so it will not match a full email pattern per Firestore rules
  return `${maskedLocal} at ${maskedDomain}${tld ? ' dot ' + tld : ''}`;
}

export function buildReferralJoinUrl(code: string): string {
  const base = window.location.origin;
  return `${base}/?ref=${encodeURIComponent(code)}`;
}