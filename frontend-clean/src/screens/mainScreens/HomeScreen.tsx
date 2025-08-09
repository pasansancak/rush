// src/screens/HomeScreen.tsx
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "../../constants/theme";

const { width } = Dimensions.get("window");

// --------- Mock Data (API bağlanınca aynı shape ile besle) ------------
const HERO_BANNERS = [
  {
    id: "hero-1",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200",
    title: "Yamaç Paraşütü Fest",
    subtitle: "Fethiye • Sun, Aug 18 • 19:00",
  },
  {
    id: "hero-2",
    image:
      "https://images.unsplash.com/photo-1505852679233-d9fd70aff56d?q=80&w=1200",
    title: "Kitesurf Camp",
    subtitle: "Alaçatı • Aug 16–18",
  },
];

const JUST_ON_RUSH = [
  {
    id: "e1",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200",
    title: "Kayak Günü",
    venue: "Uludağ",
    date: "24 Aug 2025",
  },
  {
    id: "e2",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200",
    title: "SUP Sunset",
    venue: "Caddebostan",
    date: "09 Aug 2025",
  },
  {
    id: "e3",
    image:
      "https://images.unsplash.com/photo-1517638851339-4aa32003c11a?q=80&w=1200",
    title: "Enduro Deneyimi",
    venue: "Şile",
    date: "11 Aug 2025",
  },
];

const PICKS_LIST = [
  {
    id: "r1",
    image:
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200",
    title: "Canyoning Macerası",
    venue: "Köprülü Kanyon",
    date: "Sat, Aug 09",
    price: "₺1.250",
  },
  {
    id: "r2",
    image:
      "https://images.unsplash.com/photo-1520975922284-7b683db6de33?q=80&w=1200",
    title: "ATV Safari",
    venue: "Belgrad Ormanı",
    date: "Sun, Aug 10",
    price: "₺950",
  },
  {
    id: "r3",
    image:
      "https://images.unsplash.com/photo-1508264165352-258a6f1b6e5e?q=80&w=1200",
    title: "Tırmanış Başlangıç",
    venue: "Boulder Gym",
    date: "Sat, Aug 16",
    price: "₺600",
  },
];

const THIS_WEEK = JUST_ON_RUSH; // örnek amaçlı tekrar kullanıldı
// ---------------------------------------------------------------------

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const heroRef = useRef<FlatList>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: fetch hero + sections
    setTimeout(() => setRefreshing(false), 800);
  };

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

  const SectionHeader = ({
    title,
    onPressAll,
  }: {
    title: string;
    onPressAll?: () => void;
  }) => (
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
        refreshControl={
          <RefreshControl
            tintColor={COLORS.PRIMARY_TEXT}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {/* Hero Carousel */}
        <FlatList
          ref={heroRef}
          data={HERO_BANNERS}
          keyExtractor={(i) => i.id}
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
          data={JUST_ON_RUSH}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => <HorizontalEventCard item={item} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />

        {/* Rush’tan Seçkiler (Dikey Liste) */}
        <SectionHeader title="Rush’tan Seçkiler" onPressAll={() => {}} />
        <View style={{ paddingHorizontal: 16 }}>
          {PICKS_LIST.map((it) => (
            <VerticalRow key={it.id} item={it} />
          ))}
        </View>

        {/* Bu Hafta */}
        <SectionHeader title="Bu Hafta" onPressAll={() => {}} />
        <FlatList
          data={THIS_WEEK}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => <HorizontalEventCard item={item} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function IconButton({
  icon,
  onPress,
}: {
  icon: any;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.iconBtn}>
      <Ionicons name={icon} size={20} color={COLORS.PRIMARY_TEXT} />
    </TouchableOpacity>
  );
}

// ------------------------------ Styles ------------------------------
const CARD_W = Math.min(260, width * 0.7);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.DARK_BG,
  },
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
  iconBtn: {
    padding: 8,
    borderRadius: 999,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY_TEXT,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 2,
  },
  avatarText: {
    color: COLORS.PRIMARY_TEXT,
    fontFamily: FONTS.DEFAULT,
    fontSize: 10,
  },

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
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  heroTextWrap: {
    position: "absolute",
    left: 16,
    bottom: 16,
    right: 16,
  },
  heroTitle: {
    color: COLORS.PRIMARY_TEXT,
    fontFamily: FONTS.DEFAULT,
    fontSize: 22,
    marginBottom: 4,
  },
  heroSubtitle: {
    color: COLORS.SECONDARY_TEXT,
    fontFamily: FONTS.DEFAULT,
    fontSize: 13,
  },

  // Section
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
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.SECONDARY_TEXT,
  },
  allBtnText: {
    color: COLORS.PRIMARY_TEXT,
    fontFamily: FONTS.DEFAULT,
    fontSize: 12,
  },

  // Horizontal Cards
  hCard: {
    width: CARD_W,
    marginRight: 12,
  },
  hImage: {
    width: "100%",
    height: CARD_W * 0.62,
    borderRadius: 12,
    marginBottom: 8,
  },
  hTitle: {
    color: COLORS.PRIMARY_TEXT,
    fontFamily: FONTS.DEFAULT,
    fontSize: 14,
    marginBottom: 4,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: {
    color: COLORS.SECONDARY_TEXT,
    fontFamily: FONTS.DEFAULT,
    fontSize: 12,
  },

  // Vertical Row
  vRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  vThumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: "#222",
  },
  vInfo: { flex: 1 },
  vTitle: {
    color: COLORS.PRIMARY_TEXT,
    fontFamily: FONTS.DEFAULT,
    fontSize: 14,
    marginBottom: 2,
  },
  vVenue: {
    color: COLORS.SECONDARY_TEXT,
    fontFamily: FONTS.DEFAULT,
    fontSize: 12,
  },
  buyBtn: {
    backgroundColor: "#2A2A2A",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  buyText: {
    color: COLORS.PRIMARY_TEXT,
    fontFamily: FONTS.DEFAULT,
    fontSize: 12,
  },
});
