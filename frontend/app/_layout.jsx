import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "black",
          borderTopWidth: 0,
        },
        headerShown: false,
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "gray",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "HOME",
          tabBarIcon: ({ focused, color, size }) => {
            return (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                color={color}
                size={size}
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: "CATEGORIES",
          tabBarIcon: ({ focused, color, size }) => {
            return (
              <Ionicons
                name={focused ? "grid" : "grid-outline"}
                color={color}
                size={size}
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: "WISHLIST",
          tabBarIcon: ({ focused, size, color }) => {
            return (
              <Ionicons
                name={focused ? "heart" : "heart-outline"}
                color="white"
                size={size}
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "ORDERS",
          tabBarIcon: ({ focused, size, color }) => {
            return (
              <Ionicons
                name={focused ? "bag-handle" : "bag-handle-outline"}
                color="white"
                size={size}
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "PROFILE",
          tabBarIcon: ({ focused, size, color }) => {
            return (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                color="white"
                size={size}
              />
            );
          },
        }}
      />
    </Tabs>
  );
}
