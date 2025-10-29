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
  Text,
  useTheme,
} from "react-native-paper";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";

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
import BackToMapButton from "../components/BackToMapButton";
import { Palette } from "../../constants/theme";

export type BusinessOfferScreenParams = {
  businessId: string;
};

type BusinessOfferRoute = RouteProp<
  { BusinessOffer: BusinessOfferScreenParams },
  "BusinessOffer"
>;

const BusinessOfferScreen = () => {
  const { profile } = useUserProfile();
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<BusinessOfferRoute>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: "Business Offer" });
  }, [navigation]);

  useEffect(() => {
    let isMounted = true;

    const fetchBusiness = async () => {
      const firestore = getFirestoreClient();
      if (!firestore) {
        setError("Business data is unavailable. Check Firebase configuration.");
        setIsLoading(false);
        return;
      }

      try {
        const snapshot = await getDoc(
          doc(firestore, "businesses", route.params.businessId)
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
  }, [route.params.businessId]);

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
      <View style={styles.loaderContainer}>
        <ActivityIndicator animating color={theme.colors.primary} />
        <Text style={styles.loaderText}>Loading offer…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!business) {
    return null;
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <BackToMapButton mode="contained-tonal" style={styles.backButton} />
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  container: {
    flexGrow: 1,
    padding: 24,
    gap: 16,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
    backgroundColor: Palette.background,
  },
  loaderText: {
    textAlign: "center",
    color: Palette.textSecondary,
  },
  errorText: {
    textAlign: "center",
    color: Palette.danger,
  },
  logoWrapper: {
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
    padding: 16,
    borderRadius: 24,
    backgroundColor: Palette.surface,
    shadowColor: "rgba(15, 23, 42, 0.12)",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 4,
  },
  logo: {
    width: 160,
    height: 160,
    resizeMode: "contain",
  },
  title: {
    textAlign: "center",
    fontWeight: "700",
    color: Palette.textPrimary,
  },
  offerText: {
    textAlign: "center",
    color: Palette.textSecondary,
  },
  expiry: {
    textAlign: "center",
    color: Palette.textMuted,
  },
  actionButton: {
    marginTop: 12,
    alignSelf: "center",
    minWidth: "60%",
  },
});

export default BusinessOfferScreen;

