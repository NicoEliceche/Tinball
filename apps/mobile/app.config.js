const GOOGLE_CLIENT_SUFFIX = '.apps.googleusercontent.com';
const MISSING_IOS_URL_SCHEME = 'com.googleusercontent.apps.missing-ios-client-id';

function getGoogleIosUrlScheme() {
  const clientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  if (!clientId) return MISSING_IOS_URL_SCHEME;
  return `com.googleusercontent.apps.${clientId.replace(GOOGLE_CLIENT_SUFFIX, '')}`;
}

module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    [
      '@react-native-google-signin/google-signin',
      { iosUrlScheme: getGoogleIosUrlScheme() },
    ],
    'expo-sharing',
  ],
  experiments: {
    ...(config.experiments ?? {}),
    ...(process.env.EXPO_PUBLIC_BASE_PATH ? { baseUrl: process.env.EXPO_PUBLIC_BASE_PATH } : {}),
  },
});
