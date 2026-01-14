const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

const PERSONAL_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'aol.com',
  'protonmail.com',
  'pm.me',
  'gmx.com',
  'yandex.com',
  'mail.com',
  'zoho.com',
]);

function isCorporateEmail(email) {
  if (!email) {
    return false;
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return false;
  }

  const [, domain = ''] = normalizedEmail.split('@');
  const hasSubdomain = domain.split('.').length >= 2;

  return Boolean(domain) && hasSubdomain && !PERSONAL_EMAIL_DOMAINS.has(domain);
}

export default isCorporateEmail;
