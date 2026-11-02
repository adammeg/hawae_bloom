import { Redirect, type Href } from "expo-router";
import { LoadingView } from "@/components/ui";
import { useAuth } from "@/src/state/auth-context";
import { useCycle } from "@/src/state/cycle-context";

export default function Index() {
  const auth = useAuth();
  const cycle = useCycle();
  if (!auth.hydrated || !cycle.hydrated) return <LoadingView />;
  const destination = (!auth.user
    ? "/auth"
    : cycle.settings.onboardingComplete
      ? "/(tabs)"
      : "/welcome") as Href;
  return <Redirect href={destination} />;
}
