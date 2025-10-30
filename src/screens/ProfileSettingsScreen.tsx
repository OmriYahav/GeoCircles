import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Button, HelperText, Text, TextInput } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";

import { useUserProfile } from "../context/UserProfileContext";
import { colors, radii, shadows, spacing, typography } from "../theme";
import ScreenScaffold from "../components/layout/ScreenScaffold";

export default function ProfileSettingsScreen() {
  const { profile, updateProfile, resetProfile, isLoading } = useUserProfile();
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [nickname, setNickname] = useState(profile.nickname);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

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

  const handleSave = async () => {
    setIsSaving(true);
    await updateProfile({ firstName, lastName, nickname, avatarUrl: avatarUrl || null });
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
        setPhotoError("We need access to your photo library to select a profile picture.");
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
      setPhotoError("Something went wrong while selecting a photo. Please try again.");
    }
  }, []);

  const handleRemovePhoto = useCallback(() => {
    setAvatarUrl("");
    setPhotoError(null);
  }, []);

  return (
    <ScreenScaffold contentStyle={styles.screenContent}>
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
            loading={isSaving && !isLoading}
            disabled={isSaving || isLoading}
          >
            Save changes
          </Button>
          <Button
            mode="text"
            onPress={handleReset}
            disabled={isSaving || isLoading}
          >
            Reset profile
          </Button>
        </View>
      </ScrollView>
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
    gap: spacing.xl,
  },
  headerText: {
    flex: 1,
  },
  displayName: {
    fontSize: typography.size.xxl,
    fontFamily: typography.family.semiBold,
    color: colors.text.primary,
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.text.secondary,
    fontFamily: typography.family.regular,
  },
  avatarImage: {
    width: 86,
    height: 86,
    borderRadius: 43,
  },
  avatarFallback: {
    backgroundColor: colors.primary,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xxl,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontFamily: typography.family.semiBold,
    marginBottom: spacing.md,
    color: colors.text.primary,
  },
  photoActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  chooseButton: {
    alignSelf: "flex-start",
  },
  input: {
    marginBottom: spacing.lg,
  },
  removeButton: {
    alignSelf: "flex-start",
  },
  photoHelper: {
    marginBottom: spacing.sm,
    paddingHorizontal: 0,
  },
  actions: {
    gap: 12,
  },
});
