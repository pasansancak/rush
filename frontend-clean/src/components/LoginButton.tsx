// components/LoginButton.tsx
import React, { useState } from "react";
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, Alert } from "react-native";
import { loginWithEmailBackend } from "../api/auth"; // API importu
import { COLORS, FONTS, FONT_SIZES } from "../constants/theme";

type Props = {
  email: string;
  password: string;
  onSuccess: (jwt: string) => void;
};

const LoginButton: React.FC<Props> = ({ email, password, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      const response = await loginWithEmailBackend(email, password);
      const jwt = response.jwt ?? response.token ?? response;
      if (jwt) {
        onSuccess(jwt);
      } else {
        Alert.alert("Giriş Başarısız", "Kullanıcı adı veya şifre hatalı.");
      }
    } catch (e: any) {
      Alert.alert("Giriş Hatası", e?.response?.data?.detail || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        (!email || !password) && { opacity: 0.6 }
      ]}
      onPress={handleLogin}
      disabled={loading || !email || !password}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.buttonText}>Giriş Yap</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: COLORS.RUSH_RED,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: "center",
        width: "100%",
        marginTop: 2,
        marginBottom: 5,
      },
      buttonText: {
        color: COLORS.PRIMARY_TEXT,
        fontSize: FONT_SIZES.button,
        fontFamily: FONTS.DEFAULT,
      },
});

export default LoginButton;
