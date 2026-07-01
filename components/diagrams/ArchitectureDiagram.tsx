"use client";

// ─── Shared helpers ────────────────────────────────────────────────────────

const CX = 310; // horizontal centre

function Arrow({ x, y1, y2 }: { x: number; y1: number; y2: number }) {
  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={y2 - 7} stroke="#F0F4F5" strokeWidth={0.75} />
      <polygon
        points={`${x - 4},${y2 - 7} ${x + 4},${y2 - 7} ${x},${y2}`}
        fill="#F0F4F5"
      />
    </g>
  );
}

function FanIn({
  xs,
  yFrom,
  yMid,
  yTo,
  cx = CX,
}: {
  xs: number[];
  yFrom: number;
  yMid: number;
  yTo: number;
  cx?: number;
}) {
  return (
    <g stroke="#F0F4F5" strokeWidth={0.75} fill="none">
      {xs.map((x) => (
        <polyline key={x} points={`${x},${yFrom} ${x},${yMid} ${cx},${yMid} ${cx},${yTo - 7}`} />
      ))}
      <polygon points={`${cx - 4},${yTo - 7} ${cx + 4},${yTo - 7} ${cx},${yTo}`} fill="#F0F4F5" />
    </g>
  );
}

function FanOut({
  xs,
  yFrom,
  yMid,
  yTo,
  cx = CX,
}: {
  xs: number[];
  yFrom: number;
  yMid: number;
  yTo: number;
  cx?: number;
}) {
  return (
    <g stroke="#F0F4F5" strokeWidth={0.75} fill="none">
      <line x1={cx} y1={yFrom} x2={cx} y2={yMid} />
      {xs.map((x) => (
        <polyline key={x} points={`${cx},${yMid} ${x},${yMid} ${x},${yTo - 7}`} />
      ))}
      {xs.map((x) => (
        <polygon
          key={x + "a"}
          points={`${x - 4},${yTo - 7} ${x + 4},${yTo - 7} ${x},${yTo}`}
          fill="#F0F4F5"
        />
      ))}
    </g>
  );
}

function DatabaseCylinder({
  cx,
  topY,
  r = 130,
  ry = 18,
  bodyH = 82,
}: {
  cx: number;
  topY: number;
  r?: number;
  ry?: number;
  bodyH?: number;
}) {
  const topEY = topY + ry;
  const botEY = topY + ry + bodyH;
  return (
    <g>
      <rect x={cx - r} y={topEY} width={r * 2} height={bodyH} fill="#005EB8" />
      <ellipse cx={cx} cy={botEY} rx={r} ry={ry} fill="#2D2872" />
      <ellipse cx={cx} cy={topEY} rx={r} ry={ry} fill="#4D46A6" />
      <rect x={cx - r} y={topEY} width={r * 2} height={bodyH} fill="none" stroke="#5E57B8" strokeWidth={0.5} />
      <ellipse cx={cx} cy={botEY} rx={r} ry={ry} fill="none" stroke="#5E57B8" strokeWidth={0.5} />
      <ellipse cx={cx} cy={topEY} rx={r} ry={ry} fill="none" stroke="#5E57B8" strokeWidth={0.5} />
    </g>
  );
}

// ─── Box helpers ────────────────────────────────────────────────────────────

function Box({
  x, y, w, h,
  fill, stroke, strokeDash,
  label, sub, labelColor, subColor,
  tooltip,
}: {
  x: number; y: number; w: number; h: number;
  fill: string; stroke: string; strokeDash?: string;
  label: string; sub?: string; labelColor: string; subColor?: string;
  tooltip?: string;
}) {
  return (
    <g style={{ cursor: "pointer" }}>
      {tooltip && <title>{tooltip}</title>}
      <rect
        x={x} y={y} width={w} height={h} rx={6}
        fill={fill} stroke={stroke} strokeWidth={0.75}
        strokeDasharray={strokeDash}
      />
      <text
        x={x + w / 2}
        y={sub ? y + h / 2 - 7 : y + h / 2 + 1}
        textAnchor="middle"
        fontSize={12}
        fontWeight={500}
        fill={labelColor}
      >
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 11} textAnchor="middle" fontSize={10} fill={subColor ?? "#212B32"}>
          {sub}
        </text>
      )}
    </g>
  );
}

// ─── Architecture diagram ──────────────────────────────────────────────────

export default function ArchitectureDiagram() {
  const bw3 = 185; // 3-column box width
  const bw4 = 137; // 4-column box width
  const bw5 = 108; // 5-column box width
  const xs3 = [20, 217, 415];      // left-x for 3 columns (centre = cx of box)
  const xs4 = [20, 165, 311, 456]; // left-x for 4 columns
  const xs5 = [20, 136, 252, 368, 484];

  const cx3 = xs3.map((x) => x + bw3 / 2);
  const cx4 = xs4.map((x) => x + bw4 / 2);
  const cx5 = xs5.map((x) => x + bw5 / 2);

  // Layer Y positions
  const L0y = 20;  const L0h = 70;  const L0b = L0y + L0h;
  const L1y = 110; const L1h = 70;  const L1b = L1y + L1h;
  const L2y = 210; const L2h = 72;  const L2b = L2y + L2h;
  const L3y = 302; const L3h = 70;  const L3b = L3y + L3h;
  const L4y = 395; const L4h = 62;  const L4b = L4y + L4h;
  const L5y = 478; const L5h = 68;  const L5b = L5y + L5h;
  // Cylinder
  const cylTopY = 572; const cylRY = 18; const cylBodyH = 82;
  const cylBotEY = cylTopY + cylRY + cylBodyH;
  const cylBottom = cylBotEY + cylRY;
  const L7y = cylBottom + 22; const L7h = 58; const L7b = L7y + L7h;
  const dashY = L7b + 20;
  const L8y  = dashY + 20; const L8h = 50;

  const totalH = L8y + L8h + 16;

  return (
    <svg
      viewBox={`0 0 620 ${totalH}`}
      width="100%"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      {/* ── LAYER 0 - Use case scope ──────────── */}
      <text x={CX} y={L0y - 6} textAnchor="middle" fontSize={9} fill="#212B32" fontWeight={500} letterSpacing={1}>
        USE CASE SCOPE
      </text>
      <Box x={xs4[0]} y={L0y} w={bw4} h={L0h}
        fill="#E8F1FB" stroke="#085040"
        label="Silent delivery delay" sub="Phase 1 · LIVE"
        labelColor="#085040" subColor="#085040"
        tooltip="UC1 - Silent Delivery Delay Detection - Phase 1 LIVE - this is what we are building"
      />
      <rect x={xs4[0] + bw4 - 38} y={L0y + 4} width={34} height={14} rx={3} fill="#085040" />
      <text x={xs4[0] + bw4 - 21} y={L0y + 14} textAnchor="middle" fontSize={9} fontWeight={700} fill="#fff">LIVE</text>

      <Box x={xs4[1]} y={L0y} w={bw4} h={L0h}
        fill="#F8FAFC" stroke="#F0F4F5" strokeDash="5 3"
        label="NHS Workaround" sub="Coming soon"
        labelColor="#768692" subColor="#CBD5E1"
        tooltip="UC2 - NHS Workaround Quantification - future demo, not yet built"
      />
      <Box x={xs4[2]} y={L0y} w={bw4} h={L0h}
        fill="#F8FAFC" stroke="#F0F4F5" strokeDash="5 3"
        label="Proactive Intervention" sub="Coming soon"
        labelColor="#768692" subColor="#CBD5E1"
        tooltip="UC3 - Proactive Intervention - future demo, not yet built"
      />
      <Box x={xs4[3]} y={L0y} w={600 - xs4[3]} h={L0h}
        fill="#F8FAFC" stroke="#F0F4F5" strokeDash="5 3"
        label="Attribution Model" sub="Coming soon"
        labelColor="#768692" subColor="#CBD5E1"
        tooltip="UC4 - Attribution Model - future demo, not yet built"
      />

      <Arrow x={CX} y1={L0b} y2={L1y} />

      {/* ── LAYER 1 - Three signal types ──────── */}
      <text x={CX} y={L1y - 6} textAnchor="middle" fontSize={9} fill="#212B32" fontWeight={500} letterSpacing={1}>
        THREE SIGNAL TYPES
      </text>
      <Box x={xs3[0]} y={L1y} w={bw3} h={L1h}
        fill="#E8F1FB" stroke="#085040"
        label="Real-time logistics" sub="GPS · temp sensor"
        labelColor="#085040" subColor="#085040"
        tooltip="Signal 1: Cell-signal GPS temperature tags, DPD/DHL courier position, drug condition data"
      />
      <Box x={xs3[1]} y={L1y} w={bw3} h={L1h}
        fill="#EEEDFB" stroke="#005EB8"
        label="Treatment scheduling" sub="Infusion window · urgency"
        labelColor="#3C3488" subColor="#005EB8"
        tooltip="Signal 2: Infusion window timing, clinical urgency score, patient treatment schedule"
      />
      <Box x={xs3[2]} y={L1y} w={600 - xs3[2]} h={L1h}
        fill="#E8F1FB" stroke="#005EB8"
        label="Delivery status" sub="Portal · email · ping"
        labelColor="#0C4478" subColor="#005EB8"
        tooltip="Signal 3: Supply chain portal, homecare nurse check-in ping, email/order data, event logs"
      />

      <FanIn xs={cx3} yFrom={L1b} yMid={L1b + 10} yTo={L2y} />

      {/* ── LAYER 2 - CPXO Agent ──────────────── */}
      <text x={CX} y={L2y - 6} textAnchor="middle" fontSize={9} fill="#212B32" fontWeight={500} letterSpacing={1}>
        CPXO AGENT
      </text>
      <g style={{ cursor: "pointer" }}>
        <title>Chief Patient Experience Officer Agent - Top orchestrator - correlates all three signal types - scores severity - delegates to specialist agents - NEVER executes directly</title>
        <rect x={20} y={L2y} width={580} height={L2h} rx={8} fill="#EEEDFB" stroke="#005EB8" strokeWidth={0.75} />
        <text x={CX} y={L2y + L2h / 2 - 7} textAnchor="middle" fontSize={13} fontWeight={600} fill="#3C3488">
          Chief Patient Experience Officer Agent
        </text>
        <text x={CX} y={L2y + L2h / 2 + 11} textAnchor="middle" fontSize={10} fill="#005EB8">
          Top orchestrator · reads five signals · scores severity · delegates · never executes directly
        </text>
      </g>

      <FanOut xs={cx4} yFrom={L2b} yMid={L2b + 12} yTo={L3y} />

      {/* ── LAYER 3 - Four specialist agents ──── */}
      <text x={CX} y={L3y - 6} textAnchor="middle" fontSize={9} fill="#212B32" fontWeight={500} letterSpacing={1}>
        SPECIALIST AGENTS
      </text>
      <Box x={xs4[0]} y={L3y} w={bw4} h={L3h} fill="#E8F1FB" stroke="#085040" label="Delivery Ops" sub="Detects delay" labelColor="#085040" subColor="#085040" tooltip="Delivery Ops agent - detects courier delay, maps live position, confirms exception from logistics data" />
      <Box x={xs4[1]} y={L3y} w={bw4} h={L3h} fill="#FDECEA" stroke="#005EB8" label="Clinical Risk" sub="Scores severity" labelColor="#712B13" subColor="#005EB8" tooltip="Clinical Risk agent - assesses patient safety severity, flags life-critical PNH/aHUS/HPP threshold breaches" />
      <Box x={xs4[2]} y={L3y} w={bw4} h={L3h} fill="#FEF9E7" stroke="#085040" label="Compliance" sub="Logs exception" labelColor="#633806" subColor="#085040" tooltip="Compliance agent - logs exception to Reasoning Ledger, generates MHRA pharmacovigilance flag, GDPR-compliant audit preparation" />
      <Box x={xs4[3]} y={L3y} w={600 - xs4[3]} h={L3h} fill="#E8F1FB" stroke="#005EB8" label="Engagement" sub="Alerts team" labelColor="#0C4478" subColor="#005EB8" tooltip="Engagement agent - drafts homecare nurse alerts, notifies Alexion ops team, queues pharmacy notifications" />

      <FanIn xs={cx4} yFrom={L3b} yMid={L3b + 10} yTo={L4y} />

      {/* ── LAYER 4 - Automated action engine ─── */}
      <text x={CX} y={L4y - 6} textAnchor="middle" fontSize={9} fill="#212B32" fontWeight={500} letterSpacing={1}>
        AUTOMATED ACTION ENGINE
      </text>
      <g style={{ cursor: "pointer" }}>
        <title>Automated Action Engine - No human gate - Low: monitor · Medium: expedite courier · Life-critical: emergency dispatch fires immediately - policy-matched</title>
        <rect x={20} y={L4y} width={580} height={L4h} rx={8} fill="#FDECEA" stroke="#005EB8" strokeWidth={0.75} />
        <text x={CX} y={L4y + L4h / 2 - 7} textAnchor="middle" fontSize={13} fontWeight={600} fill="#712B13">
          Automated action engine - no human gate
        </text>
        <text x={CX} y={L4y + L4h / 2 + 11} textAnchor="middle" fontSize={10} fill="#005EB8">
          Low: monitor · Medium: expedite courier · Life-critical: emergency dispatch
        </text>
      </g>

      <Arrow x={CX} y1={L4b} y2={L5y} />

      {/* ── LAYER 5 - Five data sources ───────── */}
      <text x={CX} y={L5y - 6} textAnchor="middle" fontSize={9} fill="#212B32" fontWeight={500} letterSpacing={1}>
        ACTIVE DATA LAYER - FIVE SOURCES
      </text>
      {[
        { label: "Cell-signal tags",      sub: "GPS · temp" },
        { label: "Homecare check-ins",    sub: "Nurse ping" },
        { label: "Delivery event logs",   sub: "Checkpoint" },
        { label: "Supply chain portal",   sub: "Stale flag" },
        { label: "Email and order data",  sub: "Weak signal" },
      ].map((d, i) => (
        <Box
          key={d.label}
          x={xs5[i]} y={L5y} w={i < 4 ? bw5 : 600 - xs5[4]} h={L5h}
          fill="#E8F1FB" stroke="#005EB8"
          label={d.label} sub={d.sub}
          labelColor="#0C4478" subColor="#005EB8"
          tooltip={d.label}
        />
      ))}

      <FanIn xs={cx5} yFrom={L5b} yMid={L5b + 10} yTo={cylTopY + cylRY} />

      {/* ── LAYER 6 - Reasoning Ledger cylinder ── */}
      <text x={CX} y={cylTopY - 6} textAnchor="middle" fontSize={9} fill="#212B32" fontWeight={500} letterSpacing={1}>
        REASONING LEDGER
      </text>
      <DatabaseCylinder cx={CX} topY={cylTopY} r={130} ry={cylRY} bodyH={cylBodyH} />
      <text x={CX} y={cylTopY + cylRY + cylBodyH / 2 - 6} textAnchor="middle" fontSize={13} fontWeight={600} fill="#FFFFFF">
        Reasoning ledger
      </text>
      <text x={CX} y={cylTopY + cylRY + cylBodyH / 2 + 12} textAnchor="middle" fontSize={10} fill="rgba(255,255,255,0.7)">
        Append-only · tamper-proof · GDPR-ready · regulator-facing
      </text>

      <Arrow x={CX} y1={cylBottom} y2={L7y} />

      {/* ── LAYER 7 - Compliance output ───────── */}
      <g style={{ cursor: "pointer" }}>
        <title>Compliance and Audit Output - SOC 2 · ISO 27001 · HIPAA · GDPR · pharma regulator reports · OTD dashboard · MHRA pharmacovigilance flags</title>
        <rect x={20} y={L7y} width={580} height={L7h} rx={8} fill="#E8F1FB" stroke="#085040" strokeWidth={0.75} />
        <text x={CX} y={L7y + L7h / 2 - 6} textAnchor="middle" fontSize={13} fontWeight={600} fill="#085040">
          Compliance and audit output
        </text>
        <text x={CX} y={L7y + L7h / 2 + 12} textAnchor="middle" fontSize={10} fill="#085040">
          SOC 2 · ISO 27001 · HIPAA · GDPR · pharma regulator reports · OTD dashboard
        </text>
      </g>

      {/* ── DASHED SEPARATOR ──────────────────── */}
      <line x1={20} y1={dashY} x2={600} y2={dashY} stroke="#F0F4F5" strokeWidth={0.75} strokeDasharray="6 4" />
      <text x={CX} y={dashY + 12} textAnchor="middle" fontSize={9} fill="#212B32">
        Human involvement - post-action only
      </text>

      {/* ── LAYER 8 - Human governance ────────── */}
      <g style={{ cursor: "pointer" }}>
        <title>Human Board - post-action only - review ledger, update detection thresholds, sign off exception reports, governance oversight</title>
        <rect x={20} y={L8y} width={580} height={L8h} rx={8} fill="#F8FAFC" stroke="#F0F4F5" strokeWidth={0.75} strokeDasharray="5 3" />
        <text x={CX} y={L8y + L8h / 2 - 6} textAnchor="middle" fontSize={12} fontWeight={500} fill="#212B32">
          Human board - review · audit · governance · policy updates
        </text>
        <text x={CX} y={L8y + L8h / 2 + 11} textAnchor="middle" fontSize={10} fill="#212B32">
          Post-action only · no operational authority
        </text>
      </g>
    </svg>
  );
}
