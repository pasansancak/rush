import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Share,
  Linking,
  Platform,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "../../constants/theme";

const { width } = Dimensions.get("window");
const PADDING = 16;
const HERO = width - PADDING * 2; // kare
const CTA_H = 40;

type ItemType = "event" | "product";

type Venue = {
  id?: number;
  name?: string;
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  logo_url?: string | null;
};

type Organization = {
  id?: number;
  name?: string;
  logo_url?: string | null;
  website?: string | null;
};

type ItemCommon = {
  id: number;
  slug?: string;
  type?: ItemType;
  title?: string;
  image?: string;
  start_at?: string;
  end_at?: string;
  timezone?: string;
  description?: string;
  rules?: string[] | string | null;

  price?: number;      // product fallback (minor)
  min_price?: number;  // event/product
  currency?: string;   // TRY
  is_free?: boolean;

  venue_id?: number;
  organization_id?: number;

  venue?: Venue;
  organization?: Organization;
};

type RouteParams = {
  id: number;
  slug?: string;
  type?: ItemType;
  prefill?: Partial<ItemCommon>;
};

const API = (process.env.EXPO_PUBLIC_API_BASE || "").replace(/\/$/, "");

// react-native-maps opsiyonel
let MapPkg: any = null;
try {
  MapPkg = require("react-native-maps");
} catch { /* yoksa sorun değil */ }

export default function EventDetailScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const { id, slug, type: initialType, prefill } = route.params || ({} as RouteParams);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [item, setItem] = useState<ItemCommon | null>(null);
  const [resolvedType, setResolvedType] = useState<ItemType | undefined>(initialType);

  const imageUrl = item?.image || prefill?.image;

  const formatDateTR = useCallback((raw?: string) => {
    if (!raw) return "";
    if (/^\d{4}-\d{2}-\d{2}T/.test(raw)) {
      const d = new Date(raw);
      try {
        return new Intl.DateTimeFormat("tr-TR", {
          day: "2-digit", month: "long", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        }).format(d);
      } catch {
        return d.toISOString().slice(0, 16).replace("T", " ");
      }
    }
    return raw;
  }, []);

  const toPrice = useCallback((minor?: number, currency = "TRY") => {
    if (minor == null) return "";
    const major = minor / 100;
    try {
      return new Intl.NumberFormat("tr-TR", { style: "currency", currency }).format(major);
    } catch {
      return `₺${major.toFixed(0)}`;
    }
  }, []);

  const fetchJSON = async (url: string) => {
    const r = await fetch(url);
    if (!r.ok) throw new Error(String(r.status));
    return r.json();
  };

  const fetchEvent = (idOrSlug: number | string) =>
    typeof idOrSlug === "number"
      ? fetch(`${API}/v1/events/${idOrSlug}`)
      : fetch(`${API}/v1/events/slug/${idOrSlug}`);

  const fetchProduct = (idOrSlug: number | string) =>
    typeof idOrSlug === "number"
      ? fetch(`${API}/v1/products/${idOrSlug}`)
      : fetch(`${API}/v1/products/slug/${idOrSlug}`);

  const normalize = (raw: any, forcedType?: ItemType): ItemCommon => {
    const t: ItemType | undefined = forcedType || raw?.type;
    const img = raw?.cover_image_url || raw?.image;

    const venue: Venue | undefined =
      raw?.venue ?? (raw?.venue_name || raw?.venue_city || raw?.venue_id
        ? {
            id: raw?.venue_id,
            name: raw?.venue_name,
            city: raw?.venue_city,
            address: raw?.venue_address,
            latitude: raw?.latitude ?? raw?.venue?.latitude,
            longitude: raw?.longitude ?? raw?.venue?.longitude,
            logo_url: raw?.venue_logo_url ?? raw?.venue?.logo_url,
          }
        : undefined);

    const org: Organization | undefined =
      raw?.organization ?? (raw?.organization_name || raw?.organization_id
        ? {
            id: raw?.organization_id,
            name: raw?.organization_name,
            logo_url: raw?.organization_logo_url ?? raw?.organization?.logo_url,
            website: raw?.organization_website ?? raw?.organization?.website,
          }
        : undefined);

    const rules: string[] | string | null =
      raw?.rules ??
      raw?.event_rules ??
      raw?.product_rules ??
      null;

    const minPrice = raw?.min_price ?? raw?.price;

    return {
      id: raw?.id,
      slug: raw?.slug,
      type: t,
      title: raw?.title,
      image: img,
      start_at: raw?.start_at || raw?.next_occurrence?.start_at,
      end_at: raw?.end_at || raw?.next_occurrence?.end_at,
      timezone: raw?.timezone || raw?.next_occurrence?.timezone,
      description: raw?.description,
      rules,
      price: raw?.price,
      min_price: minPrice,
      currency: raw?.currency || "TRY",
      is_free: raw?.is_free ?? minPrice === 0,
      venue_id: raw?.venue_id ?? raw?.venue?.id,
      organization_id: raw?.organization_id ?? raw?.organization?.id,
      venue,
      organization: org,
    };
  };

  const hydrateRefsIfNeeded = useCallback(async (base: ItemCommon) => {
    const tasks: Promise<any>[] = [];
    let v: Venue | undefined = base.venue;
    let o: Organization | undefined = base.organization;

    if (!v && base.venue_id) {
      tasks.push(
        fetchJSON(`${API}/v1/venues/${base.venue_id}`).then((j) => {
          v = {
            id: j?.id,
            name: j?.name,
            city: j?.city,
            address: j?.address,
            latitude: Number(j?.latitude ?? 0) || undefined,
            longitude: Number(j?.longitude ?? 0) || undefined,
            logo_url: j?.logo_url ?? null,
          };
        }).catch(() => {})
      );
    }
    if (!o && base.organization_id) {
      tasks.push(
        fetchJSON(`${API}/v1/organizations/${base.organization_id}`).then((j) => {
          o = { id: j?.id, name: j?.name, logo_url: j?.logo_url ?? null, website: j?.website ?? null };
        }).catch(() => {})
      );
    }
    if (tasks.length) await Promise.all(tasks);
    return { ...base, venue: v ?? base.venue, organization: o ?? base.organization };
  }, []);

  const load = useCallback(async () => {
    if (!id && !slug) {
      setError("Geçersiz öğe");
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      let data: any | null = null;
      let t: ItemType | undefined = initialType;

      if (initialType === "event") {
        const r = await fetchEvent(slug ?? id);
        if (r.ok) { data = await r.json(); t = "event"; }
        else if (r.status === 404) {
          const rp = await fetchProduct(slug ?? id);
          if (rp.ok) { data = await rp.json(); t = "product"; }
        }
      } else if (initialType === "product") {
        const r = await fetchProduct(slug ?? id);
        if (r.ok) { data = await r.json(); t = "product"; }
        else if (r.status === 404) {
          const re = await fetchEvent(slug ?? id);
          if (re.ok) { data = await re.json(); t = "event"; }
        }
      } else {
        const re = await fetchEvent(slug ?? id);
        if (re.ok) { data = await re.json(); t = "event"; }
        else if (re.status === 404) {
          const rp = await fetchProduct(slug ?? id);
          if (rp.ok) { data = await rp.json(); t = "product"; }
        }
      }

      if (!data) throw new Error("Öğe bulunamadı");

      const norm = normalize(data, t);
      const hydrated = await hydrateRefsIfNeeded(norm);

      setResolvedType(t);
      setItem(hydrated);
    } catch (e: any) {
      setError(e?.message || "Detay yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, [id, slug, initialType, hydrateRefsIfNeeded]);

  // prefill varsa hızlı göster
  useEffect(() => {
    if (prefill && !item) {
      setItem((prev) => ({ ...(prev || {}), ...prefill } as any));
    }
  }, [prefill, item]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await load(); } finally { setRefreshing(false); }
  }, [load]);

  const onShare = useCallback(async () => {
    const link = `${API}/e/${item?.slug || item?.id}`;
    try { await Share.share({ message: link, url: link, title: item?.title || "Etkinlik" }); } catch {}
  }, [item]);

  const openMaps = useCallback(() => {
    const addr = item?.venue?.address || `${item?.venue?.name || ""} ${item?.venue?.city || ""}`.trim();
    const lat = item?.venue?.latitude;
    const lng = item?.venue?.longitude;
    if (lat && lng) {
      const url = Platform.select({
        ios: `http://maps.apple.com/?ll=${lat},${lng}`,
        android: `geo:${lat},${lng}?q=${lat},${lng}`,
        default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      });
      if (url) Linking.openURL(url);
    } else if (addr) {
      const enc = encodeURIComponent(addr);
      const url = `https://www.google.com/maps/search/?api=1&query=${enc}`;
      Linking.openURL(url);
    }
  }, [item]);

  const whenText = useMemo(() => {
    const s = item?.start_at ? formatDateTR(item.start_at) : "";
    const e = item?.end_at ? formatDateTR(item.end_at) : "";
    return s && e ? `${s} - ${e}` : s || e || "";
  }, [item, formatDateTR]);

  const priceText = useMemo(() => {
    if (item?.is_free) return "Ücretsiz";
    return toPrice(item?.min_price ?? item?.price, item?.currency);
  }, [item, toPrice]);

  const rulesList: string[] = useMemo(() => {
    if (!item?.rules) return [];
    if (Array.isArray(item.rules)) return item.rules.filter(Boolean);
    // string ise satırlara böl
    return String(item.rules)
      .split(/\r?\n|•|- /)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }, [item?.rules]);

  if (loading && !item) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color={COLORS.RUSH_RED} style={{ flex: 1, justifyContent: "center" }} />
      </SafeAreaView>
    );
  }

  if (error && !item) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={{ color: COLORS.RUSH_RED, fontFamily: FONTS.DEFAULT }}>{error}</Text>
          <TouchableOpacity onPress={load} style={styles.retryBtn}>
            <Text style={styles.retryText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Üst şerit: sadece Paylaş */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => nav.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Geri dön"
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.PRIMARY_TEXT} />
        </TouchableOpacity>
        <Text numberOfLines={1} style={styles.topTitle}>
          {(resolvedType === "product" ? "Ürün" : "Etkinlik")} Detayı
        </Text>
        <TouchableOpacity style={styles.headerBtn} onPress={onShare} accessibilityRole="button">
          <Ionicons name="share-social-outline" size={20} color={COLORS.PRIMARY_TEXT} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: CTA_H + 24 }}
          refreshControl={<RefreshControl tintColor={COLORS.PRIMARY_TEXT} refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* HERO CARD */}
          {!!imageUrl && (
            <View style={styles.heroWrap}>
              <Image source={{ uri: imageUrl }} style={styles.heroImage} />
            </View>
          )}

          {/* Title */}
          {!!item?.title && <Text style={styles.title}>{item.title}</Text>}

          {/* Chips: tarih & konum & fiyat */}
          <View style={styles.chipsRow}>
            {!!whenText && (
              <View style={styles.chip}>
                <Ionicons name="calendar-outline" size={14} color={COLORS.PRIMARY_TEXT} />
                <Text numberOfLines={2} style={styles.chipText}>{whenText}</Text>
              </View>
            )}
            {!!item?.venue?.name && (
              <View style={styles.chip}>
                <Ionicons name="location-outline" size={14} color={COLORS.PRIMARY_TEXT} />
                <Text numberOfLines={1} style={styles.chipText}>
                  {item.venue?.name}{item.venue?.city ? `, ${item.venue.city}` : ""}
                </Text>
              </View>
            )}
            {!!priceText && (
              <View style={styles.chip}>
                <Ionicons name="pricetag-outline" size={14} color={COLORS.PRIMARY_TEXT} />
                <Text numberOfLines={1} style={styles.chipText}>{priceText}</Text>
              </View>
            )}
          </View>

          {/* Hakkında */}
          {!!item?.description && (
            <View style={styles.block}>
              <Text style={styles.sectionTitle}>Hakkında</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          )}

          {/* Kurallar */}
          {!!rulesList.length && (
            <View style={styles.block}>
              <Text style={styles.sectionTitle}>Kurallar</Text>
              <View style={{ gap: 6 }}>
                {rulesList.map((r, idx) => (
                  <Text key={idx} style={styles.ruleLine}>• {r}</Text>
                ))}
              </View>
            </View>
          )}

          {/* Organizatör */}
          {!!item?.organization?.name && (
            <View style={styles.block}>
              <Text style={styles.sectionTitle}>Organizatör</Text>
              <View style={styles.orgRow}>
                <Image
                  source={{ uri: item.organization.logo_url || "https://via.placeholder.com/80x80.png?text=ORG" }}
                  style={styles.orgLogo}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.orgName}>{item.organization.name}</Text>
                  {!!item.organization.website && (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(item.organization!.website!)}
                      style={styles.orgLink}
                    >
                      <Ionicons name="globe-outline" size={14} color={COLORS.PRIMARY_TEXT} />
                      <Text style={styles.orgLinkText}>Web sitesi</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Mekan */}
          {!!item?.venue?.name && (
            <View style={styles.block}>
              <Text style={styles.sectionTitle}>Mekan</Text>
              <View style={styles.venueRow}>
                <Image
                  source={{ uri: item.venue.logo_url || "https://via.placeholder.com/80x80.png?text=VENUE" }}
                  style={styles.venueLogo}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.venueName}>{item.venue.name}</Text>
                  {!!item.venue.address && (
                    <Text
                      style={styles.venueAddress}
                      onPress={openMaps}
                    >
                      {item.venue.address}
                    </Text>
                  )}
                </View>
              </View>

              {/* Harita */}
              <View style={styles.mapWrap}>
                {MapPkg && item.venue?.latitude && item.venue?.longitude ? (
                  <MapPkg.MapView
                    style={StyleSheet.absoluteFill}
                    initialRegion={{
                      latitude: item.venue.latitude!,
                      longitude: item.venue.longitude!,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    pointerEvents="none"
                  >
                    <MapPkg.Marker
                      coordinate={{ latitude: item.venue.latitude!, longitude: item.venue.longitude! }}
                    />
                  </MapPkg.MapView>
                ) : (
                  <TouchableOpacity style={styles.mapFallback} onPress={openMaps}>
                    <Ionicons name="map-outline" size={18} color={COLORS.PRIMARY_TEXT} />
                    <Text style={styles.mapFallbackText}>Haritada Aç</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </ScrollView>

        {/* SABİT CTA */}
        <View style={styles.ctaBar}>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => { /* ödeme akışı */ }}>
            <Text style={styles.ctaText}>{resolvedType === "product" ? "BİLET SEÇ" : "BİLET SEÇ"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.DARK_BG },
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },

  topBar: {
    paddingHorizontal: PADDING,
    paddingTop: 6,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topTitle: { color: COLORS.PRIMARY_TEXT, fontFamily: FONTS.DEFAULT, fontSize: 16 },
  headerBtn: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },

  heroWrap: {
    paddingHorizontal: PADDING,
    marginTop: 4,
  },
  heroImage: {
    width: HERO,
    height: HERO,
    borderRadius: 16,
  },

  title: {
    marginTop: 16,
    paddingHorizontal: PADDING,
    color: COLORS.PRIMARY_TEXT,
    fontFamily: FONTS.DEFAULT,
    fontSize: 22,
    fontWeight: "700",
  },

  chipsRow: {
    paddingHorizontal: PADDING,
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    maxWidth: width - PADDING * 2,
  },
  chipText: { color: COLORS.PRIMARY_TEXT, fontFamily: FONTS.DEFAULT, fontSize: 12 },

  block: { paddingHorizontal: PADDING, paddingTop: 18 },
  sectionTitle: { color: COLORS.PRIMARY_TEXT, fontFamily: FONTS.DEFAULT, fontSize: 16, marginBottom: 8 },

  description: {
    color: COLORS.PRIMARY_TEXT,
    opacity: 0.9,
    fontFamily: FONTS.DEFAULT,
    fontSize: 14,
    lineHeight: 20,
  },
  ruleLine: { color: COLORS.PRIMARY_TEXT, fontFamily: FONTS.DEFAULT, fontSize: 14, opacity: 0.9 },

  orgRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  orgLogo: { width: 56, height: 56, borderRadius: 12, backgroundColor: "#222" },
  orgName: { color: COLORS.PRIMARY_TEXT, fontFamily: FONTS.DEFAULT, fontSize: 15, fontWeight: "600" },
  orgLink: { marginTop: 6, flexDirection: "row", alignItems: "center", gap: 6 },
  orgLinkText: { color: COLORS.PRIMARY_TEXT, fontFamily: FONTS.DEFAULT, fontSize: 12, textDecorationLine: "underline" },

  venueRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  venueLogo: { width: 56, height: 56, borderRadius: 12, backgroundColor: "#222" },
  venueName: { color: COLORS.PRIMARY_TEXT, fontFamily: FONTS.DEFAULT, fontSize: 15, fontWeight: "600" },
  venueAddress: { color: COLORS.PRIMARY_TEXT, fontFamily: FONTS.DEFAULT, fontSize: 13, marginTop: 6, textDecorationLine: "underline" },

  mapWrap: {
    marginTop: 12,
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#111",
  },
  mapFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  mapFallbackText: { color: COLORS.PRIMARY_TEXT, fontFamily: FONTS.DEFAULT, fontSize: 12 },

  retryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.SECONDARY_TEXT,
  },
  retryText: { color: COLORS.PRIMARY_TEXT, fontFamily: FONTS.DEFAULT, fontSize: 12 },
  
  ctaBar: {
    position: "absolute",
    left: PADDING,
    right: PADDING,
    bottom: 12,
  },
  ctaBtn: {
    height: CTA_H,
    borderRadius: CTA_H / 2,
    backgroundColor: COLORS.RUSH_RED,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  ctaText: { color: COLORS.PRIMARY_TEXT, fontFamily: FONTS.DEFAULT, fontSize: 16, fontWeight: "800", letterSpacing: 0.3 },
});
