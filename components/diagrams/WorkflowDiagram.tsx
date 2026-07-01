"use client";

const CX = 315;

function Arrow({ x, y1, y2 }: { x: number; y1: number; y2: number }) {
  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={y2 - 7} stroke="#F0F4F5" strokeWidth={0.75} />
      <polygon points={`${x - 4},${y2 - 7} ${x + 4},${y2 - 7} ${x},${y2}`} fill="#F0F4F5" />
    </g>
  );
}

function FanIn({
  xs, yFrom, yMid, yTo, cx = CX,
}: { xs: number[]; yFrom: number; yMid: number; yTo: number; cx?: number }) {
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
  xs, yFrom, yMid, yTo, cx = CX,
}: { xs: number[]; yFrom: number; yMid: number; yTo: number; cx?: number }) {
  return (
    <g stroke="#F0F4F5" strokeWidth={0.75} fill="none">
      <line x1={cx} y1={yFrom} x2={cx} y2={yMid} />
      {xs.map((x) => (
        <polyline key={x} points={`${cx},${yMid} ${x},${yMid} ${x},${yTo - 7}`} />
      ))}
      {xs.map((x) => (
        <polygon key={x + "a"} points={`${x - 4},${yTo - 7} ${x + 4},${yTo - 7} ${x},${yTo}`} fill="#F0F4F5" />
      ))}
    </g>
  );
}

function DatabaseCylinder({ cx, topY, r = 130, ry = 18, bodyH = 80 }: {
  cx: number; topY: number; r?: number; ry?: number; bodyH?: number;
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

export default function WorkflowDiagram() {
  const bw3 = 183;
  const bw4 = 135;
  const xs3 = [20, 215, 412];
  const xs4 = [20, 163, 307, 450];
  const cx3 = xs3.map((x) => x + bw3 / 2);
  const cx4 = xs4.map((x) => x + bw4 / 2);

  // Step Y positions
  const S1y = 20;  const S1h = 56;  const S1b = S1y + S1h;
  const S2y = 100; const S2h = 70;  const S2b = S2y + S2h;
  const S3y = 200; const S3h = 68;  const S3b = S3y + S3h;
  const S4y = 300; const S4h = 70;  const S4b = S4y + S4h;
  const S5y = 402; const S5h = 70;  const S5b = S5y + S5h;
  const S6y = 504; const S6h = 62;  const S6b = S6y + S6h;
  // Cylinder
  const cylTopY = S6b + 22; const cylRY = 18; const cylBodyH = 80;
  const cylBotEY = cylTopY + cylRY + cylBodyH;
  const cylBottom = cylBotEY + cylRY;
  const S8y = cylBottom + 22; const S8h = 58; const S8b = S8y + S8h;
  const dashY = S8b + 22;
  const S9y  = dashY + 20; const S9h = 52;
  const totalH = S9y + S9h + 16;

  return (
    <svg viewBox={`0 0 640 ${totalH}`} width="100%" style={{ fontFamily: "system-ui, sans-serif" }}>

      {/* STEP 1 - Heartbeat */}
      <g style={{ cursor: "pointer" }}>
        <title>Step 1: CPXO agent wakes on heartbeat - new scan cycle begins</title>
        <rect x={160} y={S1y} width={310} height={S1h} rx={8} fill="#F4F7FA" stroke="#F0F4F5" strokeWidth={0.75} />
        <text x={CX} y={S1y + S1h / 2 - 6} textAnchor="middle" fontSize={13} fontWeight={500} fill="#212B32">Heartbeat fires</text>
        <text x={CX} y={S1y + S1h / 2 + 10} textAnchor="middle" fontSize={10} fill="#212B32">CPXO agent wakes · new scan cycle begins</text>
      </g>

      <Arrow x={CX} y1={S1b} y2={S2y} />

      {/* STEP 2 - Three signal types */}
      <text x={CX} y={S2y - 6} textAnchor="middle" fontSize={9} fill="#212B32" letterSpacing={1} fontWeight={500}>THREE SIGNAL TYPES READ</text>
      <g style={{ cursor: "pointer" }}>
        <title>Real-time logistics: GPS tag · temp sensor · courier position</title>
        <rect x={xs3[0]} y={S2y} width={bw3} height={S2h} rx={6} fill="#E8F1FB" stroke="#085040" strokeWidth={0.75} />
        <text x={xs3[0] + bw3 / 2} y={S2y + S2h / 2 - 6} textAnchor="middle" fontSize={12} fontWeight={500} fill="#085040">Real-time logistics</text>
        <text x={xs3[0] + bw3 / 2} y={S2y + S2h / 2 + 10} textAnchor="middle" fontSize={10} fill="#085040">GPS · temp sensor</text>
      </g>
      <g style={{ cursor: "pointer" }}>
        <title>Treatment scheduling: infusion window · clinical urgency score</title>
        <rect x={xs3[1]} y={S2y} width={bw3} height={S2h} rx={6} fill="#EEEDFB" stroke="#005EB8" strokeWidth={0.75} />
        <text x={xs3[1] + bw3 / 2} y={S2y + S2h / 2 - 6} textAnchor="middle" fontSize={12} fontWeight={500} fill="#3C3488">Treatment scheduling</text>
        <text x={xs3[1] + bw3 / 2} y={S2y + S2h / 2 + 10} textAnchor="middle" fontSize={10} fill="#005EB8">Infusion window · urgency</text>
      </g>
      <g style={{ cursor: "pointer" }}>
        <title>Delivery status: supply chain portal · homecare ping · email · event logs</title>
        <rect x={xs3[2]} y={S2y} width={600 - xs3[2]} height={S2h} rx={6} fill="#E8F1FB" stroke="#005EB8" strokeWidth={0.75} />
        <text x={xs3[2] + (600 - xs3[2]) / 2} y={S2y + S2h / 2 - 6} textAnchor="middle" fontSize={12} fontWeight={500} fill="#0C4478">Delivery status</text>
        <text x={xs3[2] + (600 - xs3[2]) / 2} y={S2y + S2h / 2 + 10} textAnchor="middle" fontSize={10} fill="#005EB8">Portal · email · ping</text>
      </g>

      <FanIn xs={cx3} yFrom={S2b} yMid={S2b + 10} yTo={S3y} />

      {/* STEP 3 - CPXO detects + loop arrow */}
      <g style={{ cursor: "pointer" }}>
        <title>CPXO correlates all three signal types · cross-references treatment schedule · detects NHS absorption before it silences the signal · scores severity</title>
        <rect x={20} y={S3y} width={580} height={S3h} rx={8} fill="#EEEDFB" stroke="#005EB8" strokeWidth={0.75} />
        <text x={CX} y={S3y + S3h / 2 - 7} textAnchor="middle" fontSize={13} fontWeight={600} fill="#3C3488">CPXO correlates signals · cross-references treatment schedule</text>
        <text x={CX} y={S3y + S3h / 2 + 11} textAnchor="middle" fontSize={10} fill="#005EB8">Detects before NHS absorption silences the signal · scores severity</text>
      </g>
      {/* "No issue → sleep" loop */}
      <path
        d={`M 600,${S3y + S3h / 2} L 628,${S3y + S3h / 2} L 628,${S1y + S1h / 2} L 471,${S1y + S1h / 2}`}
        fill="none" stroke="#F0F4F5" strokeWidth={0.75} strokeDasharray="4 3"
      />
      <polygon points={`471,${S1y + S1h / 2 - 4} 471,${S1y + S1h / 2 + 4} 463,${S1y + S1h / 2}`} fill="#F0F4F5" />
      <text x={636} y={S3y + S3h / 2 - 16} textAnchor="middle" fontSize={9} fill="#212B32">No issue</text>
      <text x={636} y={S3y + S3h / 2}      textAnchor="middle" fontSize={9} fill="#212B32">→ sleep</text>

      <Arrow x={CX} y1={S3b} y2={S4y} />
      <text x={CX + 10} y={(S3b + S4y) / 2 + 4} fontSize={9} fill="#212B32">Exception confirmed</text>

      {/* STEP 4 - Severity tiers */}
      <text x={CX} y={S4y - 6} textAnchor="middle" fontSize={9} fill="#212B32" letterSpacing={1} fontWeight={500}>CLASSIFIED BY SEVERITY</text>
      <g style={{ cursor: "pointer" }}>
        <title>Low severity: monitor and log only</title>
        <rect x={xs3[0]} y={S4y} width={bw3} height={S4h} rx={6} fill="#E8F1FB" stroke="#085040" strokeWidth={0.75} />
        <text x={xs3[0] + bw3 / 2} y={S4y + S4h / 2 - 6} textAnchor="middle" fontSize={12} fontWeight={500} fill="#085040">Low</text>
        <text x={xs3[0] + bw3 / 2} y={S4y + S4h / 2 + 10} textAnchor="middle" fontSize={10} fill="#085040">Monitor · log only</text>
      </g>
      <g style={{ cursor: "pointer" }}>
        <title>Medium severity: expedite existing courier + alert homecare team</title>
        <rect x={xs3[1]} y={S4y} width={bw3} height={S4h} rx={6} fill="#FEF9E7" stroke="#085040" strokeWidth={0.75} />
        <text x={xs3[1] + bw3 / 2} y={S4y + S4h / 2 - 6} textAnchor="middle" fontSize={12} fontWeight={500} fill="#633806">Medium</text>
        <text x={xs3[1] + bw3 / 2} y={S4y + S4h / 2 + 10} textAnchor="middle" fontSize={10} fill="#085040">Expedite courier · alert</text>
      </g>
      <g style={{ cursor: "pointer" }}>
        <title>Life-critical: emergency dispatch fires automatically - policy-matched - no approval required</title>
        <rect x={xs3[2]} y={S4y} width={600 - xs3[2]} height={S4h} rx={6} fill="#FDECEA" stroke="#005EB8" strokeWidth={0.75} />
        <text x={xs3[2] + (600 - xs3[2]) / 2} y={S4y + S4h / 2 - 6} textAnchor="middle" fontSize={12} fontWeight={500} fill="#712B13">Life-critical</text>
        <text x={xs3[2] + (600 - xs3[2]) / 2} y={S4y + S4h / 2 + 10} textAnchor="middle" fontSize={10} fill="#005EB8">Emergency dispatch · auto</text>
      </g>

      <FanIn xs={cx3} yFrom={S4b} yMid={S4b + 10} yTo={S5y} />

      {/* STEP 5 - Four agents parallel */}
      <text x={CX} y={S5y - 6} textAnchor="middle" fontSize={9} fill="#212B32" letterSpacing={1} fontWeight={500}>FOUR AGENTS RUN IN PARALLEL</text>
      <g style={{ cursor: "pointer" }}>
        <title>Delivery Ops: confirms delay, maps courier live position</title>
        <rect x={xs4[0]} y={S5y} width={bw4} height={S5h} rx={6} fill="#E8F1FB" stroke="#085040" strokeWidth={0.75} />
        <text x={xs4[0] + bw4 / 2} y={S5y + S5h / 2 - 6} textAnchor="middle" fontSize={11} fontWeight={500} fill="#085040">Delivery Ops</text>
        <text x={xs4[0] + bw4 / 2} y={S5y + S5h / 2 + 10} textAnchor="middle" fontSize={10} fill="#085040">Maps courier</text>
      </g>
      <g style={{ cursor: "pointer" }}>
        <title>Clinical Risk: scores patient safety severity, flags PNH/aHUS/HPP threshold breaches</title>
        <rect x={xs4[1]} y={S5y} width={bw4} height={S5h} rx={6} fill="#FDECEA" stroke="#005EB8" strokeWidth={0.75} />
        <text x={xs4[1] + bw4 / 2} y={S5y + S5h / 2 - 6} textAnchor="middle" fontSize={11} fontWeight={500} fill="#712B13">Clinical Risk</text>
        <text x={xs4[1] + bw4 / 2} y={S5y + S5h / 2 + 10} textAnchor="middle" fontSize={10} fill="#005EB8">Patient safety</text>
      </g>
      <g style={{ cursor: "pointer" }}>
        <title>Compliance: appends exception to Reasoning Ledger, generates MHRA PV flag</title>
        <rect x={xs4[2]} y={S5y} width={bw4} height={S5h} rx={6} fill="#FEF9E7" stroke="#085040" strokeWidth={0.75} />
        <text x={xs4[2] + bw4 / 2} y={S5y + S5h / 2 - 6} textAnchor="middle" fontSize={11} fontWeight={500} fill="#633806">Compliance</text>
        <text x={xs4[2] + bw4 / 2} y={S5y + S5h / 2 + 10} textAnchor="middle" fontSize={10} fill="#085040">Logs exception</text>
      </g>
      <g style={{ cursor: "pointer" }}>
        <title>Engagement: drafts homecare nurse alerts, notifies Alexion ops team</title>
        <rect x={xs4[3]} y={S5y} width={600 - xs4[3]} height={S5h} rx={6} fill="#E8F1FB" stroke="#005EB8" strokeWidth={0.75} />
        <text x={xs4[3] + (600 - xs4[3]) / 2} y={S5y + S5h / 2 - 6} textAnchor="middle" fontSize={11} fontWeight={500} fill="#0C4478">Engagement</text>
        <text x={xs4[3] + (600 - xs4[3]) / 2} y={S5y + S5h / 2 + 10} textAnchor="middle" fontSize={10} fill="#005EB8">Alerts team</text>
      </g>

      <FanIn xs={cx4} yFrom={S5b} yMid={S5b + 10} yTo={S6y} />

      {/* STEP 6 - Automated action */}
      <g style={{ cursor: "pointer" }}>
        <title>Automated Action: policy-matched · expedite courier or emergency dispatch · fires immediately - no human gate</title>
        <rect x={20} y={S6y} width={580} height={S6h} rx={8} fill="#FDECEA" stroke="#005EB8" strokeWidth={0.75} />
        <text x={CX} y={S6y + S6h / 2 - 7} textAnchor="middle" fontSize={13} fontWeight={600} fill="#712B13">Automated action executes - no human gate</text>
        <text x={CX} y={S6y + S6h / 2 + 11} textAnchor="middle" fontSize={10} fill="#005EB8">Policy-matched · expedite or emergency dispatch · action fires immediately</text>
      </g>

      <Arrow x={CX} y1={S6b} y2={cylTopY + cylRY} />

      {/* STEP 7 - Reasoning Ledger (DATABASE CYLINDER) */}
      <text x={CX} y={cylTopY - 6} textAnchor="middle" fontSize={9} fill="#212B32" letterSpacing={1} fontWeight={500}>REASONING LEDGER</text>
      <DatabaseCylinder cx={CX} topY={cylTopY} r={128} ry={cylRY} bodyH={cylBodyH} />
      <text x={CX} y={cylTopY + cylRY + cylBodyH / 2 - 6} textAnchor="middle" fontSize={13} fontWeight={600} fill="#FFFFFF">Reasoning ledger</text>
      <text x={CX} y={cylTopY + cylRY + cylBodyH / 2 + 12} textAnchor="middle" fontSize={10} fill="rgba(255,255,255,0.7)">Append-only · tamper-proof · GDPR-ready</text>

      <Arrow x={CX} y1={cylBotEY + cylRY} y2={S8y} />

      {/* STEP 8 - Resolution */}
      <g style={{ cursor: "pointer" }}>
        <title>Exception resolved - treatment continuity restored - patient safe - OTD updated - hidden disruption eliminated - audit trail complete</title>
        <rect x={20} y={S8y} width={580} height={S8h} rx={8} fill="#E8F1FB" stroke="#085040" strokeWidth={0.75} />
        <text x={CX} y={S8y + S8h / 2 - 7} textAnchor="middle" fontSize={13} fontWeight={600} fill="#085040">Exception resolved · treatment continuity restored</text>
        <text x={CX} y={S8y + S8h / 2 + 11} textAnchor="middle" fontSize={10} fill="#085040">Patient safe · OTD updated · hidden disruption eliminated · audit trail complete</text>
      </g>

      {/* DASHED SEPARATOR */}
      <line x1={20} y1={dashY} x2={600} y2={dashY} stroke="#F0F4F5" strokeWidth={0.75} strokeDasharray="6 4" />
      <text x={CX} y={dashY + 12} textAnchor="middle" fontSize={9} fill="#212B32">Human involvement - post-action only</text>

      {/* STEP 9 - Human post-action review */}
      <g style={{ cursor: "pointer" }}>
        <title>Human Board: reviews ledger · updates detection thresholds · signs off exception reports - post-action only</title>
        <rect x={20} y={S9y} width={580} height={S9h} rx={8} fill="#F8FAFC" stroke="#F0F4F5" strokeWidth={0.75} strokeDasharray="5 3" />
        <text x={CX} y={S9y + S9h / 2 - 6} textAnchor="middle" fontSize={12} fontWeight={500} fill="#212B32">Human board - review · audit · governance · policy updates</text>
        <text x={CX} y={S9y + S9h / 2 + 11} textAnchor="middle" fontSize={10} fill="#212B32">Reviews ledger · updates detection thresholds · signs off exception reports</text>
      </g>
    </svg>
  );
}
