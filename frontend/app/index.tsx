import { Redirect } from "expo-router";
import { ROUTES } from "@/constants/routes";

// Root index intentionally redirects to the shop experience rather than
// allowing ambiguous route resolution or a second competing index route.
export default function Index() {
  return <Redirect href={ROUTES.home as any} />;
}
