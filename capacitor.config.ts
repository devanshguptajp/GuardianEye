import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.032a9feedb634bd98da852a739ed7c72',
  appName: 'GuardianEye',
  webDir: 'dist',
  server: {
    url: 'https://032a9fee-db63-4bd9-8da8-52a739ed7c72.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  ios: { contentInset: 'always' },
  android: { backgroundColor: '#0b0a14' },
};

export default config;
