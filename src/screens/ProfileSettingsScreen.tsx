import React, { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Button, Text, TextInput } from "react-native-paper";

import { useUserProfile } from "../context/UserProfileContext";
import BackToMapButton from "../components/BackToMapButton";
import { Palette } from "../../constants/theme";

export default function ProfileSettingsScreen() {
  const { profile, updateProfile, resetProfile, isLoading } = useUserProfile();
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [nickname, setNickname] = useState(profile.nickname);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setNickname(profile.nickname);
    setAvatarUrl(profile.avatarUrl ?? "");
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

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <BackToMapButton mode="contained-tonal" style={styles.backButton} />
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
        <TextInput
          label="Profile photo URL"
          mode="outlined"
          value={avatarUrl}
          onChangeText={setAvatarUrl}
          placeholder="Paste a link to your photo"
          style={styles.input}
          autoCapitalize="none"
        />
        <Button
          mode="outlined"
          onPress={() => setAvatarUrl("")}
          style={styles.removeButton}
        >
          Remove photo
        </Button>
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
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  container: {
    padding: 24,
    gap: 24,
    paddingBottom: 48,
  },
  backButton: {
    alignSelf: "flex-start",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  headerText: {
    flex: 1,
  },
  displayName: {
    fontSize: 24,
    fontWeight: "700",
    color: Palette.textPrimary,
  },
  subtitle: {
    marginTop: 6,
    color: Palette.textMuted,
  },
  avatarImage: {
    width: 86,
    height: 86,
    borderRadius: 43,
  },
  avatarFallback: {
    backgroundColor: Palette.primary,
  },
  section: {
    backgroundColor: Palette.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: "rgba(15, 23, 42, 0.12)",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: Palette.textPrimary,
  },
  input: {
    marginBottom: 14,
  },
  removeButton: {
    alignSelf: "flex-start",
  },
  actions: {
    gap: 12,
  },
});
