import { AdEventType, InterstitialAd } from 'react-native-google-mobile-ads';
import { AD_REQUEST_OPTIONS, AD_UNITS, ADS_ENABLED } from './adConfig';

const MIN_INTERSTITIAL_INTERVAL_MS = 8 * 60 * 1000;

const interstitial = ADS_ENABLED
  ? InterstitialAd.createForAdRequest(AD_UNITS.interstitial, AD_REQUEST_OPTIONS)
  : null;

let listenersReady = false;
let isLoaded = false;
let isLoading = false;
let lastShownAt = 0;
let adsAllowed = false;

export function setInterstitialAdsAllowed(allowed: boolean) {
  adsAllowed = allowed;
}

function ensureListeners() {
  if (!interstitial || listenersReady) {
    return;
  }

  listenersReady = true;

  interstitial.addAdEventListener(AdEventType.LOADED, () => {
    isLoaded = true;
    isLoading = false;
  });

  interstitial.addAdEventListener(AdEventType.ERROR, () => {
    isLoaded = false;
    isLoading = false;
  });

  interstitial.addAdEventListener(AdEventType.CLOSED, () => {
    isLoaded = false;
    preloadInterstitial();
  });
}

export function preloadInterstitial() {
  if (!ADS_ENABLED || !adsAllowed || !interstitial) {
    return;
  }

  ensureListeners();

  if (isLoaded || isLoading) {
    return;
  }

  isLoading = true;
  interstitial.load();
}

export function maybeShowInterstitial() {
  if (!ADS_ENABLED || !adsAllowed || !interstitial) {
    return false;
  }

  ensureListeners();

  const now = Date.now();
  if (!isLoaded || now - lastShownAt < MIN_INTERSTITIAL_INTERVAL_MS) {
    preloadInterstitial();
    return false;
  }

  lastShownAt = now;
  isLoaded = false;
  interstitial.show().catch(() => {
    preloadInterstitial();
  });
  return true;
}
