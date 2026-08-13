import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { AdConfigDto } from '@aarambh360/types';
import { getAdConfig } from '../services/adsService';
import { getEntitlements } from '../services/subscriptionService';

type Props = {
  placementId?: string;
};

export default function AdBanner({ placementId = 'home_banner' }: Props) {
  const [config, setConfig] = useState<AdConfigDto | null>(null);
  const [removeAds, setRemoveAds] = useState(false);

  useEffect(() => {
    getAdConfig()
      .then(setConfig)
      .catch(() => setConfig(null));

    getEntitlements()
      .then((data) => setRemoveAds(!!data.removeAds))
      .catch(() => setRemoveAds(false));
  }, []);

  if (removeAds) {
    return null;
  }

  if (!config?.adsEnabled) {
    return null;
  }

  const placement = config.placements.find((item) => item.id === placementId);
  if (!placement?.enabled) {
    return null;
  }

  return (
    <View style={styles.container} accessibilityLabel="Advertisement">
      <Text style={styles.label}>Sponsored</Text>
      <Text style={styles.text}>
        {config.testMode ? 'AdMob test placement' : 'Upgrade to Premium for an ad-free experience'}
      </Text>
      {config.bannerUnitId ? (
        <Text style={styles.meta} numberOfLines={1}>
          {config.bannerUnitId}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.35)',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: 12,
  },
  label: {
    color: '#06b6d4',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  text: {
    color: '#cbd5e1',
    fontSize: 13,
  },
  meta: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 6,
  },
});
