import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";

export async function requireSignedIn() {
  return { user: { full_name: "کارشناس تغذیه" } };
}

export function AuthGateError({ error }) {
  return <DefaultCatchBoundary error={error} />;
}
