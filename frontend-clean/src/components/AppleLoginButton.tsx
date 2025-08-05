import React from "react";
import { Platform, Alert } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { loginWithAppleBackend } from "../api/auth";
import { Platform as RNPlatform } from "react-native";

export default function AppleLoginButton({ onSuccess }: { onSuccess?: (jwt: string) => void }) {
  if (Platform.OS !== "ios") return null;

  const handleAppleSignIn = async () => {
    try {
      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const identityToken = appleCredential.identityToken;

      if (!identityToken) {
        Alert.alert("Giriş başarısız", "Apple kimlik doğrulama hatası.");
        return;
      }

      const data = await loginWithAppleBackend(identityToken, RNPlatform.OS);

      if (data.jwt) {
        if (onSuccess) onSuccess(data.jwt);
      } else {
        Alert.alert("Giriş başarısız", data.message || "Bilinmeyen hata.");
      }
    } catch (e: any) {
      if (e.code === "ERR_CANCELED") return;
      Alert.alert("Apple ile girişte hata", e.message || String(e));
    }
  };

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={8}
      style={{
        width: 300,
        height: 40,
        marginVertical: 10,
        borderRadius: 8,
        paddingVertical: 15,
        alignItems: "center",
        marginTop: 2,
        marginBottom: 10,
      }}
      onPress={handleAppleSignIn}
    />
  );
}
