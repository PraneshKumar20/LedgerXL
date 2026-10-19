/**
 * Validation utilities for Auth & Forms
 */

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Validates whether an email string meets standard RFC-compliant domain and TLD format.
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  return EMAIL_REGEX.test(email.trim());
};

/**
 * Returns a human-friendly error message if email is invalid, or null if valid.
 */
export const getEmailValidationError = (email) => {
  if (!email || typeof email !== "string" || !email.trim()) {
    return "Email address is required.";
  }

  const trimmed = email.trim();
  const atIndex = trimmed.indexOf("@");

  if (atIndex === -1) {
    return "Email must contain an '@' symbol.";
  }

  if (atIndex === 0) {
    return "Email is missing a username before the '@' symbol.";
  }

  const domain = trimmed.substring(atIndex + 1);
  if (!domain) {
    return "Email is missing a domain (e.g. example.com).";
  }

  if (!domain.includes(".")) {
    return "Email is missing a domain extension (e.g. .com). Please provide a complete email address.";
  }

  const tld = domain.substring(domain.lastIndexOf(".") + 1);
  if (tld.length < 2) {
    return "Email domain extension is incomplete (must be at least 2 characters, like .com).";
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return "Please enter a valid email address (e.g. name@example.com).";
  }

  return null;
};

/**
 * Inspects an email string for common typos (e.g. missing .com, .con, gamil.com)
 * and returns the suggested corrected email, or null if no typo detected.
 */
export const getEmailSuggestion = (email) => {
  if (!email || typeof email !== "string") return null;
  const trimmed = email.trim().toLowerCase();
  const atIndex = trimmed.indexOf("@");
  if (atIndex <= 0) return null;

  const user = trimmed.substring(0, atIndex);
  const domain = trimmed.substring(atIndex + 1);

  if (!domain) return null;

  // 1. Missing .com on common webmail providers (e.g. user@gmail -> user@gmail.com)
  const commonNoDot = {
    gmail: "gmail.com",
    yahoo: "yahoo.com",
    hotmail: "hotmail.com",
    outlook: "outlook.com",
    icloud: "icloud.com",
    protonmail: "protonmail.com",
    proton: "proton.me",
    live: "live.com"
  };

  if (commonNoDot[domain]) {
    return `${user}@${commonNoDot[domain]}`;
  }

  // 2. Misspelled domain names with correct or missing TLD
  const misspelledDomains = {
    "gamil.com": "gmail.com",
    "gmai.com": "gmail.com",
    "gmial.com": "gmail.com",
    "gmaill.com": "gmail.com",
    "gamil": "gmail.com",
    "gmai": "gmail.com",
    "yaho.com": "yahoo.com",
    "yhoo.com": "yahoo.com",
    "hotmial.com": "hotmail.com",
    "hotmaill.com": "hotmail.com",
    "outlok.com": "outlook.com",
    "outloo.com": "outlook.com"
  };

  if (misspelledDomains[domain]) {
    return `${user}@${misspelledDomains[domain]}`;
  }

  // 3. Typo TLDs (e.g. user@example.con -> user@example.com)
  const typoTlds = [".con", ".cmo", ".cpm", ".comm", ".coom"];
  for (const typo of typoTlds) {
    if (domain.endsWith(typo)) {
      const baseDomain = domain.substring(0, domain.length - typo.length);
      return `${user}@${baseDomain}.com`;
    }
  }

  // 4. Any domain without a dot that is at least 3 characters and has no special chars
  if (!domain.includes(".") && domain.length >= 3 && /^[a-zA-Z0-9-]+$/.test(domain)) {
    return `${user}@${domain}.com`;
  }

  return null;
};
