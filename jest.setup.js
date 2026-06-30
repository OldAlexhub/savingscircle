/* global jest */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-screens', () => ({
  ...jest.requireActual('react-native-screens'),
  enableScreens: jest.fn(),
}));

jest.mock('react-native-google-mobile-ads', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    __esModule: true,
    default: () => ({
      initialize: jest.fn(() => Promise.resolve([])),
    }),
    AdsConsent: {
      gatherConsent: jest.fn(() => Promise.resolve({ canRequestAds: true })),
      getConsentInfo: jest.fn(() => Promise.resolve({ canRequestAds: true })),
    },
    AdEventType: {
      LOADED: 'loaded',
      ERROR: 'error',
      CLOSED: 'closed',
    },
    BannerAd: () => React.createElement(View, null),
    BannerAdSize: {
      ANCHORED_ADAPTIVE_BANNER: 'ANCHORED_ADAPTIVE_BANNER',
    },
    InterstitialAd: {
      createForAdRequest: jest.fn(() => ({
        addAdEventListener: jest.fn(),
        load: jest.fn(),
        show: jest.fn(() => Promise.resolve()),
      })),
    },
    NativeAd: {
      createForAdRequest: jest.fn(() => Promise.resolve(null)),
    },
    NativeAdChoicesPlacement: {
      TOP_RIGHT: 1,
    },
    NativeAdView: ({ children }) => React.createElement(View, null, children),
    NativeAsset: ({ children }) => children,
    NativeAssetType: {
      ADVERTISER: 'advertiser',
      BODY: 'body',
      CALL_TO_ACTION: 'callToAction',
      HEADLINE: 'headline',
      ICON: 'icon',
    },
    NativeMediaAspectRatio: {
      LANDSCAPE: 2,
    },
    NativeMediaView: () => React.createElement(View, null),
    TestIds: {
      BANNER: 'test-banner',
      INTERSTITIAL: 'test-interstitial',
      NATIVE: 'test-native',
    },
  };
});
