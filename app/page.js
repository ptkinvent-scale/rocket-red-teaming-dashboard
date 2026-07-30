import { cookies } from "next/headers";
import { getConversations } from "@/lib/data";
import DashboardClient from "./dashboard-client";
import PasswordGate from "./password-gate";

export const dynamic = "force-dynamic";

export default async function Page() {
  const cookieStore = await cookies();
  const isAuthed = cookieStore.get("site_auth")?.value === process.env.SITE_PASSWORD;

  if (!isAuthed) {
    return <PasswordGate />;
  }

  const rows = getConversations();
  return <DashboardClient rows={rows} buildTime={process.env.BUILD_TIME} />;
}
