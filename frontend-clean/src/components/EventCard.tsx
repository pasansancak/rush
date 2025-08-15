import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, FONTS } from "../constants/theme";

type VenueMini = { name?: string; city?: string };

interface EventCardProps {
  id: number;
  slug: string;
  title: string;
  cover_image_url?: string;
  venue: VenueMini;
  city?: string;
  onPress: () => void;
}

export default function EventCard({ title, cover_image_url, venue, onPress }: EventCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {cover_image_url && <Image source={{ uri: cover_image_url }} style={styles.image} />}
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <Text style={styles.subtitle}>{venue?.city || ""}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { width: 180, marginHorizontal: 8, backgroundColor: "#222", borderRadius: 10, overflow: "hidden" },
  image: { width: "100%", height: 100 },
  title: { color: COLORS.PRIMARY_TEXT, fontFamily: FONTS.DEFAULT, fontSize: 14, marginHorizontal: 8, marginTop: 6 },
  subtitle: { color: COLORS.SECONDARY_TEXT, fontSize: 12, marginHorizontal: 8, marginBottom: 8 },
});
