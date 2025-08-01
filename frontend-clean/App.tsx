// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { useFonts } from 'expo-font';
import { View, ActivityIndicator } from 'react-native';

export default function App() {

  const [fontsLoaded] = useFonts({
    SILVERTHORNE: require('./src/assets/fonts/SILVERTHORNE.ttf'),
    Arial: require('./src/assets/fonts/Arial.ttf'),
  });


  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#FF4C00" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
