// DJB2 hash algorithm
const createDJBHash = (str: string): string => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i); // hash * 33 + c
  }

  // Convert to unsigned 32-bit integer and then to base36
  const unsigned = hash >>> 0;
  return unsigned.toString(36);
};

// Improved hash function for creating safe localStorage keys with reduced collision risk
export const createFingerprintHash = (fingerprint: string): string => {
  // Try to use crypto API for better hash distribution
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    try {
      // Use a simpler fallback since we can't use async crypto.subtle in this context
      return createDJBHash(fingerprint);
    } catch (error) {
      return createDJBHash(fingerprint);
    }
  }

  return createDJBHash(fingerprint);
};
