import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

import { Colors, FontSize, Radius, Shadow, Spacing } from '../theme';

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
  Builder: '+',
  Tracker: '#',
  Reports: '=',
  Settings: '*',
};

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[tabStyles.outer, { paddingBottom: Math.max(insets.bottom, Spacing.sm) }]}>
      <View style={tabStyles.bar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const options = descriptors[route.key]?.options;
          const label =
            typeof options?.tabBarLabel === 'string'
              ? options.tabBarLabel
              : options?.title ?? route.name;

          function onPress() {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          }

          function onLongPress() {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          }

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={options?.tabBarAccessibilityLabel}
              testID={options?.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [
                tabStyles.item,
                focused && tabStyles.itemActive,
                pressed && tabStyles.itemPressed,
              ]}>
              <View style={[tabStyles.iconWrap, focused && tabStyles.iconWrapActive]}>
                <Text style={[tabStyles.icon, focused && tabStyles.iconActive]}>
                  {TAB_ICONS[route.name]}
                </Text>
              </View>
              <Text style={[tabStyles.label, focused && tabStyles.labelActive]} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  outer: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  bar: {
    minHeight: 58,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xs,
    ...Shadow.md,
  },
  item: {
    flex: 1,
    minHeight: 48,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },
  itemActive: {
    backgroundColor: Colors.primaryBg,
  },
  itemPressed: {
    opacity: 0.78,
  },
  iconWrap: {
    width: 22,
    height: 22,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  iconWrapActive: {
    backgroundColor: Colors.primary,
  },
  icon: {
    fontSize: FontSize.xs,
    fontWeight: '900',
    color: Colors.textLight,
    lineHeight: 16,
  },
  iconActive: {
    color: Colors.textOnPrimary,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    color: Colors.textLight,
    letterSpacing: 0,
  },
  labelActive: {
    color: Colors.primaryDark,
  },
});

function renderTabBar(props: BottomTabBarProps) {
  return <CustomTabBar {...props} />;
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={renderTabBar}
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
        }}>
        <Tab.Screen name="Builder" component={BuilderNavigator} />
        <Tab.Screen name="Tracker" component={TrackerNavigator} />
        <Tab.Screen name="Reports" component={ReportsNavigator} />
        <Tab.Screen name="Settings" component={SettingsNavigator} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
