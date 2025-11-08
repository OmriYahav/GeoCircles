import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Avatar,
  Button,
  Dialog,
  HelperText,
  Portal,
  Snackbar,
  Text,
  TextInput,
} from "react-native-paper";
import * as ImagePicker from "expo-image-picker";

import useAuth from "../hooks/useAuth";
import { useUserProfile } from "../context/UserProfileContext";
import { colors, radii, shadows, spacing, typography } from "../theme";
import ScreenScaffold from "../components/layout/ScreenScaffold";

type EmailMode = "sign-in" | "create";

export default function ProfileSettingsScreen() {
  const auth = useAuth();
  const { profile, updateProfile, resetProfile, isLoading: isProfileLoading } =
    useUserProfile();

  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [nickname, setNickname] = useState(profile.nickname);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [emailDialogVisible, setEmailDialogVisible] = useState(false);
  const [emailMode, setEmailMode] = useState<EmailMode>("sign-in");
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setNickname(profile.nickname);
    setAvatarUrl(profile.avatarUrl ?? "");
    setPhotoError(null);
  }, [profile]);

  const initials = useMemo(() => {
    const name = `${firstName} ${lastName}`.trim();
    if (nickname) {
      return nickname.slice(0, 2).toUpperCase();
    }
    if (name) {
      return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
    return "EX";
  }, [firstName, lastName, nickname]);

  const displayName = useMemo(() => {
    if (nickname.trim()) {
      return nickname.trim();
    }
    return `${firstName} ${lastName}`.trim() || "Explorer";
  }, [firstName, lastName, nickname]);

  const isAppleLoading = auth.authenticatingProvider === "apple";
  const isGoogleLoading = auth.authenticatingProvider === "google";
  const isEmailLoading = auth.authenticatingProvider === "email";

  const handleSave = async () => {
    setIsSaving(true);
    await updateProfile({
      firstName,
      lastName,
      nickname,
      avatarUrl: avatarUrl || null,
    });
    setIsSaving(false);
  };

  const handleReset = async () => {
    setIsSaving(true);
    await resetProfile();
    setIsSaving(false);
  };

  const handlePickPhoto = useCallback(async () => {
    setPhotoError(null);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setPhotoError(
          "We need access to your photo library to select a profile picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length) {
        const [asset] = result.assets;
        if (asset.uri) {
          setAvatarUrl(asset.uri);
        } else {
          setPhotoError("Unable to use the selected photo. Please try another one.");
        }
      }
    } catch (error) {
      console.warn("Failed to pick profile photo", error);
      setPhotoError(
        "Something went wrong while selecting a photo. Please try again."
      );
    }
  }, []);

  const handleRemovePhoto = useCallback(() => {
    setAvatarUrl("");
    setPhotoError(null);
  }, []);

  const openEmailDialog = useCallback((mode: EmailMode) => {
    setEmailMode(mode);
    setEmailValue("");
    setPasswordValue("");
    setEmailDialogVisible(true);
  }, []);

  const closeEmailDialog = useCallback(() => {
    if (emailSubmitting) {
      return;
    }
    setEmailDialogVisible(false);
    setEmailValue("");
    setPasswordValue("");
  }, [emailSubmitting]);

  const handleGooglePress = useCallback(async () => {
    try {
      const result = await auth.signInWithGoogle();
      if (!result) {
        return;
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "We couldn't complete Google sign-in. Please try again.";
      setToastMessage(message);
    }
  }, [auth]);

  const handleApplePress = useCallback(async () => {
    try {
      const result = await auth.signInWithApple();
      if (!result) {
        return;
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "We couldn't complete Sign in with Apple. Please try again.";
      setToastMessage(message);
    }
  }, [auth]);

  const handleEmailSubmit = useCallback(async () => {
    setEmailSubmitting(true);
    try {
      const trimmedEmail = emailValue.trim();
      if (!trimmedEmail || !passwordValue) {
        throw new Error("Please enter your email and password to continue.");
      }

      if (emailMode === "sign-in") {
        await auth.signInWithEmail(trimmedEmail, passwordValue);
      } else {
        await auth.createAccountWithEmail(trimmedEmail, passwordValue);
      }
      closeEmailDialog();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "We couldn't verify your email. Please try again.";
      setToastMessage(message);
    } finally {
      setEmailSubmitting(false);
    }
  }, [auth, closeEmailDialog, emailMode, emailValue, passwordValue]);

  const handleLogout = useCallback(async () => {
    setIsSigningOut(true);
    try {
      await auth.signOut();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "We couldn't sign you out. Please try again.";
      setToastMessage(message);
    } finally {
      setIsSigningOut(false);
    }
  }, [auth]);

  const renderProfileContent = () => (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
        ) : (
          <Avatar.Text size={86} label={initials} style={styles.avatarFallback} />
        )}
        <View style={styles.headerText}>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.subtitle}>This is how other explorers see you.</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile details</Text>
        <TextInput
          label="First name"
          mode="outlined"
          value={firstName}
          onChangeText={setFirstName}
          style={styles.input}
        />
        <TextInput
          label="Last name"
          mode="outlined"
          value={lastName}
          onChangeText={setLastName}
          style={styles.input}
        />
        <TextInput
          label="Nickname"
          mode="outlined"
          value={nickname}
          onChangeText={setNickname}
          placeholder="The name highlighted in chats"
          style={styles.input}
        />
        <View style={styles.photoActions}>
          <Button
            mode="contained-tonal"
            icon="image-plus"
            onPress={handlePickPhoto}
            style={styles.chooseButton}
          >
            Choose from device
          </Button>
          {avatarUrl ? (
            <Button mode="text" onPress={handleRemovePhoto} style={styles.removeButton}>
              Remove photo
            </Button>
          ) : null}
        </View>
        {photoError ? (
          <HelperText type="error" visible style={styles.photoHelper}>
            {photoError}
          </HelperText>
        ) : null}
        <TextInput
          label="Profile photo link (optional)"
          mode="outlined"
          value={avatarUrl}
          onChangeText={setAvatarUrl}
          placeholder="Paste a link or pick a photo"
          style={styles.input}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={handleSave}
          loading={(isSaving && !isProfileLoading) || isProfileLoading}
          disabled={isSaving || isProfileLoading || isSigningOut}
        >
          Save changes
        </Button>
        <Button
          mode="text"
          onPress={handleReset}
          disabled={isSaving || isProfileLoading || isSigningOut}
        >
          Reset profile
        </Button>
        <Button
          mode="outlined"
          onPress={handleLogout}
          loading={isSigningOut}
          disabled={isSaving || isProfileLoading || isSigningOut}
          style={styles.logoutButton}
        >
          Log out
        </Button>
      </View>
    </ScrollView>
  );

  const renderAuthContent = () => (
    <View style={styles.authContainer}>
      <View style={styles.authHeader}>
        <Text style={styles.authTitle}>Sign in to Sweet Balance</Text>
        <Text style={styles.authSubtitle}>
          Continue with a social account or use your email to keep exploring.
        </Text>
      </View>
      <View style={styles.authButtonGroup}>
        <Button
          mode="contained"
          icon="apple"
          buttonColor={colors.surface}
          textColor="#000"
          style={styles.socialButton}
          contentStyle={styles.socialButtonContent}
          onPress={handleApplePress}
          loading={isAppleLoading}
          disabled={isAppleLoading || isGoogleLoading || emailSubmitting}
        >
          Continue with Apple
        </Button>
        <Button
          mode="contained"
          icon="google"
          buttonColor={colors.surface}
          textColor={colors.text}
          style={styles.socialButton}
          contentStyle={styles.socialButtonContent}
          onPress={handleGooglePress}
          loading={isGoogleLoading}
          disabled={isGoogleLoading || isAppleLoading || emailSubmitting}
        >
          Continue with Google
        </Button>
      </View>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or continue with email</Text>
        <View style={styles.dividerLine} />
      </View>
      <View style={styles.authButtonGroup}>
        <Button
          mode="contained"
          onPress={() => openEmailDialog("sign-in")}
          style={styles.emailButton}
          contentStyle={styles.emailButtonContent}
          disabled={isAppleLoading || isGoogleLoading || emailSubmitting || isEmailLoading}
        >
          Sign in with email
        </Button>
        <Button
          mode="contained-tonal"
          onPress={() => openEmailDialog("create")}
          style={styles.emailButton}
          contentStyle={styles.emailButtonContent}
          disabled={isAppleLoading || isGoogleLoading || emailSubmitting || isEmailLoading}
        >
          Create account
        </Button>
      </View>
    </View>
  );

  let content: React.ReactNode = null;
  if (auth.isLoading) {
    content = (
      <View style={styles.loadingState}>
        <ActivityIndicator animating color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  } else if (!auth.isAuthenticated) {
    content = renderAuthContent();
  } else {
    content = renderProfileContent();
  }

  return (
    <ScreenScaffold contentStyle={styles.screenContent}>
      {content}
      <Portal>
        <Dialog
          visible={emailDialogVisible}
          onDismiss={closeEmailDialog}
          style={styles.emailDialog}
        >
          <Dialog.Title style={styles.dialogTitle}>
            {emailMode === "sign-in" ? "Sign in with email" : "Create your account"}
          </Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <TextInput
              label="Email"
              value={emailValue}
              onChangeText={setEmailValue}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.dialogInput}
            />
            <TextInput
              label="Password"
              value={passwordValue}
              onChangeText={setPasswordValue}
              secureTextEntry
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button onPress={closeEmailDialog} disabled={emailSubmitting}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleEmailSubmit}
              loading={emailSubmitting}
            >
              {emailMode === "sign-in" ? "Continue" : "Create"}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Snackbar
        visible={!!toastMessage}
        onDismiss={() => setToastMessage(null)}
        duration={3500}
        style={styles.snackbar}
      >
        {toastMessage}
      </Snackbar>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    gap: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  avatarImage: {
    width: 86,
    height: 86,
    borderRadius: radii.lg,
    ...shadows.sm,
  },
  avatarFallback: {
    backgroundColor: colors.primarySoft,
    color: colors.primary,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  displayName: {
    fontSize: typography.size.xl,
    fontFamily: typography.family.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.size.sm,
    color: colors.subtitle,
  },
  section: {
    backgroundColor: colors.surface,
    padding: spacing.xxl,
    borderRadius: radii.lg,
    ...shadows.sm,
    gap: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontFamily: typography.family.semiBold,
    color: colors.text,
  },
  input: {
    backgroundColor: colors.surface,
  },
  photoActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  chooseButton: {
    borderRadius: radii.pill,
  },
  removeButton: {
    borderRadius: radii.pill,
  },
  photoHelper: {
    marginTop: -spacing.sm,
  },
  actions: {
    gap: spacing.md,
  },
  logoutButton: {
    borderRadius: radii.pill,
  },
  authContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
    gap: spacing.xxl,
  },
  authHeader: {
    gap: spacing.sm,
  },
  authTitle: {
    fontSize: typography.size.xxl,
    fontFamily: typography.family.bold,
    color: colors.text,
  },
  authSubtitle: {
    fontSize: typography.size.md,
    color: colors.subtitle,
    lineHeight: typography.lineHeight.relaxed,
  },
  authButtonGroup: {
    gap: spacing.md,
  },
  socialButton: {
    borderRadius: radii.pill,
  },
  socialButtonContent: {
    height: 52,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  dividerText: {
    fontSize: typography.size.sm,
    color: colors.subtitle,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  emailButton: {
    borderRadius: radii.pill,
  },
  emailButtonContent: {
    height: 52,
  },
  emailDialog: {
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  dialogTitle: {
    fontSize: typography.size.lg,
    fontFamily: typography.family.semiBold,
    color: colors.text,
  },
  dialogContent: {
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  dialogInput: {
    backgroundColor: colors.surface,
  },
  dialogActions: {
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
  snackbar: {
    marginBottom: spacing.xxl,
    marginHorizontal: spacing.xxl,
    borderRadius: radii.md,
  },
  loadingState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.size.md,
    color: colors.subtitle,
  },
});
