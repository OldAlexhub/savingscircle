import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { useAdsReady } from './AdsContext';
import { AD_REQUEST_OPTIONS, AD_UNITS, ADS_ENABLED } from './adConfig';
import { Colors, Spacing } from '../theme';

export default function AppBannerAd() {
  const adsReady = useAdsReady();

  if (!ADS_ENABLED || !adsReady) {
    return null;
  }

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <BannerAd
        unitId={AD_UNITS.banner}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={AD_REQUEST_OPTIONS}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs,
  },
});
