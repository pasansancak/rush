import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';
import LoginScreen from '../screens/loginScreens/LoginScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTab" component={MainTabNavigator} />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
