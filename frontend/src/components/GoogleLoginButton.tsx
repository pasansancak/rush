import React, { useEffect, useState } from "react";
import { Alert, TouchableOpacity, Text, StyleSheet, View, ActivityIndicator, Image } from "react-native";
import { GoogleSignin, statusCodes, isSuccessResponse } from "@react-native-google-signin/google-signin";
import { loginWithGoogleBackend } from "../api/auth";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { COLORS, FONTS } from "../../constants/theme";

export default function CustomGoogleLoginButton({ onSuccess }) {
  const [isInProgress, setIsInProgress] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
      forceCodeForRefreshToken: true,
    });
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setIsInProgress(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        const { idToken } = response.data;
        const clientType = Platform.OS;
        const backendRes = await loginWithGoogleBackend(idToken, clientType);
        onSuccess(backendRes.access_token);
      } else {
        Alert.alert("Giriş Hatası", "Google kimlik doğrulama başarısız oldu.");
      }
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // Kullanıcı işlemi iptal etti
      } else {
        Alert.alert("Hata", error.message || "Bir hata oluştu.");
      }
    } finally {
      setIsInProgress(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleGoogleSignIn}
      disabled={isInProgress}
    >
      {isInProgress ? (
        <ActivityIndicator color={COLORS.PRIMARY_TEXT} />
      ) : (
        <>
          <Image
            source={require("../assets/google.png")} // PNG ikonunu projene eklemelisin
            style={styles.icon}
          />
          <Text style={styles.text}>Google ile Giriş Yap</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
    justifyContent: "center",
  },
  text: {
    color: "#000",
    fontSize: 14,
    fontFamily: FONTS.DEFAULT,
    marginLeft: 10,
  },
  icon: {
    width: 20,
    height: 20,
  },
});
