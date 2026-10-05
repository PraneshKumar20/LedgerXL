/**
 * Evaluates current authentication & session state from localStorage.
 *
 * Rules:
 * 1. An authenticated session requires BOTH a non-empty JWT token AND a non-guest user object.
 * 2. An explicit demo session requires user.isGuest === true.
 * 3. A user object alone without a valid token is NOT considered authenticated.
 */
export const getAuthSession = () => {
  if (typeof window === "undefined") {
    return { isAuthenticated: false, isDemo: false, user: null, token: null };
  }

  try {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!userStr) {
      return { isAuthenticated: false, isDemo: false, user: null, token: null };
    }

    const user = JSON.parse(userStr);

    if (user?.isGuest) {
      return { isAuthenticated: false, isDemo: true, user, token: null };
    }

    const hasValidToken = Boolean(
      token &&
      token !== "undefined" &&
      token !== "null" &&
      token.trim() !== ""
    );

    if (hasValidToken && user) {
      return { isAuthenticated: true, isDemo: false, user, token };
    }
  } catch {
    // Malformed JSON in localStorage
  }

  return { isAuthenticated: false, isDemo: false, user: null, token: null };
};
