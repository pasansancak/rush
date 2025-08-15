import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, FONTS } from "../constants/theme";

type VenueMini = { name?: string; city?: string };
type OccurrenceMini = { start_at?: string; end_at?: string; timezone?: string };

interface ProductCardProps {
  id: number;
  slug: string;
  title: string;
  cover_image_url?: string;
  venue: VenueMini;
  next_occurrence?: OccurrenceMini;
  onPress: () => void;
}

export default function ProductCard({ title, cover_image_url, venue, next_occurrence, onPress }: ProductCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {cover_image_url && <Image source={{ uri: cover_image_url }} style={styles.image} />}
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <Text style={styles.subtitle}>{venue?.city || ""}</Text>
      {next_occurrence?.start_at && (
        <Text style={styles.occurrence}>Başlangıç: {new Date(next_occurrence.start_at).toLocaleDateString()}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { width: 180, marginHorizontal: 8, backgroundColor: "#222", borderRadius: 10, overflow: "hidden" },
  image: { width: "100%", height: 100 },
  title: { color: COLORS.PRIMARY_TEXT, fontFamily: FONTS.DEFAULT, fontSize: 14, marginHorizontal: 8, marginTop: 6 },
  subtitle: { color: COLORS.SECONDARY_TEXT, fontSize: 12, marginHorizontal: 8 },
  occurrence: { color: COLORS.SECONDARY_TEXT, fontSize: 11, marginHorizontal: 8, marginBottom: 6 },
});
