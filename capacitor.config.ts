import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.madarekplus.app',
  appName: 'Madarek +',
  webDir: 'dist',
  plugins: {
    AdMob: {
      // These are placeholder IDs for development
      androidAppId: 'ca-app-pub-3940256099942544~3347511713',
      iosAppId: 'ca-app-pub-3940256099942544~1458002511'
    }
  }
};

export default config;
