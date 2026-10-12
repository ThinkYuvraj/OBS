import React, { useRef, useState, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  ActivityIndicator,
  BackHandler,
  Platform,
  Alert,
  Text,
  TouchableOpacity,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';

// Production MarketinGlu Web Gateway or Local Development Host
const APP_URL = Platform.select({
  ios: 'https://obs.marketinglu.com',
  android: 'http://10.0.2.2:3000', // Points to localhost when running on Android Emulator
  default: 'https://obs.marketinglu.com',
});

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Hardware Back Button Handler for Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      const onBackPress = () => {
        if (canGoBack && webViewRef.current) {
          webViewRef.current.goBack();
          return true;
        }
        Alert.alert(
          'Exit MarketinGlu OBS',
          'Do you want to exit the broadcast scoring console?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Exit', onPress: () => BackHandler.exitApp() },
          ]
        );
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );
      return () => subscription.remove();
    }
  }, [canGoBack]);

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070b14" />

      {loadError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Connection Offline</Text>
          <Text style={styles.errorSubtitle}>
            Unable to connect to the MarketinGlu broadcast engine server.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setLoadError(null);
              webViewRef.current?.reload();
            }}
          >
            <Text style={styles.retryButtonText}>Retry Connection</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ uri: APP_URL }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          mixedContentMode="always"
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            setLoadError(nativeEvent.description || 'Failed to load app');
          }}
          onNavigationStateChange={handleNavigationStateChange}
          renderLoading={() => (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#06b6d4" />
              <Text style={styles.loaderText}>Initializing MarketinGlu Engine...</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070b14',
  },
  webview: {
    flex: 1,
    backgroundColor: '#070b14',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#070b14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    color: '#06b6d4',
    fontFamily: Platform.select({ android: 'monospace', default: 'Courier' }),
    fontSize: 12,
    marginTop: 12,
    letterSpacing: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    color: '#f43f5e',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  retryButton: {
    backgroundColor: '#06b6d4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#070b14',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
