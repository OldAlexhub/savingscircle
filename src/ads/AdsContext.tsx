import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import mobileAds, { AdsConsent } from 'react-native-google-mobile-ads';
import { ADS_ENABLED } from './adConfig';
import { preloadInterstitial, setInterstitialAdsAllowed } from './interstitial';

type AdsContextValue = {
  adsReady: boolean;
};

const AdsContext = createContext<AdsContextValue>({ adsReady: false });

export function AdsProvider({ children }: { children: React.ReactNode }) {
  const [adsReady, setAdsReady] = useState(false);
  const startCalled = useRef(false);

  useEffect(() => {
    if (!ADS_ENABLED) {
      return;
    }

    async function startMobileAds() {
      if (startCalled.current) {
        return;
      }

      let canRequestAds = true;
      try {
        const consentInfo = await AdsConsent.getConsentInfo();
        canRequestAds = consentInfo.canRequestAds;
      } catch {
        canRequestAds = true;
      }

      if (!canRequestAds) {
        return;
      }

      startCalled.current = true;
      await mobileAds().initialize();
      setInterstitialAdsAllowed(true);
      preloadInterstitial();
      setAdsReady(true);
    }

    AdsConsent.gatherConsent()
      .then(startMobileAds)
      .catch(startMobileAds);

    startMobileAds();
  }, []);

  const value = useMemo(() => ({ adsReady }), [adsReady]);

  return <AdsContext.Provider value={value}>{children}</AdsContext.Provider>;
}

export function useAdsReady() {
  return useContext(AdsContext).adsReady;
}
