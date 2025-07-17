// Google reCAPTCHA Configuration
// You need to replace these with your actual reCAPTCHA keys from Google reCAPTCHA admin console

export const RECAPTCHA_CONFIG = {
  // Site key (public key) - use this in the frontend
  SITE_KEY: '6Lfg0oIrAAAAADD5dOQgcoy6kPmoM9RscFj-3ulE',
  
  // Secret key (private key) - use this in the backend for verification
  SECRET_KEY: '6Lfg0oIrAAAAABMpa3abct1v2imfe2nqA8LPaM_Q',
  
  // reCAPTCHA API endpoints
  VERIFY_URL: 'https://www.google.com/recaptcha/api/siteverify',
  
  // Default settings
  THEME: 'light' as const,
  SIZE: 'normal' as const,
  
  // Minimum score for reCAPTCHA v3 (if you upgrade to v3 later)
  MIN_SCORE: 0.5
};

// Helper function to verify reCAPTCHA token on the backend
export const verifyRecaptcha = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch(RECAPTCHA_CONFIG.VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${RECAPTCHA_CONFIG.SECRET_KEY}&response=${token}`,
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
};

// Note: In a real application, you should:
// 1. Keep the SECRET_KEY on the backend only
// 2. Create an API endpoint to verify the reCAPTCHA token
// 3. Never expose the secret key in frontend code