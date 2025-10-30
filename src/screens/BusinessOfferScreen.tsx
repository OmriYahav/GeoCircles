import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { useLocalSearchParams } from "expo-router";

import { Business } from "../context/BusinessContext";
import { formatExpiryDate, parseBusinessDocument } from "../utils/business";
import { getFirestoreClient } from "../services/firebaseApp";
import { doc, getDoc } from "firebase/firestore";
import {
  markBusinessOfferDisplayed,
  markBusinessVisitLogged,
  recordBusinessVisit,
} from "../services/businessTelemetry";
import { useUserProfile } from "../context/UserProfileContext";
import { colors, radii, shadows, spacing, typography } from "../theme";
import ScreenScaffold from "../components/layout/ScreenScaffold";

export type BusinessOfferScreenParams = {
  businessId?: string | string[];
};

const BusinessOfferScreen = () => {
  const { profile } = useUserProfile();
  const theme = useTheme();
  const params = useLocalSearchParams<BusinessOfferScreenParams>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const businessId = Array.isArray(params.businessId)
      ? params.businessId[0]
      : params.businessId;

    if (!businessId) {
      setError("This offer is no longer available.");
      setIsLoading(false);
      return;
    }

    const fetchBusiness = async () => {
      const firestore = getFirestoreClient();
      if (!firestore) {
        setError("Business data is unavailable. Check Firebase configuration.");
        setIsLoading(false);
        return;
      }

      try {
        const snapshot = await getDoc(
          doc(firestore, "businesses", businessId)
        );
        if (!snapshot.exists()) {
          if (isMounted) {
            setError("We couldn’t find this offer anymore.");
          }
          return;
        }
        const parsed = parseBusinessDocument(snapshot.id, snapshot.data());
        if (!parsed) {
          if (isMounted) {
            setError("This offer is missing required location details.");
          }
          return;
        }
        if (isMounted) {
          setBusiness(parsed);
        }
      } catch (fetchError) {
        console.warn("Failed to load business offer", fetchError);
        if (isMounted) {
          setError("Something went wrong while loading this offer.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchBusiness();

    return () => {
      isMounted = false;
    };
  }, [params.businessId]);

  const expiryDisplay = useMemo(
    () => formatExpiryDate(business?.expiryDate ?? null),
    [business?.expiryDate]
  );

  const handleRedeemPress = async () => {
    if (!business) {
      return;
    }

    setIsInteracting(true);
    try {
      await recordBusinessVisit({
        businessId: business.id,
        userId: profile.id,
        distance: 0,
        location: null,
      });
      await markBusinessVisitLogged(business.id);
      await markBusinessOfferDisplayed(business.id);
    } catch (interactionError) {
      console.warn("Failed to log offer interaction", interactionError);
    } finally {
      setIsInteracting(false);
    }
  };

  if (isLoading) {
    return (
      <ScreenScaffold contentStyle={styles.centerContent}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator animating color={theme.colors.primary} />
          <Text style={styles.loaderText}>Loading offer…</Text>
        </View>
      </ScreenScaffold>
    );
  }

  if (error) {
    return (
      <ScreenScaffold contentStyle={styles.centerContent}>
        <View style={styles.loaderContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </ScreenScaffold>
    );
  }

  if (!business) {
    return null;
  }

  return (
    <ScreenScaffold contentStyle={styles.screenContent}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <Surface style={styles.offerCard} elevation={3}>
          {business.logoUrl && (
            <View style={styles.logoWrapper}>
              <Image source={{ uri: business.logoUrl }} style={styles.logo} />
            </View>
          )}
          <Text variant="headlineMedium" style={styles.title}>
            {business.name}
          </Text>
          <Text variant="bodyLarge" style={styles.offerText}>
            {business.offerText}
          </Text>
          {expiryDisplay && (
            <Text variant="bodyMedium" style={styles.expiry}>
              Valid until {expiryDisplay}
            </Text>
          )}
          <Button
            mode="contained"
            style={styles.actionButton}
            onPress={handleRedeemPress}
            loading={isInteracting}
          >
            Show this at checkout
          </Button>
        </Surface>
      </ScrollView>
    </ScreenScaffold>
  );
};

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    gap: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  offerCard: {
    gap: spacing.lg,
    padding: spacing.xxl,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    ...shadows.md,
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  loaderText: {
    textAlign: "center",
    color: colors.text.secondary,
    fontFamily: typography.family.regular,
  },
  errorText: {
    textAlign: "center",
    color: colors.danger,
    fontFamily: typography.family.medium,
  },
  logoWrapper: {
    width: "100%",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  logo: {
    width: 160,
    height: 160,
    resizeMode: "contain",
  },
  title: {
    textAlign: "center",
    fontFamily: typography.family.semiBold,
    color: colors.text.primary,
    fontSize: typography.size.xl,
  },
  offerText: {
    textAlign: "center",
    color: colors.text.secondary,
    fontFamily: typography.family.regular,
    lineHeight: typography.lineHeight.relaxed,
  },
  expiry: {
    textAlign: "center",
    color: colors.text.muted,
  },
  actionButton: {
    marginTop: spacing.md,
    alignSelf: "center",
    minWidth: "60%",
  },
});

export default BusinessOfferScreen;

