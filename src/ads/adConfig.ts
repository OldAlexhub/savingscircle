import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';
import type { RequestOptions } from 'react-native-google-mobile-ads';

const PRODUCTION_AD_UNITS = {
  banner: 'ca-app-pub-7831002909037560/3426730375',
  interstitial: 'ca-app-pub-7831002909037560/2113648703',
  native: 'ca-app-pub-7831002909037560/9965430019',
} as const;

export const ADS_ENABLED = Platform.OS === 'android';

export const AD_UNITS = {
  banner: __DEV__ ? TestIds.BANNER : PRODUCTION_AD_UNITS.banner,
  interstitial: __DEV__ ? TestIds.INTERSTITIAL : PRODUCTION_AD_UNITS.interstitial,
  native: __DEV__ ? TestIds.NATIVE : PRODUCTION_AD_UNITS.native,
} as const;

export const AD_REQUEST_OPTIONS: RequestOptions = {
  keywords: ['finance', 'budgeting', 'savings', 'planning'],
};
