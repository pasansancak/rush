import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView
} from "react-native";
import GoogleLoginButton from "../../components/GoogleLoginButton";
import AppleLoginButton from "../../components/AppleLoginButton";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, FONT_SIZES } from "../../../constants/theme";

export default function LoginScreen({ navigation }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.logo}>RUSH</Text>
        <Text style={styles.title}>Giriş Yap</Text>
        <Text style={styles.subtitle}>
          Aramıza katılmak için giriş yapın veya üye olun
        </Text>

        <TextInput
          style={styles.input}
          placeholder="E-posta"
          placeholderTextColor={COLORS.SECONDARY_TEXT}
          keyboardType="email-address"
        />

        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Şifre"
            placeholderTextColor={COLORS.SECONDARY_TEXT}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color={COLORS.SECONDARY_TEXT}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.forgot}>
          <Text style={styles.forgotText}>Şifremi Unuttum</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            // Şimdilik işlevsiz
          }}
        >
          <Text style={styles.buttonText}>Giriş Yap</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 0, alignContent: "center" }}>
          <GoogleLoginButton onSuccess={() => {}} />
          <AppleLoginButton onSuccess={() => {}} />
        </View>

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Hesabın yok mu? </Text>
          <TouchableOpacity>
            <Text style={styles.signupLink}>Kayıt Ol</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.DARK_BG,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  logo: {
    fontSize: FONT_SIZES.logo,
    color: COLORS.RUSH_RED,
    fontFamily: FONTS.LOGO,
    marginBottom: 10,
    letterSpacing: 2,
  },
  title: {
    fontSize: FONT_SIZES.title,
    color: COLORS.PRIMARY_TEXT,
    fontFamily: FONTS.DEFAULT,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: FONT_SIZES.subtitle,
    color: COLORS.SECONDARY_TEXT,
    fontFamily: FONTS.DEFAULT,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: COLORS.INPUT_BG ?? "rgba(38,38,38,0.9)",
    color: COLORS.PRIMARY_TEXT,
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    fontSize: FONT_SIZES.input,
    fontFamily: FONTS.DEFAULT,
  },
  inputRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  eyeIcon: {
    position: "absolute",
    right: 14,
    top: 10,
  },
  forgot: {
    alignSelf: "flex-end",
    marginBottom: 18,
  },
  forgotText: {
    color: COLORS.RUSH_RED,
    fontSize: FONT_SIZES.small,
    fontFamily: FONTS.DEFAULT,
  },
  button: {
    backgroundColor: COLORS.RUSH_RED,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    width: "100%",
    marginTop: 2,
    marginBottom: 10,
  },
  buttonText: {
    color: COLORS.PRIMARY_TEXT,
    fontSize: FONT_SIZES.button,
    fontFamily: FONTS.DEFAULT,
  },
  signupRow: {
    flexDirection: "row",
    marginTop: 20,
  },
  signupText: {
    color: COLORS.SECONDARY_TEXT,
    fontFamily: FONTS.DEFAULT,
  },
  signupLink: {
    color: COLORS.RUSH_RED,
    fontFamily: FONTS.DEFAULT,
    fontWeight: "bold",
  },
});
