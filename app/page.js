import { getConversations } from "@/lib/data";
import DashboardClient from "./dashboard-client";

export const dynamic = "force-dynamic";

export default function Page() {
  const rows = getConversations();
  return <DashboardClient rows={rows} />;
}
