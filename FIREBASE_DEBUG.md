# Firebase Registration Debug Guide

## Error: "Gagal membuat akun"

Berikut adalah langkah-langkah untuk debug masalah registrasi akun:

## 1. Buka Browser Console
1. Buka Chrome/Firefox Developer Tools (F12)
2. Pergi ke tab "Console"
3. Coba registrasi akun baru
4. Lihat error yang muncul di console

## 2. Kemungkinan Penyebab Error

### A. Firebase Authentication Rules
- **Masalah**: Firebase Authentication mungkin dinonaktifkan
- **Solusi**: 
  1. Buka [Firebase Console](https://console.firebase.google.com)
  2. Pilih project "app-kotoba-id"
  3. Pergi ke Authentication > Sign-in method
  4. Pastikan "Email/Password" diaktifkan

### B. Firestore Rules
- **Masalah**: Firestore rules mungkin terlalu ketat
- **Solusi**: Cek Firestore rules di Firebase Console
- **Rules yang diperlukan**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to create and read their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read and write (for development)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### C. Email Format
- **Masalah**: Format email tidak valid
- **Solusi**: Pastikan email menggunakan format yang benar (contoh: user@example.com)

### D. Password Weak
- **Masalah**: Password terlalu lemah
- **Solusi**: Gunakan password minimal 6 karakter

### E. Network Issues
- **Masalah**: Koneksi internet bermasalah
- **Solusi**: Cek koneksi internet

## 3. Test Manual di Console

Buka browser console dan coba kode berikut:

```javascript
// Test Firebase connection
import { auth, db } from './src/config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

// Test create user
createUserWithEmailAndPassword(auth, 'test@example.com', 'password123')
  .then((userCredential) => {
    console.log('User created successfully:', userCredential.user);
  })
  .catch((error) => {
    console.log('Error:', error.code, error.message);
  });
```

## 4. Common Error Codes

- **auth/email-already-in-use**: Email sudah terdaftar
- **auth/invalid-email**: Format email tidak valid
- **auth/weak-password**: Password terlalu lemah
- **auth/network-request-failed**: Koneksi bermasalah
- **permission-denied**: Tidak ada izin Firestore

## 5. Langkah Debug yang Sudah Ditambahkan

Saya sudah menambahkan logging detail di:
- `src/components/auth/RegisterForm.tsx` (line 48-79)
- `src/contexts/AuthContext.tsx` (line 44-66)

Console akan menampilkan:
- "Attempting to register user: [email]"
- "Creating Firebase user..."
- "Firebase user created successfully: [uid]"
- "Saving user data to Firestore..."
- "User data saved to Firestore successfully"

Jika ada error, akan muncul:
- Error code dan message yang spesifik
- Pesan error dalam bahasa Indonesia

## 6. Cara Test
1. Buka aplikasi
2. Klik "Daftar"
3. Isi form registrasi
4. Selesaikan reCAPTCHA
5. Klik "Daftar Sekarang"
6. Lihat console browser untuk detail error

## 7. Jika Masih Error
Kirimkan screenshot console error atau copy-paste error message yang muncul di browser console.