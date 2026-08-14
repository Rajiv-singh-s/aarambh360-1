import SafeContainer from '../components/SafeContainer';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { PlanDto, UserEntitlementsDto } from '@aarambh360/types';
import {
  cancelSubscription,
  createSubscription,
  getEntitlements,
  listPlans,
} from '../services/subscriptionService';
import { clearAdConfigCache } from '../services/adsService';

export default function SubscriptionScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<PlanDto[]>([]);
  const [entitlements, setEntitlements] = useState<UserEntitlementsDto | null>(null);
  const [busyPlan, setBusyPlan] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const [planList, entitlementData] = await Promise.all([listPlans(), getEntitlements()]);
      setPlans(planList);
      setEntitlements(entitlementData);
    } catch (error) {
      Alert.alert('Subscription error', error instanceof Error ? error.message : 'Unable to load plans');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleUpgrade(planCode: PlanDto['code']) {
    setBusyPlan(planCode);
    try {
      const result = await createSubscription({ planCode });
      clearAdConfigCache();
      Alert.alert(
        'Subscription updated',
        result.message ?? `Plan ${planCode} is now active.`,
      );
      await refresh();
    } catch (error) {
      Alert.alert('Upgrade failed', error instanceof Error ? error.message : 'Try again later');
    } finally {
      setBusyPlan(null);
    }
  }

  async function handleCancel() {
    try {
      await cancelSubscription();
      clearAdConfigCache();
      Alert.alert('Subscription cancelled', 'You are back on the Free plan.');
      await refresh();
    } catch (error) {
      Alert.alert('Cancel failed', error instanceof Error ? error.message : 'Try again later');
    }
  }

  return (
    <LinearGradient colors={['#0b1220', '#111b2e']} style={styles.flex}>
      <SafeContainer style={styles.flex}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Plans</Text>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <ActivityIndicator color="#06b6d4" style={{ marginTop: 40 }} />
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            {entitlements ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Current plan: {entitlements.planName}</Text>
                <Text style={styles.cardSub}>Status: {entitlements.subscriptionStatus}</Text>
                {entitlements.features.map((feature) => (
                  <Text key={feature.code} style={styles.cardSub}>
                    {feature.code}: {feature.unlimited ? 'Unlimited' : `${feature.remaining ?? 0} remaining`}
                  </Text>
                ))}
              </View>
            ) : null}

            {plans.map((plan) => (
              <View key={plan.id} style={styles.card}>
                <Text style={styles.cardTitle}>{plan.name}</Text>
                <Text style={styles.cardSub}>{plan.description}</Text>
                <Text style={styles.price}>
                  {plan.priceInPaise === 0 ? 'Free' : `₹${(plan.priceInPaise / 100).toFixed(0)}/${plan.billingPeriod}`}
                </Text>
                {entitlements?.planCode !== plan.code && plan.code !== 'FREE' ? (
                  <TouchableOpacity
                    style={styles.button}
                    disabled={busyPlan === plan.code}
                    onPress={() => handleUpgrade(plan.code)}
                  >
                    <Text style={styles.buttonText}>
                      {busyPlan === plan.code ? 'Processing…' : `Choose ${plan.name}`}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ))}

            {entitlements && entitlements.planCode !== 'FREE' ? (
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                <Text style={styles.cancelText}>Cancel subscription</Text>
              </TouchableOpacity>
            ) : null}
          </ScrollView>
        )}
      </SafeContainer>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  back: { color: '#06b6d4', fontWeight: '700' },
  title: { color: '#fff', fontSize: 20, fontWeight: '800' },
  content: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: { color: '#fff', fontWeight: '800', fontSize: 18 },
  cardSub: { color: '#94a3b8', marginTop: 6, lineHeight: 20 },
  price: { color: '#06b6d4', fontWeight: '800', marginTop: 10, fontSize: 16 },
  button: {
    marginTop: 14,
    backgroundColor: '#06b6d4',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '800' },
  cancelBtn: { marginTop: 8, alignItems: 'center', padding: 12 },
  cancelText: { color: '#f87171', fontWeight: '700' },
});
