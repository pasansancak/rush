import React from "react";
import { Platform } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";

export default function AppleLoginButton({ onSuccess }: { onSuccess?: (jwt: string) => void }) {
  if (Platform.OS !== "ios") return null;

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={8}
      style={{ width: 300,
        height: 40,
        marginVertical: 10,
        borderRadius: 8,
        paddingVertical: 15,
        alignItems: "center",
        marginTop: 2,
        marginBottom: 10,
      }}
      onPress={async () => {
        try {
          // Burada kimlik doğrulama mantığı olacak
          if (onSuccess) onSuccess("dummy-apple-jwt");
        } catch (e) {}
      }}
    />
  );
}
