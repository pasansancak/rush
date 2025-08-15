import React, { useEffect, useRef, useState } from "react";
import { View, Text, FlatList, ScrollView, ActivityIndicator, StyleSheet, Dimensions, TouchableOpacity, Image, SafeAreaView, RefreshControl } from "react-native";
import { COLORS, FONTS } from "../../constants/theme";
import { fetchHomeData } from "../../api/cardFetchHome";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({});
  const heroRef = useRef<FlatList>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchHomeData();
      setData(result);
    } catch (err) {
      console.error("Home fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderHeroItem = ({ item }: any) => (
    <TouchableOpacity activeOpacity={0.9} style={styles.heroCard}>
      <Image
      source={{ uri: item.image }}
      style={styles.heroImage}/>
      <View style={styles.heroOverlay} />
      <View style={styles.heroTextWrap}>
        <Text style={styles.heroTitle}>{item.title}</Text>
        <Text style={styles.heroSubtitle}>{item.subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title, onPressAll }: { title: string; onPressAll?: () => void }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onPressAll && (
        <TouchableOpacity onPress={onPressAll} style={styles.allBtn}>
          <Text style={styles.allBtnText}>TÜMÜ</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const HorizontalEventCard = ({ item }: any) => (
    <TouchableOpacity activeOpacity={0.8} style={styles.hCard}>
      <Image source={{ uri: item.image }} style={styles.hImage} />
      <Text numberOfLines={1} style={styles.hTitle}>
        {item.title}
      </Text>
      <View style={styles.metaRow}>
        <Ionicons name="location" size={12} color={COLORS.SECONDARY_TEXT} />
        <Text numberOfLines={1} style={styles.metaText}>
          {item.venue}
        </Text>
      </View>
      <View style={styles.metaRow}>
        <Ionicons name="calendar" size={12} color={COLORS.SECONDARY_TEXT} />
        <Text numberOfLines={1} style={styles.metaText}>
          {item.date}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const VerticalRow = ({ item }: any) => (
    <TouchableOpacity activeOpacity={0.9} style={styles.vRow}>
      <Image source={{ uri: item.image }} style={styles.vThumb} />
      <View style={styles.vInfo}>
        <Text numberOfLines={1} style={styles.vTitle}>
          {item.title}
        </Text>
        <Text numberOfLines={1} style={styles.vVenue}>
          {item.venue} • {item.date}
        </Text>
      </View>
      <TouchableOpacity style={styles.buyBtn}>
        <Text style={styles.buyText}>Satın Al</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color={COLORS.RUSH_RED} style={{ flex: 1, justifyContent: "center" }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>RUSH</Text>
        <View style={styles.headerRight}>
          <IconButton icon="cart-outline" onPress={() => {}} />
          <IconButton icon="notifications-outline" onPress={() => {}} />
          <IconButton icon="location-outline" onPress={() => {}} />
          <TouchableOpacity style={styles.avatar}>
            <Text style={styles.avatarText}>PS</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl tintColor={COLORS.PRIMARY_TEXT} refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Hero Carousel */}
        <FlatList
          ref={heroRef}
          data={data.hero || []}
          keyExtractor={(i) => i.id.toString()}
          renderItem={renderHeroItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToAlignment="center"
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />

        {/* Sadece Rush’ta */}
        <SectionHeader title="Sadece Rush’ta" onPressAll={() => {}} />
        <FlatList
          data={data.just_on_rush || []}
          keyExtractor={(i) => i.id.toString()}
          renderItem={({ item }) => <HorizontalEventCard item={item} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />

        {/* Rush’tan Seçkiler (Dikey Liste) */}
        <SectionHeader title="Rush’tan Seçkiler" onPressAll={() => {}} />
        <View style={{ paddingHorizontal: 16 }}>
          {(data.picks || []).map((it: any) => (
            <VerticalRow key={it.id} item={it} />
          ))}
        </View>

        {/* Bu Hafta */}
        <SectionHeader title="Bu Hafta" onPressAll={() => {}} />
        <FlatList
          data={data.this_week || []}
          keyExtractor={(i) => i.id.toString()}
          renderItem={({ item }) => <HorizontalEventCard item={item} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function IconButton({ icon, onPress }: { icon: any; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.iconBtn}>
      <Ionicons name={icon} size={20} color={COLORS.PRIMARY_TEXT} />
    </TouchableOpacity>
  );
}

// ...dosyanın üst kısmı aynı (importlar, state, render fonksiyonları vb.)

// -- HERO kartında gradient yerine basit overlay kullanıyoruz (ekstra lib yoksa)
const renderHeroItem = ({ item }: any) => (
  <TouchableOpacity activeOpacity={0.9} style={styles.heroCard}>
    <Image source={{ uri: item.image }} style={styles.heroImage} />
    <View style={styles.heroOverlay} />
    <View style={styles.heroTextWrap}>
      <Text style={styles.heroTitle}>{item.title}</Text>
      <Text style={styles.heroSubtitle}>{item.subtitle}</Text>
    </View>
  </TouchableOpacity>
);

// -- Yatay kartlarda outline ikonlar
const HorizontalEventCard = ({ item }: any) => (
  <TouchableOpacity activeOpacity={0.8} style={styles.hCard}>
    <Image source={{ uri: item.image }} style={styles.hImage} />
    <Text numberOfLines={1} style={styles.hTitle}>{item.title}</Text>
    <View style={styles.metaRow}>
      <Ionicons name="location-outline" size={12} color={COLORS.SECONDARY_TEXT} />
      <Text numberOfLines={1} style={styles.metaText}>{item.venue}</Text>
    </View>
    <View style={styles.metaRow}>
      <Ionicons name="calendar-outline" size={12} color={COLORS.SECONDARY_TEXT} />
      <Text numberOfLines={1} style={styles.metaText}>{item.date}</Text>
    </View>
  </TouchableOpacity>
);

// ...JSX kısmı aynı

// ------------------------------ Styles ------------------------------
const CARD_W = Math.min(260, width * 0.72);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.DARK_BG,
  },

  // Header
  header: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    color: COLORS.RUSH_RED,
    fontFamily: FONTS.LOGO || FONTS.DEFAULT,
    fontSize: 26,
    letterSpacing: 1,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBtn: { padding: 8, borderRadius: 999 },
  avatar: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.PRIMARY_TEXT,
    alignItems: "center", justifyContent: "center", marginLeft: 2,
  },
  avatarText: { color: COLORS.PRIMARY_TEXT, fontFamily: FONTS.DEFAULT, fontSize: 10 },

  // Section header
  sectionHeader: {
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: COLORS.PRIMARY_TEXT,
    fontFamily: FONTS.DEFAULT,
    fontSize: 18,
  },
  allBtn: {
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 999, borderWidth: 1,
    borderColor: COLORS.SECONDARY_TEXT,
  },
  allBtnText: { color: COLORS.PRIMARY_TEXT, fontFamily: FONTS.DEFAULT, fontSize: 12 },

  // Hero
  heroCard: {
    width: width - 32,
    height: Math.min(280, width * 0.65),
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 12,
  },
  heroImage: { width: "100%", height: "100%" },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  heroTextWrap: { position: "absolute", left: 16, bottom: 16, right: 16 },
  heroTitle: { color: COLORS.PRIMARY_TEXT, fontFamily: FONTS.DEFAULT, fontSize: 22, marginBottom: 4 },
  heroSubtitle: { color: COLORS.SECONDARY_TEXT, fontFamily: FONTS.DEFAULT, fontSize: 13 },

  // Horizontal cards (Sadece Rush’ta / Bu Hafta)
  hCard: { width: CARD_W, marginRight: 12 },
  hImage: { width: "100%", height: CARD_W * 0.62, borderRadius: 16, marginBottom: 8 },
  hTitle: { color: COLORS.PRIMARY_TEXT, fontFamily: FONTS.DEFAULT, fontSize: 14, marginBottom: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { color: COLORS.SECONDARY_TEXT, fontFamily: FONTS.DEFAULT, fontSize: 12 },

  // Vertical list (Rush’tan Seçkiler)
  vRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  vThumb: { width: 64, height: 64, borderRadius: 12, backgroundColor: "#222" },
  vInfo: { flex: 1 },
  vTitle: { color: COLORS.PRIMARY_TEXT, fontFamily: FONTS.DEFAULT, fontSize: 14, marginBottom: 2 },
  vVenue: { color: COLORS.SECONDARY_TEXT, fontFamily: FONTS.DEFAULT, fontSize: 12 },
  buyBtn: { backgroundColor: "#2A2A2A", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  buyText: { color: COLORS.PRIMARY_TEXT, fontFamily: FONTS.DEFAULT, fontSize: 12 },

  // (Kullanılmayan eskileri güvenli diye bırakmıyoruz)
});
