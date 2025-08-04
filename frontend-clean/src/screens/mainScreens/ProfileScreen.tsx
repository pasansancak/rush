import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from "react-native";
import { COLORS, FONTS, FONT_SIZES } from "../../constants/theme";
import { useUser } from "../../context/UserContext";
import { useAuth } from "../../context/AuthContext";

export default function ProfileScreen() {
  const { user, refetchUser } = useUser();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Navigation ile login'e yönlendirme yapılabilir
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: "center" }]}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.DARK_BG} />

      {/* Cover */}
      <Image
        source={require("../../assets/cover.jpg")}
        style={styles.cover}
        resizeMode="cover"
      />

      {/* Profil Fotoğrafı */}
      <View style={styles.avatarWrapper}>
        <Image
          source={
            user.profile_image
              ? { uri: user.profile_image }
              : require("../../assets/cover.jpg")
          }
          style={styles.avatar}
        />
      </View>

      {/* Bilgiler */}
      <View style={styles.info}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.meta}>
          Telefon: {user.phone}
        </Text>
        <Text style={styles.meta}>
          Doğum Tarihi: {user.birthday}
        </Text>
        <Text style={styles.meta}>
          {user.gender ? `Cinsiyet: ${user.gender}` : ""}
        </Text>
        <Text style={styles.metaSmall}>
          Üyelik Başlangıcı: {user.created_at.substring(0,10)}
        </Text>
      </View>

      {/* Çıkış */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const AVATAR_SIZE = 100;
const COVER_HEIGHT = 160;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.DARK_BG,
    alignItems: "center",
  },
  loadingText: {
    color: COLORS.PRIMARY_TEXT,
    fontSize: FONT_SIZES.title,
    fontFamily: FONTS.DEFAULT,
  },
  cover: {
    width: "100%",
    height: COVER_HEIGHT,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarWrapper: {
    position: "absolute",
    top: COVER_HEIGHT - AVATAR_SIZE / 2,
    alignSelf: "center",
    zIndex: 2,
    elevation: 2,
    backgroundColor: COLORS.DARK_BG,
    borderRadius: AVATAR_SIZE,
    padding: 4,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: COLORS.RUSH_RED,
  },
  info: {
    marginTop: AVATAR_SIZE / 2 + 24,
    alignItems: "center",
  },
  name: {
    fontFamily: FONTS.DEFAULT,
    fontSize: FONT_SIZES.title,
    color: COLORS.PRIMARY_TEXT,
    fontWeight: "bold",
    marginBottom: 4,
  },
  email: {
    fontFamily: FONTS.DEFAULT,
    fontSize: FONT_SIZES.subtitle,
    color: COLORS.SECONDARY_TEXT,
    marginBottom: 8,
  },
  meta: {
    fontFamily: FONTS.DEFAULT,
    fontSize: FONT_SIZES.small,
    color: COLORS.SECONDARY_TEXT,
    marginBottom: 2,
  },
  metaSmall: {
    fontFamily: FONTS.DEFAULT,
    fontSize: 11,
    color: COLORS.SECONDARY_TEXT,
    marginTop: 2,
    marginBottom: 2,
  },
  logoutBtn: {
    marginTop: 32,
    backgroundColor: COLORS.RUSH_RED,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: FONT_SIZES.button,
    fontFamily: FONTS.DEFAULT,
    fontWeight: "bold",
  },
});
