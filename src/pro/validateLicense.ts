export type ValidationResult = { valid: true } | { valid: false; reason: string };

const KEY_RE = /^HDUX-PRO-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

/** Offline format check — no network required. */
export function validateLicenseFormat(key: string): boolean {
  return KEY_RE.test(key.toUpperCase().trim());
}

/**
 * Validates a license key against the HDUX license service.
 * Falls back to a format check if the service is unreachable.
 */
export async function validateLicense(
  key: string,
  validationUrl = "https://api.hdux.dev/v1/license/validate"
): Promise<ValidationResult> {
  const normalized = key.toUpperCase().trim();
  if (!validateLicenseFormat(normalized)) {
    return { valid: false, reason: "Invalid key format" };
  }

  try {
    const res = await fetch(validationUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: normalized }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return { valid: false, reason: (json as { error?: string }).error ?? "License invalid" };
    }

    return { valid: true };
  } catch {
    // License service unreachable — fail closed; no offline grant without a signed key
    return { valid: false, reason: "License service unreachable" };
  }
}
