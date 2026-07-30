import fs from "fs";
import path from "path";

function safe(v, fallback) {
  return v === undefined || v === null || v === "" ? fallback : v;
}

function normalize(raw, sourceFile, idx) {
  const client = raw.profile?.client || {};
  const banker = raw.profile?.banker || {};
  const loan = raw.profile?.loan || {};
  const cls = raw.classification || {};
  const evalu = raw.evaluation || {};
  const verdict = safe(evalu.verdict, "unknown");
  const severity = safe(evalu.severity, "none");
  const isViolation = /violation/i.test(verdict) && !/no_violation|non.?violat/i.test(verdict);

  return {
    idx,
    id: raw.conversation_id || `conv-${idx}`,
    trackingId: safe(raw.tracking_id, "—"),
    sourceFile,
    timestamp: raw.timestamp || null,
    clientName: [client.first_name, client.last_name].filter(Boolean).join(" ") || "Unknown client",
    state: client.state || "",
    occupancy: client.occupancy_type || "",
    bankerName: [banker.first_name, banker.last_name].filter(Boolean).join(" ") || "Unknown banker",
    nmls: banker.nmls_id || "",
    product: loan.product || "",
    purpose: loan.purpose || "",
    currentRate: loan.current_rate_percent ?? null,
    targetRate: loan.target_rate_percent ?? null,
    hasMI: !!loan.has_mortgage_insurance,
    miAmount: loan.mortgage_insurance_amount ?? null,
    unpaidBalance: loan.unpaid_balance ?? null,
    pAndI: loan.principal_and_interest ?? null,
    equity: loan.estimated_equity ?? null,
    category: safe(cls.category, "uncategorized"),
    subcategory: safe(cls.subcategory, ""),
    redTeamerEmail: raw.rocket_email || "",
    bankerOutreach: raw.banker_outreach || "",
    clientInbound: raw.client_inbound || "",
    generatedSms: raw.generated_sms || "",
    reasonText: raw.nba_directive?.reason_text || "",
    strategyText: raw.nba_directive?.recommended_strategy_text || "",
    verdict,
    severity,
    comment: evalu.comment || "",
    isViolation,
  };
}

export function getConversations() {
  const dataDir = path.join(process.cwd(), "data");
  let files = [];
  try {
    files = fs
      .readdirSync(dataDir)
      .filter((f) => f.toLowerCase().endsWith(".json"))
      .sort();
  } catch {
    return [];
  }

  const rows = [];
  files.forEach((file, i) => {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8"));
      rows.push(normalize(raw, file, i));
    } catch (err) {
      console.error(`Failed to parse ${file}:`, err.message);
    }
  });
  return rows;
}
