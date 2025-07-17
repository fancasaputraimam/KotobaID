# Google reCAPTCHA Setup Instructions

## Langkah 1: Mendapatkan reCAPTCHA Keys

1. Kunjungi [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Login dengan akun Google Anda
3. Klik "+" atau "Create" untuk membuat site baru
4. Isi form dengan informasi berikut:
   - **Label**: KotobaID (atau nama aplikasi Anda)
   - **reCAPTCHA type**: reCAPTCHA v2 → "I'm not a robot" Checkbox
   - **Domains**: 
     - `localhost` (untuk development)
     - Domain production Anda (misalnya: `kotobaid.com`)
   - **Owners**: Email Google Anda
   - **Accept the reCAPTCHA Terms of Service**: ✓

5. Klik "Submit"
6. Setelah berhasil, Anda akan mendapatkan:
   - **Site Key** (Public Key) - untuk frontend
   - **Secret Key** (Private Key) - untuk backend

## Langkah 2: Konfigurasi Keys

### Frontend Configuration
Buka file `src/config/recaptcha.ts` dan ganti:

```typescript
export const RECAPTCHA_CONFIG = {
  // Ganti dengan Site Key Anda
  SITE_KEY: 'your-site-key-here',
  
  // Ganti dengan Secret Key Anda (untuk backend)
  SECRET_KEY: 'your-secret-key-here',
  
  // ... konfigurasi lainnya
};
```

### Environment Variables (Recommended)
Untuk keamanan yang lebih baik, gunakan environment variables:

1. Buat file `.env.local` di root project:
```
VITE_RECAPTCHA_SITE_KEY=your-site-key-here
RECAPTCHA_SECRET_KEY=your-secret-key-here
```

2. Update `src/config/recaptcha.ts`:
```typescript
export const RECAPTCHA_CONFIG = {
  SITE_KEY: import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
  SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY || '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe',
  // ... konfigurasi lainnya
};
```

## Langkah 3: Backend Integration (Optional)

Untuk keamanan penuh, Anda perlu memverifikasi token reCAPTCHA di backend:

### Node.js/Express Example:
```javascript
const express = require('express');
const axios = require('axios');
const app = express();

app.post('/verify-recaptcha', async (req, res) => {
  const { token } = req.body;
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
  try {
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      `secret=${secretKey}&response=${token}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    const { success, score } = response.data;
    
    if (success) {
      res.json({ success: true, score });
    } else {
      res.json({ success: false, error: 'reCAPTCHA verification failed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});
```

## Langkah 4: Testing

### Development Testing
Keys yang sudah tersedia (test keys) akan berfungsi di localhost:
- Site Key: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`
- Secret Key: `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`

Test keys ini akan selalu mengembalikan result sukses.

### Production Testing
1. Deploy aplikasi ke domain yang sudah didaftarkan
2. Test login dan register dengan reCAPTCHA
3. Periksa browser console untuk error

## Langkah 5: Customization

### Styling
Anda dapat menyesuaikan tampilan reCAPTCHA:

```typescript
<ReCaptcha
  size="compact"      // normal, compact, invisible
  theme="dark"        // light, dark
  className="my-4"    // custom CSS class
/>
```

### Error Handling
Aplikasi sudah dilengkapi dengan error handling untuk:
- reCAPTCHA expired
- reCAPTCHA error
- Network error
- Invalid token

## Troubleshooting

### Common Issues:

1. **reCAPTCHA not showing**:
   - Periksa apakah script Google reCAPTCHA sudah dimuat
   - Pastikan domain sudah terdaftar di Google reCAPTCHA admin

2. **"Invalid site key" error**:
   - Periksa apakah Site Key sudah benar
   - Pastikan domain sudah terdaftar

3. **CORS errors**:
   - Pastikan domain sudah terdaftar di Google reCAPTCHA
   - Periksa apakah tidak ada typo di domain

4. **reCAPTCHA always fails**:
   - Periksa Secret Key di backend
   - Pastikan token dikirim dengan benar

## Security Best Practices

1. **Never expose Secret Key di frontend**
2. **Always verify reCAPTCHA token di backend**
3. **Use environment variables untuk keys**
4. **Implement rate limiting**
5. **Log failed attempts untuk monitoring**

## Files yang Sudah Dimodifikasi

1. `index.html` - Added reCAPTCHA script
2. `src/components/common/ReCaptcha.tsx` - reCAPTCHA component
3. `src/config/recaptcha.ts` - Configuration file
4. `src/components/auth/LoginForm.tsx` - Added reCAPTCHA to login
5. `src/components/auth/RegisterForm.tsx` - Added reCAPTCHA to register

## Next Steps

1. Ganti test keys dengan production keys
2. Implementasi backend verification
3. Deploy dan test di production
4. Monitor reCAPTCHA analytics di Google admin console