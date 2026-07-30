"use client";

import { useMemo, useState } from "react";

const CATEGORICAL_SLOTS = [
  "var(--slot-1)",
  "var(--slot-2)",
  "var(--slot-3)",
  "var(--slot-4)",
  "var(--slot-5)",
  "var(--slot-6)",
  "var(--slot-7)",
  "var(--slot-8)",
];

function statusForVerdict(v) {
  if (/no_?violation|non.?violat|pass|clean/i.test(v)) return "good";
  if (/violation/i.test(v)) return "critical";
  return "warning";
}

function statusForSeverity(s) {
  const norm = (s || "none").toLowerCase();
  if (norm === "none" || norm === "null") return "muted";
  if (norm === "low") return "good";
  if (norm === "medium" || norm === "moderate") return "warning";
  if (norm === "high") return "serious";
  if (norm === "critical" || norm === "severe") return "critical";
  return "warning";
}

const STATUS_TEXT = {
  good: "text-[var(--good)]",
  warning: "text-[#9a6a00]",
  serious: "text-[#a0431e]",
  critical: "text-[var(--critical)]",
  muted: "text-[var(--text-muted)]",
};

const STATUS_BG = {
  good: "bg-[color-mix(in_srgb,var(--good)_14%,transparent)]",
  warning: "bg-[color-mix(in_srgb,var(--warning)_22%,transparent)]",
  serious: "bg-[color-mix(in_srgb,var(--serious)_20%,transparent)]",
  critical: "bg-[color-mix(in_srgb,var(--critical)_14%,transparent)]",
  muted: "bg-[var(--gridline)]",
};

function Badge({ status, children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${STATUS_TEXT[status]} ${STATUS_BG[status]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: "currentColor" }} />
      {children}
    </span>
  );
}

function fmtMoney(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return "$" + Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
}
function fmtPct(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return Number(n).toFixed(3) + "%";
}
function fmtDate(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatTile({ label, value, tone }) {
  const toneClass =
    tone === "critical"
      ? "text-[var(--critical)]"
      : tone === "good"
        ? "text-[var(--good)]"
        : "text-[var(--text-primary)]";
  return (
    <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-xl px-4 py-3.5">
      <div className="text-xs text-[var(--text-secondary)] mb-1.5">{label}</div>
      <div className={`text-2xl font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}

function BarChart({ title, data, colorFor }) {
  const [view, setView] = useState("chart");
  const max = Math.max(1, ...data.map((d) => d.value));
  const sorted = [...data].sort((a, b) => b.value - a.value);

  return (
    <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-semibold">{title}</span>
        <button
          onClick={() => setView(view === "chart" ? "table" : "chart")}
          className="text-[11px] text-[var(--text-secondary)] border border-[var(--border)] rounded-md px-2 py-0.5 hover:text-[var(--text-primary)]"
        >
          {view === "chart" ? "Show table" : "Show chart"}
        </button>
      </div>

      {view === "chart" ? (
        <div className="space-y-1">
          {sorted.map((d) => (
            <div
              key={d.label}
              className="grid grid-cols-[100px_1fr_36px] items-center gap-2 min-h-[26px]"
              title={`${d.label}: ${d.value}`}
            >
              <div className="text-xs text-[var(--text-secondary)] text-right truncate">{d.label}</div>
              <div className="relative h-4 bg-[var(--gridline)] rounded overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded"
                  style={{ width: `${Math.round((d.value / max) * 100)}%`, background: colorFor(d.label) }}
                />
              </div>
              <div className="text-xs text-[var(--text-secondary)] tabular-nums">{d.value}</div>
            </div>
          ))}
        </div>
      ) : (
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="text-[var(--text-muted)]">
              <th className="text-left font-medium border-b border-[var(--gridline)] py-1">Label</th>
              <th className="text-right font-medium border-b border-[var(--gridline)] py-1">Count</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((d) => (
              <tr key={d.label}>
                <td className="py-1 border-b border-[var(--gridline)] text-[var(--text-secondary)]">{d.label}</td>
                <td className="py-1 border-b border-[var(--gridline)] text-right tabular-nums text-[var(--text-secondary)]">
                  {d.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function ConversationCard({ row, expanded, onToggle, categoryColor }) {
  const verdictStatus = statusForVerdict(row.verdict);
  const severityStatus = statusForSeverity(row.severity);
  const preview = row.clientInbound.replace(/\s+/g, " ").slice(0, 140);
  const evalTone =
    verdictStatus === "critical"
      ? "bg-[color-mix(in_srgb,var(--critical)_8%,var(--surface-1))] border-[color-mix(in_srgb,var(--critical)_30%,var(--border))]"
      : verdictStatus === "good"
        ? "bg-[color-mix(in_srgb,var(--good)_8%,var(--surface-1))] border-[color-mix(in_srgb,var(--good)_30%,var(--border))]"
        : "bg-[var(--gridline)] border-[var(--border)]";

  return (
    <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-xl mb-2.5 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2.5 px-3.5 py-3 flex-wrap text-left hover:bg-[color-mix(in_srgb,var(--text-primary)_3%,transparent)]"
      >
        <span className="text-xs font-semibold min-w-[52px] uppercase">{row.trackingId}</span>
        <Badge status={verdictStatus}>{row.verdict}</Badge>
        {row.severity !== "none" && <Badge status={severityStatus}>{row.severity}</Badge>}
        <span
          className="text-[11px] font-semibold rounded-full px-2.5 py-0.5 bg-[var(--gridline)]"
          style={{ color: categoryColor }}
        >
          {row.category}
        </span>
        <span className="text-[12.5px] text-[var(--text-secondary)] flex-1 min-w-[140px]">
          {row.clientName}
          {row.state ? ` · ${row.state}` : ""}
        </span>
        <span className="text-xs text-[var(--text-muted)] flex-[2] min-w-[200px] truncate">{preview}</span>
        <span
          className={`text-[11px] text-[var(--text-muted)] ml-auto transition-transform ${expanded ? "rotate-90" : ""}`}
        >
          ▶
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-[var(--gridline)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 my-3.5">
            <div>
              <h4 className="text-[11px] uppercase tracking-wide text-[var(--text-muted)] font-semibold mb-1.5">
                Client
              </h4>
              <KV k="Name" v={row.clientName} />
              <KV k="State" v={row.state || "—"} />
              <KV k="Occupancy" v={row.occupancy || "—"} />
              <KV k="Banker" v={row.bankerName} />
            </div>
            <div>
              <h4 className="text-[11px] uppercase tracking-wide text-[var(--text-muted)] font-semibold mb-1.5">
                Loan
              </h4>
              <KV k="Product" v={row.product || "—"} />
              <KV k="Purpose" v={row.purpose || "—"} />
              <KV k="Current rate" v={fmtPct(row.currentRate)} />
              <KV k="Target rate" v={fmtPct(row.targetRate)} />
            </div>
            <div>
              <h4 className="text-[11px] uppercase tracking-wide text-[var(--text-muted)] font-semibold mb-1.5">
                Balance
              </h4>
              <KV k="Unpaid balance" v={fmtMoney(row.unpaidBalance)} />
              <KV k="P&I" v={fmtMoney(row.pAndI)} />
              <KV k="Est. equity" v={fmtMoney(row.equity)} />
              <KV k="PMI" v={row.hasMI ? fmtMoney(row.miAmount) + "/mo" : "None"} />
            </div>
            <div>
              <h4 className="text-[11px] uppercase tracking-wide text-[var(--text-muted)] font-semibold mb-1.5">
                Meta
              </h4>
              <KV k="Category" v={row.category} />
              <KV k="Subcategory" v={row.subcategory || "—"} />
              <KV k="Timestamp" v={fmtDate(row.timestamp)} />
            </div>
          </div>

          <div className="flex flex-col gap-2.5 my-3.5">
            {row.bankerOutreach && (
              <ChatBubble
                align="left"
                name={`Sales Agent on behalf of ${row.bankerName}`}
                text={row.bankerOutreach}
                tone="agent"
              />
            )}
            {row.clientInbound && (
              <ChatBubble align="right" name={row.clientName} text={row.clientInbound} tone="client" />
            )}
            {row.generatedSms && (
              <ChatBubble
                align="left"
                name={`Sales Agent on behalf of ${row.bankerName}`}
                text={row.generatedSms}
                tone="agent"
              />
            )}
          </div>

          {(row.reasonText || row.strategyText) && (
            <details className="mt-2.5">
              <summary className="cursor-pointer text-xs text-[var(--text-muted)]">
                NBA directive (intended strategy)
              </summary>
              <div className="msg-text text-[12.5px] text-[var(--text-secondary)] mt-2 leading-relaxed">
                {row.reasonText}
                {row.reasonText && row.strategyText ? "\n\n" : ""}
                {row.strategyText}
              </div>
            </details>
          )}

          <div className={`rounded-lg px-3 py-2.5 mt-3.5 border ${evalTone}`}>
            <div className="flex gap-2 items-center mb-1.5">
              <Badge status={verdictStatus}>{row.verdict}</Badge>
              {row.severity !== "none" && <Badge status={severityStatus}>severity: {row.severity}</Badge>}
            </div>
            <div className="text-[13px]">{row.comment || "No comment provided."}</div>
          </div>

          <div className="text-[10.5px] text-[var(--text-muted)] mt-2.5">
            Source: {row.sourceFile} · ID: {row.id}
          </div>
        </div>
      )}
    </div>
  );
}

function KV({ k, v }) {
  return (
    <div className="flex justify-between text-[12.5px] py-0.5 text-[var(--text-secondary)]">
      <span>{k}</span>
      <span className="text-[var(--text-primary)] tabular-nums text-right">{v}</span>
    </div>
  );
}

function ChatBubble({ align, name, text, tone }) {
  const isRight = align === "right";
  const toneClass =
    tone === "client"
      ? "bg-[color-mix(in_srgb,var(--slot-2)_12%,var(--surface-1))] border-[color-mix(in_srgb,var(--slot-2)_30%,var(--border))]"
      : "bg-[color-mix(in_srgb,var(--slot-1)_10%,var(--surface-1))] border-[color-mix(in_srgb,var(--slot-1)_28%,var(--border))]";

  return (
    <div className={`flex flex-col max-w-[80%] ${isRight ? "self-end items-end" : "self-start items-start"}`}>
      <span className="text-[10.5px] text-[var(--text-muted)] font-semibold mb-1 px-1">{name}</span>
      <div
        className={`rounded-2xl px-3.5 py-2.5 border text-[13px] leading-relaxed msg-text ${toneClass} ${
          isRight ? "rounded-tr-sm" : "rounded-tl-sm"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

export default function DashboardClient({ rows }) {
  const [search, setSearch] = useState("");
  const [verdictFilter, setVerdictFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [sort, setSort] = useState("timestamp_desc");
  const [expanded, setExpanded] = useState(new Set());

  const categoryColorMap = useMemo(() => {
    const order = [];
    for (const r of rows) if (!order.includes(r.category)) order.push(r.category);
    const map = {};
    order.forEach((val, i) => {
      map[val] = i < CATEGORICAL_SLOTS.length ? CATEGORICAL_SLOTS[i] : "var(--text-muted)";
    });
    return map;
  }, [rows]);

  const uniqueVerdicts = useMemo(() => [...new Set(rows.map((r) => r.verdict))].sort(), [rows]);
  const uniqueCategories = useMemo(() => [...new Set(rows.map((r) => r.category))].sort(), [rows]);
  const uniqueSeverities = useMemo(() => [...new Set(rows.map((r) => r.severity))].sort(), [rows]);

  function countBy(key) {
    const m = new Map();
    for (const r of rows) m.set(r[key], (m.get(r[key]) || 0) + 1);
    return [...m.entries()].map(([label, value]) => ({ label, value }));
  }

  const filtered = useMemo(() => {
    let list = rows.filter((r) => {
      if (verdictFilter !== "all" && r.verdict !== verdictFilter) return false;
      if (categoryFilter !== "all" && r.category !== categoryFilter) return false;
      if (severityFilter !== "all" && r.severity !== severityFilter) return false;
      if (search) {
        const hay = [r.trackingId, r.clientName, r.category, r.subcategory, r.clientInbound, r.generatedSms, r.comment]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(search.toLowerCase())) return false;
      }
      return true;
    });

    list = [...list];
    switch (sort) {
      case "timestamp_desc":
        list.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
        break;
      case "timestamp_asc":
        list.sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));
        break;
      case "violations_first":
        list.sort((a, b) => Number(b.isViolation) - Number(a.isViolation));
        break;
      case "tracking_id":
        list.sort((a, b) => String(a.trackingId).localeCompare(String(b.trackingId)));
        break;
    }
    return list;
  }, [rows, search, verdictFilter, categoryFilter, severityFilter, sort]);

  function toggle(id) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function resetFilters() {
    setSearch("");
    setVerdictFilter("all");
    setCategoryFilter("all");
    setSeverityFilter("all");
    setSort("timestamp_desc");
  }

  const total = rows.length;
  const violations = rows.filter((r) => r.isViolation).length;
  const noViolations = total - violations;
  const rate = total ? ((violations / total) * 100).toFixed(1) + "%" : "—";

  return (
    <div className="max-w-[1180px] mx-auto px-5 py-6 pb-20 w-full">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[22px] font-semibold mb-1">🚀 Rocket Red Teaming Dashboard</h1>
          <p className="text-[13.5px] text-[var(--text-secondary)]">
            {total} conversation{total === 1 ? "" : "s"} loaded from data/
          </p>
        </div>
        <ThemeToggle />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatTile label="Total conversations" value={total} />
        <StatTile label="Violations found" value={violations} tone="critical" />
        <StatTile label="No violation" value={noViolations} tone="good" />
        <StatTile label="Violation rate" value={rate} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <BarChart
          title="Verdict breakdown"
          data={countBy("verdict")}
          colorFor={(l) => `var(--${statusForVerdict(l)})`}
        />
        <BarChart
          title="Category breakdown"
          data={countBy("category")}
          colorFor={(l) => categoryColorMap[l] || "var(--text-muted)"}
        />
        <BarChart
          title="Severity breakdown"
          data={countBy("severity")}
          colorFor={(l) => `var(--${statusForSeverity(l)})`}
        />
      </div>

      <div className="flex flex-wrap gap-2 items-center bg-[var(--surface-1)] border border-[var(--border)] rounded-xl px-3 py-2.5 mb-4">
        <input
          type="search"
          placeholder="Search tracking id, client, message text..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[160px] text-[12.5px] px-2 py-1.5 rounded-md border border-[var(--border)] bg-[var(--page)] text-[var(--text-primary)]"
        />
        <Select value={verdictFilter} onChange={setVerdictFilter} options={uniqueVerdicts} allLabel="All verdicts" />
        <Select
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={uniqueCategories}
          allLabel="All categories"
        />
        <Select
          value={severityFilter}
          onChange={setSeverityFilter}
          options={uniqueSeverities}
          allLabel="All severities"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="text-[12.5px] px-2 py-1.5 rounded-md border border-[var(--border)] bg-[var(--page)] text-[var(--text-primary)]"
        >
          <option value="timestamp_desc">Newest first</option>
          <option value="timestamp_asc">Oldest first</option>
          <option value="violations_first">Violations first</option>
          <option value="tracking_id">Tracking ID</option>
        </select>
        <span className="text-xs text-[var(--text-muted)] ml-auto whitespace-nowrap">
          {filtered.length} of {total} shown
        </span>
        <button
          onClick={resetFilters}
          className="text-xs text-[var(--text-secondary)] border border-[var(--border)] rounded-md px-2.5 py-1.5 hover:text-[var(--text-primary)]"
        >
          Reset
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] py-10 px-5 border border-dashed border-[var(--border)] rounded-xl text-[13px]">
          No conversations match the current filters.
        </div>
      ) : (
        filtered.map((row) => (
          <ConversationCard
            key={row.id}
            row={row}
            expanded={expanded.has(row.id)}
            onToggle={() => toggle(row.id)}
            categoryColor={categoryColorMap[row.category]}
          />
        ))
      )}
    </div>
  );
}

function Select({ value, onChange, options, allLabel }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-[12.5px] px-2 py-1.5 rounded-md border border-[var(--border)] bg-[var(--page)] text-[var(--text-primary)]"
    >
      <option value="all">{allLabel}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useState(null);

  function toggle() {
    const isDark =
      theme === "dark" ||
      (theme === null && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    const next = isDark ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("rt-theme", next);
  }

  return (
    <button
      onClick={toggle}
      className="border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-secondary)] rounded-lg px-3 py-1.5 text-xs whitespace-nowrap hover:text-[var(--text-primary)]"
    >
      Toggle theme
    </button>
  );
}
