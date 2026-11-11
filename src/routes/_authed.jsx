import { Outlet, createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthGateError, requireSignedIn } from "@/components/auth/AuthGate";
import FollowUpAlert from "@/components/patients/FollowUpAlert";
import NavShell from "@/components/NavShell";
import { useAuth } from "@/lib/AuthContext";
import { dueReviews } from "@/lib/server-fns";

export const Route = createFileRoute("/_authed")({
  ssr: false,
  beforeLoad: requireSignedIn,
  loader: async () => ({ due: await dueReviews() }),
  errorComponent: AuthGateError,
  component: AuthedLayout,
});

function AuthedLayout() {
  const { isAuthenticated } = useAuth();
  const { due } = Route.useLoaderData();

  useEffect(() => {
    if (!isAuthenticated) {
      const returnTo = window.location.pathname + window.location.search;
      window.location.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
    }
  }, [isAuthenticated]);

  return (
    <NavShell dueCount={due.length}>
      <FollowUpAlert patients={due} />
      <Outlet />
    </NavShell>
  );
}
