import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  BackHandler,
  Platform,
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
  Alert
} from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';

// Flag untuk mengecek apakah ini Expo Go atau Development Build
const isExpoGo = Constants.appOwnership === 'expo';

// Import notifikasi secara kondisional
let Notifications = null;
let Device = null;

// Hanya import jika bukan Expo Go
if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
    Device = require('expo-device');

    // Konfigurasi handler notifikasi
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (e) {
    console.log('Push notifications tidak tersedia:', e.message);
  }
}

export default function App() {
  // =====================================================
  // KONFIGURASI URL WEB APP
  // =====================================================
  // Untuk development (localhost):
  // - Android Emulator: gunakan 'http://10.0.2.2:PORT'
  // - Device fisik via USB: gunakan IP laptop (contoh: 'http://192.168.1.XX:PORT')
  // - Device fisik via WiFi: gunakan IP laptop di jaringan yang sama
  // 
  // Untuk production: ganti dengan URL hosting Anda
  // =====================================================

  // const WEB_URL = 'http://10.0.2.2:5173'; // Untuk Android Emulator
  const WEB_URL = 'http://192.168.0.213:5173'; // Untuk device fisik (IP laptop Anda)
  // const WEB_URL = 'https://your-app.netlify.app'; // Untuk production

  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // =====================================================
  // LOGIKA: Menangani Tombol Back Hardware Android
  // =====================================================
  useEffect(() => {
    const onBackPress = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack(); // Mundur di history web
        return true; // Mencegah aplikasi keluar
      }
      return false; // Biarkan aplikasi keluar jika tidak ada history
    };

    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
    }

    return () => {
      if (Platform.OS === 'android') {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      }
    };
  }, [canGoBack]);

  // =====================================================
  // LOGIKA: Setup Push Notifications (Hanya untuk Development Build)
  // =====================================================
  useEffect(() => {
    // Skip push notification setup di Expo Go
    if (isExpoGo || !Notifications || !Device) {
      console.log('⚠️ Push Notifications dinonaktifkan di Expo Go');
      console.log('ℹ️ Untuk mengaktifkan, gunakan Development Build');
      return;
    }

    registerForPushNotificationsAsync();

    // Listener untuk notifikasi yang diterima saat app aktif
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listener untuk respon user terhadap notifikasi
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  // Fungsi untuk register push notification
  async function registerForPushNotificationsAsync() {
    try {
      if (!Device || !Device.isDevice) {
        console.log('Push notifications tidak bekerja di emulator');
        return;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Gagal mendapatkan izin push notification');
        return;
      }

      // Dapatkan Expo push token (untuk development)
      const token = await Notifications.getExpoPushTokenAsync();
      console.log('Expo Push Token:', token.data);

      // Untuk Android, set notification channel
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4A90E2',
        });
      }
    } catch (error) {
      console.log('Error setting up push notifications:', error.message);
    }
  }

  // =====================================================
  // LOGIKA: Injeksi JavaScript untuk komunikasi WebView <-> Native
  // =====================================================
  const injectedJavaScript = `
    (function() {
      // Expose native functions ke window object
      window.isNativeApp = true;
      
      // Override console.log untuk debugging
      const originalConsoleLog = console.log;
      console.log = function(...args) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'console',
          data: args
        }));
        originalConsoleLog.apply(console, args);
      };

      // Fungsi untuk request permission dari web
      window.requestCameraPermission = function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'permission',
          permission: 'camera'
        }));
      };

      window.requestLocationPermission = function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'permission',
          permission: 'location'
        }));
      };
    })();
    true;
  `;

  // Handler untuk pesan dari WebView
  const handleWebViewMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('Message from WebView:', message);

      if (message.type === 'permission') {
        // Handle permission requests dari web app
        if (message.permission === 'camera') {
          // Request camera permission
          console.log('Camera permission requested');
        } else if (message.permission === 'location') {
          // Request location permission
          console.log('Location permission requested');
        }
      }
    } catch (error) {
      console.log('WebView message:', event.nativeEvent.data);
    }
  };

  // =====================================================
  // RENDER: Error State
  // =====================================================
  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorTitle}>Koneksi Gagal</Text>
      <Text style={styles.errorMessage}>
        {errorMessage || 'Tidak dapat terhubung ke server. Pastikan server web berjalan.'}
      </Text>
      <Text style={styles.errorHint}>
        {`URL: ${WEB_URL}`}
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => {
          setHasError(false);
          setIsLoading(true);
          webViewRef.current?.reload();
        }}
      >
        <Text style={styles.retryButtonText}>Coba Lagi</Text>
      </TouchableOpacity>
    </View>
  );

  // =====================================================
  // RENDER: Loading State
  // =====================================================
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#4A90E2" />
      <Text style={styles.loadingText}>Memuat aplikasi...</Text>
    </View>
  );

  // =====================================================
  // RENDER: Main App
  // =====================================================
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      {hasError ? (
        renderError()
      ) : (
        <WebView
          ref={webViewRef}
          source={{ uri: WEB_URL }}
          style={styles.webview}

          // Mengaktifkan JavaScript (Wajib untuk Web App modern)
          javaScriptEnabled={true}
          domStorageEnabled={true}

          // Izinkan akses ke kamera dan lokasi dari WebView
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback={true}
          geolocationEnabled={true}

          // Injeksi JavaScript saat halaman dimuat
          injectedJavaScript={injectedJavaScript}
          onMessage={handleWebViewMessage}

          // Update state navigasi setiap kali halaman berubah
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
          }}

          // Handling loading state
          onLoadStart={() => {
            setIsLoading(true);
            setHasError(false);
          }}
          onLoadEnd={() => {
            setIsLoading(false);
          }}

          // Handling error
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error:', nativeEvent);
            setHasError(true);
            setErrorMessage(nativeEvent.description || 'Terjadi kesalahan saat memuat halaman');
          }}

          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView HTTP error:', nativeEvent);
          }}

          // Tampilan Loading saat Web belum siap
          startInLoadingState={true}
          renderLoading={renderLoading}

          // User Agent untuk identifikasi
          userAgent="BBMApp/1.0 (Android; WebView)"

          // Optimasi performa
          cacheEnabled={true}
          cacheMode="LOAD_DEFAULT"
        />
      )}

      {/* Loading overlay */}
      {isLoading && !hasError && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // Padding top untuk menghindari notch pada HP modern
    paddingTop: Platform.OS === "android" ? 30 : 0
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f8f9fa'
  },
  errorIcon: {
    fontSize: 60,
    marginBottom: 20
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10
  },
  errorHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
  },
  retryButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  }
});
