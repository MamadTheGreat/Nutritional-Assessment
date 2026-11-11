import { redirect } from "@tanstack/react-router";
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";
import { getGoogleUser } from "@/lib/googleAuth";

export async function requireSignedIn({ location }) {
  const user = getGoogleUser();
  if (user) return { user };
  const returnTo = `${location.pathname || "/"}${location.searchStr || ""}`;
  throw redirect({ to: "/login", search: { returnTo } });
}

export function AuthGateError({ error }) {
  return <DefaultCatchBoundary error={error} />;
}
