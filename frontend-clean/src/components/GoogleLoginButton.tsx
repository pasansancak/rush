import React, { useEffect, useState } from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Image, Alert, Platform } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import { loginWithGoogleBackend } from "../api/auth"; // Kendi backend fonksiyonun!
import { COLORS, FONTS } from "../../constants/theme";

export default function CustomGoogleLoginButton({ onSuccess }) {
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
  });

  const [isInProgress, setIsInProgress] = useState(false);

  useEffect(() => {
    const handleGoogleResponse = async () => {
      if (response?.type === "success") {
        const id_token = response.authentication?.idToken;
        const client_type = Platform.OS;
        if (id_token) {
          try {
            setIsInProgress(true); // Yükleme başlasın
            // 1. idToken'ı backend'e gönder
            const backendRes = await loginWithGoogleBackend(id_token, client_type); // Burada kendi API'nı kullanıyorsun
            // 2. Backend'den access token geldi
            if (backendRes && backendRes.access_token) {
              onSuccess(backendRes.access_token); // Uygulama için giriş tamam
            } else {
              // 3. Backend'den access_token gelmezse hata göster
              Alert.alert(
                "Giriş Başarısız",
                "Sunucudan geçerli yanıt alınamadı."
              );
            }
          } catch (e) {
            // 4. Backend ile iletişimde hata olursa
            console.log("Backend login error:", e);
            Alert.alert(
              "Sunucu Hatası",
              "Google ile giriş sonrası sunucuya bağlanırken hata oluştu."
            );
          } finally {
            setIsInProgress(false); // Yükleme bitti
          }
        } else {
          console.log("Google response'da id_token yok:", response);
          Alert.alert(
            "Giriş Başarısız",
            "Google ile giriş sırasında bir hata oluştu (id_token alınamadı)."
          );
        }
      } else if (
        response &&
        (response.type === "error" ||
          response.type === "dismiss" ||
          response.type === "cancel")
      ) {
        console.log("Google login response:", response);
        let message = "Google ile giriş sırasında bir hata oluştu.";
        if (response.type === "dismiss" || response.type === "cancel") {
          message = "Google ile giriş işlemi iptal edildi.";
        }
        if (response.error) {
          message += `\n${response.error}`;
        }
        Alert.alert("Giriş Başarısız", message);
      }
    };

    // Asenkron fonksiyon olduğu için ayrı çağırıyoruz
    if (response) {
      handleGoogleResponse();
    }
  }, [response]);

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => promptAsync()}
      disabled={!request || isInProgress}
    >
      {!request || isInProgress ? (
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
