import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { enableScreens } from 'react-native-screens';

import BuilderHomeScreen from '../screens/Builder/BuilderHomeScreen';
import BuilderFormScreen from '../screens/Builder/BuilderFormScreen';
import MembersScreen from '../screens/Builder/MembersScreen';
import ModeSelectionScreen from '../screens/Builder/ModeSelectionScreen';
import PayoutOrderScreen from '../screens/Builder/PayoutOrderScreen';
import SchedulePreviewScreen from '../screens/Builder/SchedulePreviewScreen';

import TrackerHomeScreen from '../screens/Tracker/TrackerHomeScreen';
import CircleDetailScreen from '../screens/Tracker/CircleDetailScreen';
import CycleDetailScreen from '../screens/Tracker/CycleDetailScreen';

import ReportsHomeScreen from '../screens/Reports/ReportsHomeScreen';
import CircleReportScreen from '../screens/Reports/CircleReportScreen';

import SettingsScreen from '../screens/Settings/SettingsScreen';

import { Colors, FontSize } from '../theme';

// Initialize react-native-screens early
enableScreens();

const BuilderStack = createNativeStackNavigator();
const TrackerStack = createNativeStackNavigator();
const ReportsStack = createNativeStackNavigator();
const SettingsStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function BuilderNavigator() {
  return (
    <BuilderStack.Navigator screenOptions={{ headerShown: false }}>
      <BuilderStack.Screen name="BuilderHome" component={BuilderHomeScreen} />
      <BuilderStack.Screen name="ModeSelection" component={ModeSelectionScreen} />
      <BuilderStack.Screen name="BuilderForm" component={BuilderFormScreen} />
      <BuilderStack.Screen name="Members" component={MembersScreen} />
      <BuilderStack.Screen name="PayoutOrder" component={PayoutOrderScreen} />
      <BuilderStack.Screen name="SchedulePreview" component={SchedulePreviewScreen} />
      {/* Accessed from BuilderHome → planning circle detail */}
      <BuilderStack.Screen name="CircleDetail" component={CircleDetailScreen} />
      <BuilderStack.Screen name="CycleDetail" component={CycleDetailScreen} />
    </BuilderStack.Navigator>
  );
}

function TrackerNavigator() {
  return (
    <TrackerStack.Navigator screenOptions={{ headerShown: false }}>
      <TrackerStack.Screen name="TrackerHome" component={TrackerHomeScreen} />
      <TrackerStack.Screen name="CircleDetail" component={CircleDetailScreen} />
      <TrackerStack.Screen name="CycleDetail" component={CycleDetailScreen} />
    </TrackerStack.Navigator>
  );
}

function ReportsNavigator() {
  return (
    <ReportsStack.Navigator screenOptions={{ headerShown: false }}>
      <ReportsStack.Screen name="ReportsHome" component={ReportsHomeScreen} />
      <ReportsStack.Screen name="CircleReport" component={CircleReportScreen} />
    </ReportsStack.Navigator>
  );
}

function SettingsNavigator() {
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="Settings" component={SettingsScreen} />
    </SettingsStack.Navigator>
  );
}

const TAB_ICONS: Record<string, string> = {
  Builder: '🏗️',
  Tracker: '📊',
  Reports: '📋',
  Settings: '⚙️',
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  return (
    <View style={tabStyles.wrap}>
      <Text style={[tabStyles.icon, focused && tabStyles.focusedIcon]}>
        {TAB_ICONS[name]}
      </Text>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 22, opacity: 0.55 },
  focusedIcon: { opacity: 1 },
});

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textLight,
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopColor: Colors.border,
            borderTopWidth: 1,
            height: Platform.OS === 'android' ? 62 : 82,
            paddingBottom: Platform.OS === 'android' ? 10 : 22,
            paddingTop: 6,
            elevation: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
          },
          tabBarLabelStyle: {
            fontSize: FontSize.xs,
            fontWeight: '700',
            letterSpacing: 0.2,
          },
          tabBarHideOnKeyboard: true,
        })}>
        <Tab.Screen name="Builder" component={BuilderNavigator} />
        <Tab.Screen name="Tracker" component={TrackerNavigator} />
        <Tab.Screen name="Reports" component={ReportsNavigator} />
        <Tab.Screen name="Settings" component={SettingsNavigator} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
