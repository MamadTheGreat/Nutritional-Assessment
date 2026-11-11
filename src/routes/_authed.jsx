import { Outlet, createFileRoute } from "@tanstack/react-router";
import FollowUpAlert from "@/components/patients/FollowUpAlert";
import NavShell from "@/components/NavShell";
import { dueReviews } from "@/lib/server-fns";

export const Route = createFileRoute("/_authed")({
  ssr: false,
  loader: async () => ({ due: await dueReviews() }),
  component: AuthedLayout,
});

function AuthedLayout() {
  const { due } = Route.useLoaderData();

  return (
    <NavShell dueCount={due.length}>
      <FollowUpAlert patients={due} />
      <Outlet />
    </NavShell>
  );
}
