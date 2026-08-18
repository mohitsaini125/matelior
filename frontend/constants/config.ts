import Constants from "expo-constants";

// Public configuration only — never put secrets here.
export const API_BASE_URL: string =
  (Constants.expoConfig?.extra?.apiBaseUrl as string) ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  "http://10.153.51.111:3000";

export const config = {
  apiBaseUrl: API_BASE_URL,
  appName: "MATELIOR",
  defaultPageSize: 20,
};
