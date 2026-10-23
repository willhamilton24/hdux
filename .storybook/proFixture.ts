/** Local-only Storybook validation. Production validation code is unchanged. */
export const PRO_KEY = "HDUX-PRO-TEST-0000-0000-0000";
export const VALIDATION_URL = "/__storybook/license/validate";

export function mockProValidation() {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    if (input === VALIDATION_URL) {
      const valid = init?.method === "POST" && JSON.parse(String(init.body)).key === PRO_KEY;
      return new Response(JSON.stringify({ valid }), { status: valid ? 200 : 403 });
    }
    return originalFetch(input, init);
  };
  return () => { globalThis.fetch = originalFetch; };
}
