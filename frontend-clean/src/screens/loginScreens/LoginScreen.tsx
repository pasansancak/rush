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
import LoginButton from "../../components/LoginButton";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, FONT_SIZES } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigation = useNavigation();
  const route = useRoute();

  const { login } = useAuth();

  const handleLoginSuccess = async (jwt: string) => {
    await login(jwt);
    const redirectTo = (route.params as { redirectTo?: string })?.redirectTo;
    if (redirectTo) {
      (navigation as any).replace("MainTab", { screen: redirectTo });
    } else {
      (navigation as any).replace("MainTab");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.handleBarContainer}>
                <Ionicons name="chevron-down" size={32} color={COLORS.SECONDARY_TEXT} />
              </View>
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
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Şifre"
            placeholderTextColor={COLORS.SECONDARY_TEXT}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
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

        <LoginButton
          email={email}
          password={password}
          onSuccess={handleLoginSuccess}
        />

        <Text style={{ color: COLORS.SECONDARY_TEXT, marginBottom: 10, marginTop: 10 }}>
          veya 
        </Text>

        <View style={{ marginTop: 0, alignContent: "center" }}>
          <GoogleLoginButton onSuccess={handleLoginSuccess} />
          <AppleLoginButton onSuccess={handleLoginSuccess} />
        </View>

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Hesabın yok mu? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
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
  handleBarContainer: {
    alignItems: "center",
    marginTop: 6,
    minHeight: 32,
    justifyContent: "center",
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
