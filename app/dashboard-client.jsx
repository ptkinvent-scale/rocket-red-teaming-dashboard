"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Moon, Sun, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const STATUS_COLOR = {
  good: "var(--good)",
  warning: "var(--warning)",
  critical: "var(--critical)",
  muted: "var(--muted-foreground)",
};

const STATUS_VARIANT = {
  good: "secondary",
  warning: "outline",
  critical: "destructive",
  muted: "outline",
};

const STATUS_CLASS = {
  good: "border-transparent bg-[var(--good)]/10 text-[var(--good)]",
  warning: "border-transparent bg-[var(--warning)]/10 text-[var(--warning)]",
};

const SORT_LABELS = {
  timestamp_desc: "Newest first",
  timestamp_asc: "Oldest first",
  violations_first: "Violations first",
  tracking_id: "Tracking ID",
};

function statusForVerdict(v) {
  if (/no_?violation|non.?violat|pass|clean/i.test(v)) return "good";
  if (/violation/i.test(v)) return "critical";
  return "warning";
}

function statusForSeverity(s) {
  const norm = (s || "none").toLowerCase();
  if (norm === "none" || norm === "null") return "muted";
  return "warning";
}

const SEVERITY_COLOR = {
  low: "var(--sev-low)",
  mild: "var(--sev-mild)",
  severe: "var(--sev-severe)",
};

function severityColor(severity) {
  return SEVERITY_COLOR[(severity || "").toLowerCase()] ?? "var(--warning)";
}

function StatusBadge({ status, children }) {
  return (
    <Badge variant={STATUS_VARIANT[status]} className={STATUS_CLASS[status]}>
      {children}
    </Badge>
  );
}

function SeverityBadge({ severity, children }) {
  const color = severityColor(severity);
  return (
    <Badge
      variant="outline"
      className="border-transparent"
      style={{ color, backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)` }}
    >
      {children}
    </Badge>
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

function fmtShortDateTime(ts) {
  if (!ts) return null;
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return null;
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12;
  return `${d.getMonth() + 1}/${d.getDate()} ${hours}:${minutes}${ampm}`;
}

function StatTile({ label, value, tone }) {
  const toneClass =
    tone === "critical" ? "text-destructive" : tone === "good" ? "text-[var(--good)]" : "text-foreground";
  return (
    <Card>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-1.5">{label}</div>
        <div className={`text-2xl font-semibold ${toneClass}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function BarChart({ title, data, colorFor }) {
  const [view, setView] = useState("chart");
  const max = Math.max(1, ...data.map((d) => d.value));
  const sorted = [...data].sort((a, b) => b.value - a.value);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardAction>
          <Button variant="outline" onClick={() => setView(view === "chart" ? "table" : "chart")}>
            {view === "chart" ? "Show table" : "Show chart"}
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        {view === "chart" ? (
          <div className="space-y-2">
            {sorted.map((d) => (
              <div
                key={d.label}
                className="grid grid-cols-[100px_1fr_36px] items-center gap-3 min-h-[28px]"
                title={`${d.label}: ${d.value}`}
              >
                <div className="text-sm text-muted-foreground text-right truncate">{d.label}</div>
                <div className="relative h-4 bg-muted rounded overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded"
                    style={{ width: `${Math.round((d.value / max) * 100)}%`, background: colorFor(d.label) }}
                  />
                </div>
                <div className="text-sm text-muted-foreground tabular-nums">{d.value}</div>
              </div>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead className="text-right">Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((d) => (
                <TableRow key={d.label}>
                  <TableCell>{d.label}</TableCell>
                  <TableCell className="text-right tabular-nums">{d.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function ConversationCard({ row, expanded, onToggle }) {
  const verdictStatus = statusForVerdict(row.verdict);
  const severityStatus = statusForSeverity(row.severity);
  const preview = row.clientInbound.replace(/\s+/g, " ").slice(0, 140);

  return (
    <Card className="mb-4 gap-0 overflow-hidden py-0">
      <Collapsible open={expanded} onOpenChange={onToggle}>
        <CollapsibleTrigger className="w-full flex items-center gap-3 p-4 flex-wrap text-left hover:bg-muted/50">
          <span className="text-sm font-semibold min-w-[52px] uppercase">{row.trackingId}</span>
          {row.severity === "none" ? (
            <StatusBadge status={verdictStatus}>{`${row.verdict}`}</StatusBadge>
          ) : (
            <SeverityBadge severity={row.severity}>{`${row.severity}_${row.verdict}`}</SeverityBadge>
          )}
          <Badge variant="secondary">{row.category}</Badge>
          <span className="flex items-center gap-1 text-sm text-muted-foreground whitespace-nowrap">
            <User className="size-3.5" />
            {row.redTeamerEmail || "—"}
          </span>
          <span className="text-sm text-muted-foreground flex-1 min-w-[140px]">
            {row.clientName}
            {row.state ? ` · ${row.state}` : ""}
          </span>
          <span className="text-sm text-muted-foreground flex-[2] min-w-[200px] truncate">{preview}</span>
          <ChevronRight
            className={`size-4 text-muted-foreground ml-auto transition-transform ${expanded ? "rotate-90" : ""}`}
          />
        </CollapsibleTrigger>

        <CollapsibleContent className="p-4 pt-0 border-t">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-4">
            <div>
              <h4 className="text-sm text-muted-foreground font-medium mb-2">Client</h4>
              <KV k="Name" v={row.clientName} />
              <KV k="State" v={row.state || "—"} />
              <KV k="Occupancy" v={row.occupancy || "—"} />
              <KV k="Banker" v={row.bankerName} />
            </div>
            <div>
              <h4 className="text-sm text-muted-foreground font-medium mb-2">Loan</h4>
              <KV k="Product" v={row.product || "—"} />
              <KV k="Purpose" v={row.purpose || "—"} />
              <KV k="Current rate" v={fmtPct(row.currentRate)} />
              <KV k="Target rate" v={fmtPct(row.targetRate)} />
            </div>
            <div>
              <h4 className="text-sm text-muted-foreground font-medium mb-2">Balance</h4>
              <KV k="Unpaid balance" v={fmtMoney(row.unpaidBalance)} />
              <KV k="P&I" v={fmtMoney(row.pAndI)} />
              <KV k="Est. equity" v={fmtMoney(row.equity)} />
              <KV k="PMI" v={row.hasMI ? fmtMoney(row.miAmount) + "/mo" : "None"} />
            </div>
            <div>
              <h4 className="text-sm text-muted-foreground font-medium mb-2">Meta</h4>
              <KV k="Category" v={row.category} />
              <KV k="Subcategory" v={row.subcategory || "—"} />
              <KV k="Timestamp" v={fmtDate(row.timestamp)} />
              <KV k="Red teamer" v={row.redTeamerEmail || "—"} />
            </div>
          </div>

          <div className="flex flex-col gap-3 my-4">
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
            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-muted-foreground">
                NBA directive (intended strategy)
              </summary>
              <div className="msg-text text-sm text-muted-foreground mt-2 leading-relaxed">
                {row.reasonText}
                {row.reasonText && row.strategyText ? "\n\n" : ""}
                {row.strategyText}
              </div>
            </details>
          )}

          <Card className={row.isViolation ? "mt-4 border-destructive/40 bg-destructive/5" : "mt-4 bg-muted/40"}>
            <CardContent>
              <div className="flex gap-2 items-center mb-2 flex-wrap">
                <StatusBadge status={verdictStatus}>{row.verdict}</StatusBadge>
                {row.severity !== "none" && <StatusBadge status={severityStatus}>severity: {row.severity}</StatusBadge>}
              </div>
              <div className="text-sm">{row.comment || "No comment provided."}</div>
            </CardContent>
          </Card>

          <div className="text-sm text-muted-foreground mt-3">
            Source: {row.sourceFile} · ID: {row.id}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

function KV({ k, v }) {
  return (
    <div className="flex justify-between text-sm py-1 text-muted-foreground">
      <span>{k}</span>
      <span className="text-foreground tabular-nums text-right">{v}</span>
    </div>
  );
}

function ChatBubble({ align, name, text, tone }) {
  const isRight = align === "right";
  const toneClass = tone === "client" ? "bg-secondary text-secondary-foreground" : "bg-muted text-foreground";

  return (
    <div className={`flex flex-col max-w-[80%] ${isRight ? "self-end items-end" : "self-start items-start"}`}>
      <span className="text-sm text-muted-foreground font-medium mb-1 px-1">{name}</span>
      <div
        className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed msg-text ${toneClass} ${
          isRight ? "rounded-tr-sm" : "rounded-tl-sm"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

export default function DashboardClient({ rows, buildTime }) {
  const [search, setSearch] = useState("");
  const [verdictFilter, setVerdictFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [redTeamerFilter, setRedTeamerFilter] = useState("all");
  const [sort, setSort] = useState("timestamp_desc");
  const [expanded, setExpanded] = useState(new Set());

  const uniqueVerdicts = useMemo(() => [...new Set(rows.map((r) => r.verdict))].sort(), [rows]);
  const uniqueCategories = useMemo(() => [...new Set(rows.map((r) => r.category))].sort(), [rows]);
  const uniqueSeverities = useMemo(() => [...new Set(rows.map((r) => r.severity))].sort(), [rows]);
  const uniqueRedTeamers = useMemo(
    () => [...new Set(rows.map((r) => r.redTeamerEmail).filter(Boolean))].sort(),
    [rows],
  );

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
      if (redTeamerFilter !== "all" && r.redTeamerEmail !== redTeamerFilter) return false;
      if (search) {
        const hay = [
          r.trackingId,
          r.clientName,
          r.category,
          r.subcategory,
          r.clientInbound,
          r.generatedSms,
          r.comment,
          r.redTeamerEmail,
        ]
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
  }, [rows, search, verdictFilter, categoryFilter, severityFilter, redTeamerFilter, sort]);

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
    setRedTeamerFilter("all");
    setSort("timestamp_desc");
  }

  const total = rows.length;
  const violations = rows.filter((r) => r.isViolation).length;
  const noViolations = total - violations;
  const rate = total ? ((violations / total) * 100).toFixed(1) + "%" : "—";

  return (
    <div className="max-w-[1180px] mx-auto px-6 py-8 pb-20 w-full">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-1">🚀 Rocket Red Teaming Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {total} conversation{total === 1 ? "" : "s"} loaded · Last updated at {fmtShortDateTime(buildTime)}
          </p>
        </div>
        <ThemeToggle />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatTile label="Total conversations" value={total} />
        <StatTile label="Violations found" value={violations} tone="critical" />
        <StatTile label="No violation" value={noViolations} tone="good" />
        <StatTile label="Violation rate" value={rate} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <BarChart
          title="Verdict breakdown"
          data={countBy("verdict")}
          colorFor={(l) => STATUS_COLOR[statusForVerdict(l)]}
        />
        <BarChart title="Category breakdown" data={countBy("category")} colorFor={() => "var(--muted-foreground)"} />
        <BarChart
          title="Severity breakdown"
          data={countBy("severity")}
          colorFor={(l) => {
            const norm = (l || "none").toLowerCase();
            if (norm === "none") return "var(--muted-foreground)";
            if (norm === "severe" || norm === "critical") return "var(--critical)";
            return severityColor(l);
          }}
        />
      </div>

      <Card className="flex-row flex-wrap items-center gap-3 mb-6">
        <Input
          type="search"
          placeholder="Search tracking id, client, message text..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px]"
        />
        <FilterSelect
          value={verdictFilter}
          onChange={setVerdictFilter}
          options={uniqueVerdicts}
          allLabel="All verdicts"
        />
        <FilterSelect
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={uniqueCategories}
          allLabel="All categories"
        />
        <FilterSelect
          value={severityFilter}
          onChange={setSeverityFilter}
          options={uniqueSeverities}
          allLabel="All severities"
        />
        <FilterSelect
          value={redTeamerFilter}
          onChange={setRedTeamerFilter}
          options={uniqueRedTeamers}
          allLabel="All red teamers"
        />
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger>
            <SelectValue>{(v) => SORT_LABELS[v] ?? v}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="timestamp_desc">Newest first</SelectItem>
            <SelectItem value="timestamp_asc">Oldest first</SelectItem>
            <SelectItem value="violations_first">Violations first</SelectItem>
            <SelectItem value="tracking_id">Tracking ID</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground ml-auto whitespace-nowrap">
          {filtered.length} of {total} shown
        </span>
        <Button variant="outline" onClick={resetFilters}>
          Reset
        </Button>
      </Card>

      {filtered.length === 0 ? (
        <div className="text-center text-muted-foreground py-10 px-5 border border-dashed rounded-xl text-sm">
          No conversations match the current filters.
        </div>
      ) : (
        filtered.map((row) => (
          <ConversationCard key={row.id} row={row} expanded={expanded.has(row.id)} onToggle={() => toggle(row.id)} />
        ))
      )}
    </div>
  );
}

function FilterSelect({ value, onChange, options, allLabel }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue>{(v) => (v === "all" ? allLabel : v)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ThemeToggle() {
  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("rt-theme", next ? "dark" : "light");
  }

  return (
    <Button variant="outline" size="icon" onClick={toggle} aria-label="Toggle theme">
      <Sun className="size-4 dark:hidden" />
      <Moon className="hidden size-4 dark:block" />
    </Button>
  );
}
