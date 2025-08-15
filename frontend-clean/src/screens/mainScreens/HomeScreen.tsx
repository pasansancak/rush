import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, FlatList, ScrollView, ActivityIndicator, StyleSheet, Dimensions, TouchableOpacity, Image, SafeAreaView, RefreshControl } from "react-native";
import { COLORS, FONTS } from "../../constants/theme";
import { fetchHomeData } from "../../api/cardFetchHome";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../../context/UserContext";

const { width } = Dimensions.get("window");
const ITEM_W = width - 32;
const GUTTER = 12;
const SNAP = ITEM_W + GUTTER;

type HeroItem = { id: number; slug?: string; image: string; title?: string; city?: string; venue?: string; start_at?: string; date?: string; subtitle?: string };
type ListItem = { id: number; image: string; title: string; venue?: string; date?: string };
type HomeResponse = {
  hero_events?: HeroItem[];
  hero?: HeroItem[];
  just_on_rush?: ListItem[];
  picks?: ListItem[];
  this_week?: ListItem[];
};

const IconButton = React.memo(function IconButton({ icon, onPress }: { icon: any; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.iconBtn} accessibilityRole="button">
      <Ionicons name={icon} size={20} color={COLORS.PRIMARY_TEXT} />
    </TouchableOpacity>
  );
});

const SectionHeader = React.memo(function SectionHeader({ title, onPressAll }: { title: string; onPressAll?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onPressAll && (
        <TouchableOpacity onPress={onPressAll} style={styles.allBtn} accessibilityRole="button">
          <Text style={styles.allBtnText}>TÜMÜ</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const HorizontalEventCard = React.memo(function HorizontalEventCard({ item, onPress }: { item: ListItem; onPress?: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.hCard} onPress={onPress}>
      <Image source={{ uri: item.image }} style={styles.hImage} />
      <Text numberOfLines={1} style={styles.hTitle}>{item.title}</Text>
      <View style={styles.metaRow}>
        <Ionicons name="location-outline" size={12} color={COLORS.RUSH_RED} />
        <Text numberOfLines={1} style={styles.metaText}>{item.venue || ""}</Text>
      </View>
      <View style={styles.metaRow}>
        <Ionicons name="calendar-outline" size={12} color={COLORS.RUSH_RED} />
        <Text numberOfLines={1} style={styles.metaText}>{item.date || ""}</Text>
      </View>
    </TouchableOpacity>
  );
});

const VerticalRow = React.memo(function VerticalRow({ item, onPress, onBuy }: { item: ListItem; onPress?: () => void; onBuy?: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.vRow} onPress={onPress}>
      <Image source={{ uri: item.image }} style={styles.vThumb} />
      <View style={styles.vInfo}>
        <Text numberOfLines={1} style={styles.vTitle}>{item.title}</Text>
        <Text numberOfLines={1} style={styles.vVenue}>
          {item.venue
            ? item.date
              ? `${item.venue} • ${item.date}`
              : item.venue
            : (item.date || "")
          }
        </Text>
      </View>
      <TouchableOpacity style={styles.buyBtn} onPress={onBuy} accessibilityRole="button">
        <Text style={styles.buyText}>Satın Al</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<HomeResponse>({});
  const heroRef = useRef<FlatList<HeroItem>>(null);
  const nav = useNavigation<any>();
  const { user } = useUser();

  const getInitialsFromName = useCallback((name?: string) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "?";
    if (parts.length === 1) return parts[0][0].toLocaleUpperCase("tr-TR");
    const first = parts[0][0] ?? "";
    const last = parts[parts.length - 1][0] ?? "";
    return (first + last).toLocaleUpperCase("tr-TR");
  }, []);

  const formatDateTR = useCallback((raw?: string) => {
    if (!raw) return "";
    if (/^\d{4}-\d{2}-\d{2}T/.test(raw)) {
      const d = new Date(raw);
      try {
        return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short", year: "numeric" }).format(d);
      } catch {
        return d.toISOString().slice(0, 10);
      }
    }
    return raw;
  }, []);

  const loadData = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const result = (await fetchHomeData()) as HomeResponse;
      setData(result);
    } catch (e: any) {
      setError(e?.message || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = (await fetchHomeData()) as HomeResponse;
      setData(result);
    } catch (e: any) {
      setError(e?.message || "Yenileme sırasında hata");
    } finally {
      setRefreshing(false);
    }
  }, []);

  const heroData = useMemo<HeroItem[]>(() => (data.hero_events ?? data.hero ?? []) as HeroItem[], [data]);

  const loopData = useMemo<HeroItem[]>(
    () => (heroData.length > 1 ? [heroData[heroData.length - 1], ...heroData, heroData[0]] : heroData),
    [heroData]
  );

  const initialIndex = heroData.length > 1 ? 1 : 0;

  const getHeroItemLayout = useCallback(
    (_: any, index: number) => ({
      length: SNAP,
      offset: 16 + SNAP * index,
      index,
    }),
    []
  );

  const onHeroMomentumEnd = useCallback(
    (e: any) => {
      if (heroData.length <= 1) return;
      const x = e.nativeEvent.contentOffset.x - 16;
      const i = Math.round(x / SNAP);
      const lastIdx = loopData.length - 1;
      if (i === 0) {
        heroRef.current?.scrollToIndex({ index: heroData.length, animated: false });
      } else if (i === lastIdx) {
        heroRef.current?.scrollToIndex({ index: 1, animated: false });
      }
    },
    [heroData.length, loopData.length]
  );

  const renderHeroItem = useCallback(
    ({ item }: { item: HeroItem }) => {
      const city = item.city || item.venue || (typeof item.subtitle === "string" ? item.subtitle.split(" • ")[0] : "");
      const date = formatDateTR(item.start_at || item.date);
      return (
        <TouchableOpacity
          activeOpacity={0.95}
          style={styles.heroCard}
          onPress={() =>
            nav.navigate("EventDetail", {
              id: item.id,
              slug: item.slug,
              type: "event",
              prefill: {
                id: item.id,
                slug: item.slug,
                type: "event",
                title: item.title,
                image: item.image,
                venue: { name: city, city },
                start_at: item.start_at,
                date,
              },
            })
          }
        >
          <Image source={{ uri: item.image }} style={styles.heroImage} />
          <View style={styles.heroBottomPanel}>
            {!!item.title && <Text numberOfLines={1} style={styles.heroTitle}>{item.title}</Text>}
            <View style={styles.heroMetaRow}>
              {!!city && (
                <View style={styles.heroMetaChunk}>
                  <Ionicons name="location-outline" size={12} color={COLORS.RUSH_RED} />
                  <Text numberOfLines={1} style={styles.heroMetaText}>{city}</Text>
                </View>
              )}
              {!!date && (
                <View style={styles.heroMetaChunk}>
                  <Ionicons name="calendar-outline" size={12} color="#fff" />
                  <Text numberOfLines={1} style={styles.heroMetaText}>{date}</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [formatDateTR, nav]
  );

  const keyId = useCallback((i: { id: number }) => String(i.id), []);
  const emptyArr: ListItem[] = [];

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color={COLORS.RUSH_RED} style={{ flex: 1, justifyContent: "center" }} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
          <Text style={{ color: COLORS.RUSH_RED, fontFamily: FONTS.DEFAULT, fontSize: 14 }}>{error}</Text>
          <TouchableOpacity onPress={loadData} style={styles.allBtn}>
            <Text style={styles.allBtnText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.logo}>RUSH</Text>
        <View style={styles.headerRight}>
          <IconButton icon="cart-outline" onPress={() => {}} />
          <IconButton icon="notifications-outline" onPress={() => {}} />
          <IconButton icon="location-outline" onPress={() => {}} />
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => nav.navigate("Profile")}
            accessibilityRole="button"
            accessibilityLabel="Profil"
          >
            <Text style={styles.avatarText}>{getInitialsFromName(user?.name)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl tintColor={COLORS.PRIMARY_TEXT} refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <FlatList
          ref={heroRef}
          data={loopData}
          keyExtractor={(item, idx) => `${item.id}-${idx}`}
          renderItem={renderHeroItem}
          horizontal
          decelerationRate="fast"
          snapToInterval={SNAP}
          snapToAlignment="start"
          disableIntervalMomentum
          initialScrollIndex={initialIndex}
          getItemLayout={getHeroItemLayout}
          onMomentumScrollEnd={onHeroMomentumEnd}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />

        <SectionHeader title="Sadece Rush’ta" onPressAll={() => {}} />
        <FlatList
          data={(data.just_on_rush as ListItem[]) || emptyArr}
          keyExtractor={keyId}
          renderItem={({ item }) => (
            <HorizontalEventCard
              item={item}
              onPress={() =>
                nav.navigate("EventDetail", {
                  id: item.id,
                  type: "product",
                  prefill: {
                    id: item.id,
                    type: "product",
                    title: item.title,
                    image: item.image,
                    venue: item.venue,
                    date: item.date,
                  },
                })
              }
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />

        <SectionHeader title="Rush’tan Seçkiler" onPressAll={() => {}} />
        <View style={{ paddingHorizontal: 16 }}>
          {((data.picks as ListItem[]) || emptyArr).map((it) => (
            <VerticalRow
              key={it.id}
              item={it}
              onPress={() =>
                nav.navigate("EventDetail", {
                  id: it.id,
                  type: "product",
                  prefill: {
                    id: it.id,
                    type: "product",
                    title: it.title,
                    image: it.image,
                    venue: it.venue,
                    date: it.date,
                  },
                })
              }
              onBuy={() =>
                nav.navigate("EventDetail", {
                  id: it.id,
                  type: "product",
                  prefill: {
                    id: it.id,
                    type: "product",
                    title: it.title,
                    image: it.image,
                    venue: it.venue,
                    date: it.date,
                  },
                })
              }
            />
          ))}
        </View>

        <SectionHeader title="Bu Hafta" onPressAll={() => {}} />
        <FlatList
          data={(data.this_week as ListItem[]) || emptyArr}
          keyExtractor={keyId}
          renderItem={({ item }) => (
            <HorizontalEventCard
              item={item}
              onPress={() =>
                nav.navigate("EventDetail", {
                  id: item.id,
                  type: "product",
                  prefill: {
                    id: item.id,
                    type: "product",
                    title: item.title,
                    image: item.image,
                    venue: item.venue,
                    date: item.date,
                  },
                })
              }
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_W = Math.min(260, width * 0.72);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.DARK_BG },
  header: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: { color: COLORS.RUSH_RED, fontFamily: FONTS.LOGO || FONTS.DEFAULT, fontSize: 26, letterSpacing: 1 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBtn: { padding: 8, borderRadius: 999 },
  avatar: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.RUSH_RED,
    alignItems: "center", justifyContent: "center", marginLeft: 2,
  },
  avatarText: { color: COLORS.PRIMARY_TEXT, fontFamily: FONTS.DEFAULT, fontSize: 12, includeFontPadding: false },

  sectionHeader: {
    paddingHorizontal: 16, marginTop: 18, marginBottom: 10,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  sectionTitle: { color: COLORS.PRIMARY_TEXT, fontFamily: FONTS.DEFAULT, fontSize: 18, fontWeight: "500" },
  allBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: COLORS.SECONDARY_TEXT },
  allBtnText: { color: COLORS.PRIMARY_TEXT, fontFamily: FONTS.DEFAULT, fontSize: 12 },

  heroCard: {
    width: width - 32,
    height: Math.min(400, width * 1),
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 12,
  },
  heroImage: { width: "100%", height: "100%" },

  heroBottomPanel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
  heroTitle: { color: "#fff", fontFamily: FONTS.DEFAULT, fontSize: 16, fontWeight: "700", marginBottom: 6 },
  heroMetaRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  heroMetaChunk: { flexDirection: "row", alignItems: "center", gap: 6, maxWidth: (width - 32) / 2 - 16 },
  heroMetaText: { color: "#fff", fontFamily: FONTS.DEFAULT, fontSize: 12 },

  hCard: { width: CARD_W, marginRight: 12 },
  hImage: { width: "100%", height: CARD_W * 0.62, borderRadius: 16, marginBottom: 8 },
  hTitle: { color: COLORS.PRIMARY_TEXT, fontFamily: FONTS.DEFAULT, fontSize: 14, marginBottom: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { color: COLORS.SECONDARY_TEXT, fontFamily: FONTS.DEFAULT, fontSize: 12 },

  vRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, gap: 12 },
  vThumb: { width: 64, height: 64, borderRadius: 12, backgroundColor: "#222" },
  vInfo: { flex: 1 },
  vTitle: { color: COLORS.PRIMARY_TEXT, fontFamily: FONTS.DEFAULT, fontSize: 14, marginBottom: 2 },
  vVenue: { color: COLORS.SECONDARY_TEXT, fontFamily: FONTS.DEFAULT, fontSize: 12 },
  buyBtn: { backgroundColor: "#2A2A2A", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  buyText: { color: COLORS.PRIMARY_TEXT, fontFamily: FONTS.DEFAULT, fontSize: 12 },
});
