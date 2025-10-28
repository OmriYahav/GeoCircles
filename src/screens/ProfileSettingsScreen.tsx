import React, { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Button, Text, TextInput } from "react-native-paper";

import { useUserProfile } from "../context/UserProfileContext";
import { Colors } from "../../constants/theme";

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
    <ScrollView contentContainerStyle={styles.container}>
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
  container: {
    padding: 24,
    gap: 24,
    backgroundColor: Colors.light.background,
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
    color: Colors.light.text,
  },
  subtitle: {
    marginTop: 6,
    color: Colors.light.icon,
  },
  avatarImage: {
    width: 86,
    height: 86,
    borderRadius: 43,
  },
  avatarFallback: {
    backgroundColor: "#2563eb",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: Colors.light.text,
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
