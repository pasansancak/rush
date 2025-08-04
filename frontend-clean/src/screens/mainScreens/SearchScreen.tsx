// src/screens/SearchScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';

export default function SearchScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Search Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.DARK_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: COLORS.PRIMARY_TEXT,
    fontFamily: FONTS.DEFAULT,
    fontSize: 18,
  },
});
