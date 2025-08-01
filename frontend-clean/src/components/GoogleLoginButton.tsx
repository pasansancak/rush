import React, { useEffect } from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Image } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import { useAuthRequest, makeRedirectUri, ResponseType } from "expo-auth-session";
import { COLORS, FONTS } from "../../constants/theme";

export default function CustomGoogleLoginButton({ onSuccess }) {
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
    // redirectUri: makeRedirectUri({ useProxy: true }), // Gerekirse ekle
  });

  useEffect(() => {
    if (response?.type === "success") {
      // Google response içindeki idToken/backend için accessToken vs.
      const { id_token } = response.authentication || {};
      if (id_token) {
        // Backend'e gönder veya AuthContext'e kaydet
        onSuccess(id_token);
      }
    }
  }, [response]);

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => promptAsync()}
      disabled={!request}
    >
      {!request ? (
        <ActivityIndicator color={COLORS.PRIMARY_TEXT} />
      ) : (
        <>
          <Image
            source={require("../assets/google.png")}
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
