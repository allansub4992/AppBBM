# BBM App - Mobile WebView Wrapper

Aplikasi mobile wrapper yang membungkus web app BBM menggunakan Expo dan React Native WebView.

## 📋 Fitur

- ✅ WebView wrapper untuk web app
- ✅ Handling tombol Back Android (navigasi history web)
- ✅ Push Notifications support
- ✅ Akses Kamera
- ✅ Akses GPS/Lokasi
- ✅ Error handling dengan retry
- ✅ Loading state yang elegan
- ✅ JavaScript bridge untuk komunikasi native ↔ web

## 🚀 Cara Menjalankan

### Prerequisites

1. Node.js terinstal
2. Expo CLI (`npm install -g expo-cli`)
3. Expo Go app di HP Android/iOS (untuk development)

### Development

1. **Jalankan web app terlebih dahulu** (di folder parent):
   ```bash
   cd ..
   npm run dev
   ```

2. **Jalankan mobile app**:
   ```bash
   npm start
   # atau
   npx expo start
   ```

3. **Scan QR code** dengan Expo Go app di HP Anda.

### Konfigurasi URL

Edit file `App.js` dan sesuaikan `WEB_URL`:

```javascript
// Untuk Android Emulator:
const WEB_URL = 'http://10.0.2.2:5173';

// Untuk device fisik (ganti dengan IP laptop Anda):
const WEB_URL = 'http://192.168.1.XX:5173';

// Untuk production:
const WEB_URL = 'https://your-app.netlify.app';
```

### Menemukan IP Laptop

**Windows:**
```bash
ipconfig
# Lihat IPv4 Address pada adapter WiFi
```

**macOS/Linux:**
```bash
ifconfig
# atau
ip addr show
```

## 📱 Build APK/AAB

### Development Build

```bash
npx expo run:android
```

### Production Build (EAS)

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Login ke Expo:
   ```bash
   eas login
   ```

3. Build APK:
   ```bash
   eas build -p android --profile preview
   ```

4. Build AAB (untuk Play Store):
   ```bash
   eas build -p android --profile production
   ```

## 🔐 Permissions

Aplikasi ini memerlukan izin berikut:

| Permission | Kegunaan |
|------------|----------|
| CAMERA | Mengambil foto |
| ACCESS_FINE_LOCATION | Lokasi GPS presisi tinggi |
| ACCESS_COARSE_LOCATION | Lokasi perkiraan |
| RECEIVE_BOOT_COMPLETED | Menerima notifikasi saat boot |
| VIBRATE | Getaran untuk notifikasi |
| WAKE_LOCK | Menjaga layar aktif |

## 📁 Struktur Folder

```
mobile/
├── assets/
│   ├── adaptive-icon.png    # Icon adaptif Android
│   ├── icon.png              # Icon utama
│   ├── splash-icon.png       # Splash screen
│   ├── favicon.png           # Favicon web
│   └── notification-icon.png # Icon notifikasi (perlu dibuat)
├── App.js                    # Logic utama (WebView & handlers)
├── app.json                  # Konfigurasi Expo & permissions
├── index.js                  # Entry point
└── package.json              # Dependencies
```

## ⚠️ Troubleshooting

### Web app tidak muncul di emulator

1. Pastikan web app sudah running (`npm run dev` di folder parent)
2. Gunakan `http://10.0.2.2:5173` bukan `localhost:5173`

### Web app tidak muncul di HP fisik

1. Pastikan HP dan laptop di jaringan WiFi yang sama
2. Gunakan IP laptop (`http://192.168.1.XX:5173`)
3. Pastikan firewall tidak memblokir port 5173

### Push notification tidak bekerja di emulator

Push notification hanya bekerja di device fisik. Gunakan HP asli untuk testing.

## 🎨 Kustomisasi

### Mengganti Icon

Ganti file-file di folder `assets/`:
- `icon.png` - 1024x1024 px
- `adaptive-icon.png` - 1024x1024 px (dengan padding)
- `splash-icon.png` - 200x200 px
- `notification-icon.png` - 96x96 px (putih dengan transparansi)

### Mengganti Tema Warna

Edit `app.json` dan `App.js`:
- Ganti `#4A90E2` dengan warna brand Anda

## 📄 Lisensi

Proyek internal - Hak cipta dilindungi.
