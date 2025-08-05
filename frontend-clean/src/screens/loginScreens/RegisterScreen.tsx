import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, FONT_SIZES } from "../../constants/theme";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker"; // veya expo'dan DatePicker
import { ActivityIndicator } from "react-native";
import { registerWithEmailBackend } from "../../api/auth"; // az sonra aşağıda örneği var

const GENDERS = [
  { label: "Kadın", value: "female" },
  { label: "Erkek", value: "male" },
  { label: "Diğer", value: "other" },
];

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    gender: "",
    birthday: null,
    profile_image: null, // uri
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Profil fotoğrafı seçme
  const handleSelectImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setForm((prev) => ({ ...prev, profile_image: result.assets[0].uri }));
    }
  };

  // Doğum günü seçme
  const handleBirthdayChange = (_event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setForm((prev) => ({ ...prev, birthday: selectedDate }));
    }
  };

  // Alan validasyonları
  const isEmailValid = (email:String) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPhoneValid = (phone) => !phone || (phone.length === 10 && /^[0-9]+$/.test(phone));
  const isPasswordValid = (pw) => pw.length >= 6;
  const isBirthdayValid = (birthday) => birthday !== null;

  // Provider her zaman "normal"
  const provider = "normal";

  const handleRegister = async () => {
    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !isBirthdayValid(form.birthday)
    ) {
      Alert.alert("Eksik bilgi", "İsim, e-posta, şifre ve doğum tarihi zorunlu.");
      return;
    }
    if (!isEmailValid(form.email)) {
      Alert.alert("Geçersiz e-posta", "Lütfen geçerli bir e-posta girin.");
      return;
    }
    if (!isPasswordValid(form.password)) {
      Alert.alert("Şifre çok kısa", "Şifre en az 6 karakter olmalı.");
      return;
    }
    if (!isPhoneValid(form.phone)) {
      Alert.alert("Geçersiz telefon", "Telefon 10 haneli olmalı (5xx xxx xx xx) veya boş bırakılabilir.");
      return;
    }

    const userData = {
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      password: form.password,
      gender: form.gender || null,
      birthday: form.birthday ? form.birthday.toISOString().slice(0, 10) : null,
      provider,
      profile_image: form.profile_image, // URL ise direk, uri ise backend'de base64 çevirmen gerekebilir
    };

    try {
      setLoading(true);
      const result = await registerWithEmailBackend(userData);
      setLoading(false);
      Alert.alert("Kayıt Başarılı", "Hoş geldin!");
      navigation.goBack();
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Kayıt Başarısız", error.message || "Bir hata oluştu.");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.formBox}>
          <Text style={styles.logo}>RUSH</Text>
          <Text style={styles.header}>Kayıt Ol</Text>

          {/* Profil resmi seçimi */}
          <TouchableOpacity style={styles.imagePicker} onPress={handleSelectImage}>
            {form.profile_image ? (
              <Image
                source={{ uri: form.profile_image }}
                style={styles.profileImage}
              />
            ) : (
              <Ionicons name="person-circle-outline" size={80} color={COLORS.SECONDARY_TEXT} />
            )}
            <Text style={styles.imagePickerText}>Profil Fotoğrafı Seç (Opsiyonel)</Text>
          </TouchableOpacity>

          {/* İsim */}
          <TextInput
            placeholder="İsim Soyisim"
            style={styles.input}
            value={form.name}
            onChangeText={(t) => setForm((p) => ({ ...p, name: t }))}
            placeholderTextColor={COLORS.SECONDARY_TEXT}
            autoCapitalize="words"
          />
          {/* E-posta */}
          <TextInput
            placeholder="E-posta"
            style={styles.input}
            keyboardType="email-address"
            value={form.email}
            onChangeText={(t) => setForm((p) => ({ ...p, email: t }))}
            autoCapitalize="none"
            placeholderTextColor={COLORS.SECONDARY_TEXT}
          />
          {/* Telefon */}
          <TextInput
            placeholder="Telefon numarası (Opsiyonel)"
            style={styles.input}
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(t) => setForm((p) => ({ ...p, phone: t.replace(/[^0-9]/g, "") }))}
            maxLength={10}
            placeholderTextColor={COLORS.SECONDARY_TEXT}
          />
          {/* Şifre */}
          <View style={styles.inputRow}>
            <TextInput
              placeholder="Şifre"
              style={[styles.input, { flex: 1 }]}
              secureTextEntry={!showPassword}
              value={form.password}
              onChangeText={(t) => setForm((p) => ({ ...p, password: t }))}
              placeholderTextColor={COLORS.SECONDARY_TEXT}
              autoCapitalize="none"
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
          {/* Cinsiyet */}
          <View style={styles.genderRow}>
            {GENDERS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.genderButton,
                  form.gender === option.value && styles.genderButtonSelected,
                ]}
                onPress={() => setForm((p) => ({ ...p, gender: option.value }))}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    form.gender === option.value && styles.genderButtonTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Doğum tarihi */}
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.85}
          >
            <Text style={{ color: form.birthday ? COLORS.PRIMARY_TEXT : COLORS.SECONDARY_TEXT }}>
              {form.birthday
                ? form.birthday.toLocaleDateString("tr-TR")
                : "Doğum Tarihi Seçiniz"}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={form.birthday || new Date(2000, 0, 1)}
              mode="date"
              display="default"
              onChange={handleBirthdayChange}
              maximumDate={new Date()} // Bugünden büyük seçilmesin
            />
          )}

          {/* Kayıt Ol butonu */}
          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Kayıt Ol</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.DARK_BG },
    handleBarContainer: {
      alignItems: "center",
      marginTop: 6,
      minHeight: 32,
      justifyContent: "center",
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 24,
    },
    formBox: {
      width: "94%",
      maxWidth: 400,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      backgroundColor: "transparent",
      borderRadius: 16,
      paddingVertical: 8,
    },
    logo: {
      fontSize: FONT_SIZES.logo,
      color: COLORS.RUSH_RED,
      fontFamily: FONTS.LOGO,
      marginBottom: 8,
      letterSpacing: 2,
      textAlign: "center",
    },
    header: {
      fontSize: FONT_SIZES.title,
      color: COLORS.PRIMARY_TEXT,
      fontFamily: FONTS.DEFAULT,
      marginBottom: 18,
      letterSpacing: 1,
      textAlign: "center",
    },
    row: {
      flexDirection: "row",
      width: "100%",
      marginBottom: 12,
      alignItems: "center",
      justifyContent: "space-between",
    },
    input: {
      width: "100%",
      backgroundColor: COLORS.INPUT_BG ?? "rgba(38,38,38,0.92)",
      color: COLORS.PRIMARY_TEXT,
      borderRadius: 8,
      padding: 12,
      fontSize: FONT_SIZES.input,
      fontFamily: FONTS.DEFAULT,
      marginBottom: 12,
    },
    inputHalf: {
      width: "48%",
      marginBottom: 0,
    },
    inputRow: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    eyeIcon: {
      position: "absolute",
      right: 18,
      top: 10,
      zIndex: 1,
    },
    countryCodeBox: {
      minWidth: 54,
      backgroundColor: COLORS.INPUT_BG ?? "rgba(38,38,38,0.92)",
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 8,
      height: 48,
      paddingHorizontal: 8,
    },
    countryCodeText: {
      color: COLORS.PRIMARY_TEXT,
      fontSize: FONT_SIZES.input,
      fontFamily: FONTS.DEFAULT,
    },
    phoneInput: {
      flex: 1,
      marginLeft: 0,
      marginBottom: 0,
    },
    genderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginBottom: 18,
      marginTop: 2,
    },
    genderButton: {
      flex: 1,
      backgroundColor: COLORS.INPUT_BG ?? "rgba(38,38,38,0.92)",
      borderRadius: 20,
      marginHorizontal: 4,
      paddingVertical: 12,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "transparent",
    },
    genderButtonSelected: {
      backgroundColor: COLORS.RUSH_RED,
      borderColor: COLORS.RUSH_RED,
    },
    genderButtonText: {
      color: COLORS.SECONDARY_TEXT,
      fontFamily: FONTS.DEFAULT,
      fontSize: FONT_SIZES.input,
    },
    genderButtonTextSelected: {
      color: COLORS.PRIMARY_TEXT,
      fontWeight: "bold",
    },
    button: {
      backgroundColor: COLORS.RUSH_RED,
      borderRadius: 8,
      paddingVertical: 16,
      alignItems: "center",
      width: "100%",
      marginTop: 16,
    },
    buttonText: {
      color: COLORS.PRIMARY_TEXT,
      fontSize: FONT_SIZES.button,
      fontFamily: FONTS.DEFAULT,
      fontWeight: "bold",
    },
    imagePicker: {
        alignItems: "center",
        marginBottom: 14,
      },
      imagePickerText: {
        color: COLORS.SECONDARY_TEXT,
        fontSize: FONT_SIZES.small,
        fontFamily: FONTS.DEFAULT,
        marginTop: 6,
      },
      profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 1,
        borderColor: COLORS.RUSH_RED,
      },
  });
  