import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import {
  NativeAd,
  NativeAdChoicesPlacement,
  NativeAdView,
  NativeAsset,
  NativeAssetType,
  NativeMediaAspectRatio,
  NativeMediaView,
} from 'react-native-google-mobile-ads';
import { useAdsReady } from './AdsContext';
import { AD_REQUEST_OPTIONS, AD_UNITS, ADS_ENABLED } from './adConfig';
import { Colors, FontSize, Radius, Spacing } from '../theme';

export default function NativeAdCard() {
  const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);
  const adsReady = useAdsReady();

  useEffect(() => {
    if (!ADS_ENABLED || !adsReady) {
      return;
    }

    let mounted = true;

    NativeAd.createForAdRequest(AD_UNITS.native, {
      ...AD_REQUEST_OPTIONS,
      aspectRatio: NativeMediaAspectRatio.LANDSCAPE,
      adChoicesPlacement: NativeAdChoicesPlacement.TOP_RIGHT,
      startVideoMuted: true,
    })
      .then(ad => {
        if (mounted) {
          setNativeAd(ad);
        } else {
          ad.destroy();
        }
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, [adsReady]);

  useEffect(() => {
    if (!nativeAd) {
      return;
    }

    return () => nativeAd.destroy();
  }, [nativeAd]);

  if (!ADS_ENABLED || !adsReady || !nativeAd) {
    return null;
  }

  return (
    <NativeAdView nativeAd={nativeAd} style={styles.card}>
      <View style={styles.topRow}>
        {nativeAd.icon ? (
          <NativeAsset assetType={NativeAssetType.ICON}>
            <Image source={{ uri: nativeAd.icon.url }} style={styles.icon} />
          </NativeAsset>
        ) : null}

        <View style={styles.titleWrap}>
          <NativeAsset assetType={NativeAssetType.HEADLINE}>
            <Text style={styles.headline} numberOfLines={2}>
              {nativeAd.headline}
            </Text>
          </NativeAsset>
          <View style={styles.sponsorRow}>
            <Text style={styles.adBadge}>Ad</Text>
            {nativeAd.advertiser ? (
              <NativeAsset assetType={NativeAssetType.ADVERTISER}>
                <Text style={styles.advertiser} numberOfLines={1}>
                  {nativeAd.advertiser}
                </Text>
              </NativeAsset>
            ) : null}
          </View>
        </View>
      </View>

      <NativeMediaView resizeMode="cover" style={styles.media} />

      {nativeAd.body ? (
        <NativeAsset assetType={NativeAssetType.BODY}>
          <Text style={styles.body} numberOfLines={3}>
            {nativeAd.body}
          </Text>
        </NativeAsset>
      ) : null}

      {nativeAd.callToAction ? (
        <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
          <Text style={styles.cta}>{nativeAd.callToAction}</Text>
        </NativeAsset>
      ) : null}
    </NativeAdView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceInset,
  },
  titleWrap: {
    flex: 1,
  },
  headline: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '900',
    lineHeight: 20,
  },
  sponsorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 4,
  },
  adBadge: {
    overflow: 'hidden',
    borderRadius: Radius.xs,
    backgroundColor: Colors.accentBg,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    color: Colors.accentDark,
    fontSize: FontSize.xxs,
    fontWeight: '900',
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  advertiser: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  media: {
    width: '100%',
    aspectRatio: 1.91,
    borderRadius: Radius.sm,
    marginTop: Spacing.md,
    backgroundColor: Colors.surfaceInset,
  },
  body: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    lineHeight: 19,
    marginTop: Spacing.sm,
  },
  cta: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderRadius: Radius.sm,
    backgroundColor: Colors.primary,
    color: Colors.textOnPrimary,
    fontSize: FontSize.sm,
    fontWeight: '900',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
});
