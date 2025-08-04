import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/mainScreens/HomeScreen';
import SearchScreen from '../screens/mainScreens/SearchScreen';
import QRScreen from '../screens/mainScreens/QRScreen';
import ProfileScreen from '../screens/mainScreens/ProfileScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../constants/theme';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  const { isLoggedIn } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();

  // Parametreyle tab yönlendirmesi (ör: Login'den sonra Profile'a gitmek için)
  const initialRoute = route.params?.screen || 'Home';

  return (
    <Tab.Navigator
      initialRouteName={initialRoute}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.PRIMARY_TEXT,
        tabBarInactiveTintColor: COLORS.SECONDARY_TEXT,
        tabBarStyle: {
          backgroundColor: COLORS.DARK_BG,
          borderTopWidth: 0,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName = '';
          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'Search') iconName = 'magnify';
          else if (route.name === 'QR') iconName = 'qrcode-scan';
          else if (route.name === 'Profile') iconName = 'account-circle-outline';
          return <MaterialCommunityIcons name={iconName as any} size={28} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen
        name="QR"
        component={QRScreen}
        listeners={{
          tabPress: (e) => {
            if (!isLoggedIn) {
              e.preventDefault();
              navigation.navigate('Login', { redirectTo: 'QR' });
            }
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        listeners={{
          tabPress: (e) => {
            if (!isLoggedIn) {
              e.preventDefault();
              navigation.navigate('Login', { redirectTo: 'Profile' });
            }
          },
        }}
      />
    </Tab.Navigator>
  );
}
