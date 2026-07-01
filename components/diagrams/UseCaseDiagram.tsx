"use client";

const CX = 310;

function Arrow({ x, y1, y2 }: { x: number; y1: number; y2: number }) {
  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={y2 - 7} stroke="#F0F4F5" strokeWidth={0.75} />
      <polygon points={`${x - 4},${y2 - 7} ${x + 4},${y2 - 7} ${x},${y2}`} fill="#F0F4F5" />
    </g>
  );
}

function FanIn({ xs, yFrom, yMid, yTo, cx = CX }: { xs: number[]; yFrom: number; yMid: number; yTo: number; cx?: number }) {
  return (
    <g stroke="#F0F4F5" strokeWidth={0.75} fill="none">
      {xs.map((x) => (
        <polyline key={x} points={`${x},${yFrom} ${x},${yMid} ${cx},${yMid} ${cx},${yTo - 7}`} />
      ))}
      <polygon points={`${cx - 4},${yTo - 7} ${cx + 4},${yTo - 7} ${cx},${yTo}`} fill="#F0F4F5" />
    </g>
  );
}

function FanOut({ xs, yFrom, yMid, yTo, cx = CX }: { xs: number[]; yFrom: number; yMid: number; yTo: number; cx?: number }) {
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

function DatabaseCylinder({ cx, topY, r = 128, ry = 18, bodyH = 80 }: { cx: number; topY: number; r?: number; ry?: number; bodyH?: number }) {
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

export default function UseCaseDiagram() {
  const bw3 = 185;
  const xs3 = [20, 217, 415];
  const cx3 = xs3.map((x) => x + bw3 / 2);

  // Y positions
  const TIy = 10;  const TIh = 62;  const TIb = TIy + TIh;
  const SGy = 100; const SGh = 90;  const SGb = SGy + SGh;
  const NHy = 215; const NHh = 58;  const NHb = NHy + NHh;
  const CPy = 302; const CPh = 68;  const CPb = CPy + CPh;
  const SVy = 398; const SVh = 68;  const SVb = SVy + SVh;
  const cylTopY = SVb + 22; const cylRY = 18; const cylBodyH = 78;
  const cylBotEY = cylTopY + cylRY + cylBodyH;
  const cylBottom = cylBotEY + cylRY;
  const OTy = cylBottom + 22; const OTh = 68;  const OTb = OTy + OTh;
  const dashY = OTb + 22;
  const HUy  = dashY + 20;  const HUh = 52;
  const totalH = HUy + HUh + 16;

  return (
    <svg viewBox={`0 0 620 ${totalH}`} width="100%" style={{ fontFamily: "system-ui, sans-serif" }}>

      {/* TITLE BOX */}
      <g style={{ cursor: "pointer" }}>
        <title>Silent Delivery Delay Detection - Phase 1 LIVE - use case implementation scope</title>
        <rect x={20} y={TIy} width={580} height={TIh} rx={8} fill="#E8F1FB" stroke="#085040" strokeWidth={0.75} />
        <text x={CX} y={TIy + TIh / 2 - 7} textAnchor="middle" fontSize={14} fontWeight={600} fill="#085040">
          Silent Delivery Delay Detection
        </text>
        <text x={CX} y={TIy + TIh / 2 + 11} textAnchor="middle" fontSize={11} fill="#085040">
          Phase 1 LIVE · "Missed. Silent. Never Flagged."
        </text>
      </g>
      <rect x={20} y={TIy} width={62} height={18} rx={4} fill="#085040" />
      <text x={51} y={TIy + 13} textAnchor="middle" fontSize={10} fontWeight={700} fill="#fff">LIVE</text>

      <FanOut xs={cx3} yFrom={TIb} yMid={TIb + 12} yTo={SGy} />

      {/* THREE SIGNAL COLUMNS */}
      <text x={CX} y={SGy - 6} textAnchor="middle" fontSize={9} fill="#212B32" letterSpacing={1} fontWeight={500}>THREE SIGNAL TYPES</text>
      <g style={{ cursor: "pointer" }}>
        <title>Signal 1 - Real-time logistics: cell-signal GPS tags, DPD/DHL courier position, drug temperature</title>
        <rect x={xs3[0]} y={SGy} width={bw3} height={SGh} rx={6} fill="#E8F1FB" stroke="#085040" strokeWidth={0.75} />
        <text x={cx3[0]} y={SGy + 24} textAnchor="middle" fontSize={12} fontWeight={500} fill="#085040">Real-time logistics</text>
        <text x={cx3[0]} y={SGy + 42} textAnchor="middle" fontSize={10} fill="#085040">GPS tag · temp sensor</text>
        <text x={cx3[0]} y={SGy + 57} textAnchor="middle" fontSize={10} fill="#085040">Courier position live</text>
      </g>
      <g style={{ cursor: "pointer" }}>
        <title>Signal 2 - Treatment scheduling: infusion window timing, clinical urgency score, patient treatment schedule</title>
        <rect x={xs3[1]} y={SGy} width={bw3} height={SGh} rx={6} fill="#EEEDFB" stroke="#005EB8" strokeWidth={0.75} />
        <text x={cx3[1]} y={SGy + 24} textAnchor="middle" fontSize={12} fontWeight={500} fill="#3C3488">Treatment scheduling</text>
        <text x={cx3[1]} y={SGy + 42} textAnchor="middle" fontSize={10} fill="#005EB8">Infusion window</text>
        <text x={cx3[1]} y={SGy + 57} textAnchor="middle" fontSize={10} fill="#005EB8">Clinical urgency score</text>
      </g>
      <g style={{ cursor: "pointer" }}>
        <title>Signal 3 - Delivery status: supply chain portal stale timestamp, homecare nurse check-in, email weak signal, missed checkpoint</title>
        <rect x={xs3[2]} y={SGy} width={600 - xs3[2]} height={SGh} rx={6} fill="#E8F1FB" stroke="#005EB8" strokeWidth={0.75} />
        <text x={cx3[2]} y={SGy + 24} textAnchor="middle" fontSize={12} fontWeight={500} fill="#0C4478">Delivery status</text>
        <text x={cx3[2]} y={SGy + 42} textAnchor="middle" fontSize={10} fill="#005EB8">Portal · email</text>
        <text x={cx3[2]} y={SGy + 57} textAnchor="middle" fontSize={10} fill="#005EB8">Homecare ping</text>
      </g>

      <FanIn xs={cx3} yFrom={SGb} yMid={SGb + 10} yTo={NHy} />

      {/* NHS ABSORPTION LAYER (bypassed) */}
      <g style={{ cursor: "pointer" }}>
        <title>NHS Absorption - without NavECC: NHS staff absorb delays silently, rescheduling infusions without ever reporting to Arvion. NavECC detects BEFORE this layer can silence the signal.</title>
        <rect x={20} y={NHy} width={580} height={NHh} rx={8} fill="#F8FAFC" stroke="#F0F4F5" strokeWidth={0.75} strokeDasharray="5 3" />
        <text x={CX} y={NHy + NHh / 2 - 7} textAnchor="middle" fontSize={12} fontWeight={500} fill="#212B32">NHS staff absorb silently - never reported to Arvion</text>
        <text x={CX} y={NHy + NHh / 2 + 11} textAnchor="middle" fontSize={10} fill="#F0F4F5">Shield effect · gratefulness factor · institutional inertia</text>
      </g>
      <text x={CX} y={NHb + 12} textAnchor="middle" fontSize={9} fill="#005EB8" fontWeight={500}>
        NavECC detects BEFORE this layer silences the signal
      </text>

      <Arrow x={CX} y1={NHb + 18} y2={CPy} />

      {/* CPXO DETECTION ENGINE */}
      <g style={{ cursor: "pointer" }}>
        <title>CPXO Detection Engine: correlates all three signal types, cross-references treatment schedule, scores severity before NHS absorption occurs</title>
        <rect x={20} y={CPy} width={580} height={CPh} rx={8} fill="#EEEDFB" stroke="#005EB8" strokeWidth={0.75} />
        <text x={CX} y={CPy + CPh / 2 - 7} textAnchor="middle" fontSize={13} fontWeight={600} fill="#3C3488">CPXO detection engine</text>
        <text x={CX} y={CPy + CPh / 2 + 11} textAnchor="middle" fontSize={10} fill="#005EB8">Correlates three signals · scores severity · exception confirmed at 08:47</text>
      </g>

      <FanOut xs={cx3} yFrom={CPb} yMid={CPb + 12} yTo={SVy} />

      {/* THREE SEVERITY TIERS */}
      <text x={CX} y={SVy - 6} textAnchor="middle" fontSize={9} fill="#212B32" letterSpacing={1} fontWeight={500}>SEVERITY CLASSIFICATION</text>
      <g style={{ cursor: "pointer" }}>
        <title>Low severity: monitor and log only - no outbound action</title>
        <rect x={xs3[0]} y={SVy} width={bw3} height={SVh} rx={6} fill="#E8F1FB" stroke="#085040" strokeWidth={0.75} />
        <text x={cx3[0]} y={SVy + SVh / 2 - 6} textAnchor="middle" fontSize={12} fontWeight={500} fill="#085040">Low</text>
        <text x={cx3[0]} y={SVy + SVh / 2 + 10} textAnchor="middle" fontSize={10} fill="#085040">Monitor · log only</text>
      </g>
      <g style={{ cursor: "pointer" }}>
        <title>Medium severity: expedite existing courier, alert homecare team and Alexion ops</title>
        <rect x={xs3[1]} y={SVy} width={bw3} height={SVh} rx={6} fill="#FEF9E7" stroke="#085040" strokeWidth={0.75} />
        <text x={cx3[1]} y={SVy + SVh / 2 - 6} textAnchor="middle" fontSize={12} fontWeight={500} fill="#633806">Medium</text>
        <text x={cx3[1]} y={SVy + SVh / 2 + 10} textAnchor="middle" fontSize={10} fill="#085040">Expedite courier</text>
      </g>
      <g style={{ cursor: "pointer" }}>
        <title>Life-critical: emergency dispatch fires automatically - policy-matched - no human approval - immediate execution</title>
        <rect x={xs3[2]} y={SVy} width={600 - xs3[2]} height={SVh} rx={6} fill="#FDECEA" stroke="#005EB8" strokeWidth={0.75} />
        <text x={cx3[2]} y={SVy + SVh / 2 - 6} textAnchor="middle" fontSize={12} fontWeight={500} fill="#712B13">Life-critical</text>
        <text x={cx3[2]} y={SVy + SVh / 2 + 10} textAnchor="middle" fontSize={10} fill="#005EB8">Emergency dispatch · auto</text>
      </g>

      <FanIn xs={cx3} yFrom={SVb} yMid={SVb + 10} yTo={cylTopY + cylRY} />

      {/* REASONING LEDGER - DATABASE CYLINDER */}
      <text x={CX} y={cylTopY - 6} textAnchor="middle" fontSize={9} fill="#212B32" letterSpacing={1} fontWeight={500}>REASONING LEDGER</text>
      <DatabaseCylinder cx={CX} topY={cylTopY} r={128} ry={cylRY} bodyH={cylBodyH} />
      <text x={CX} y={cylTopY + cylRY + cylBodyH / 2 - 6} textAnchor="middle" fontSize={13} fontWeight={600} fill="#FFFFFF">Reasoning ledger</text>
      <text x={CX} y={cylTopY + cylRY + cylBodyH / 2 + 12} textAnchor="middle" fontSize={10} fill="rgba(255,255,255,0.7)">Append-only · tamper-proof · GDPR-ready</text>

      <FanOut xs={cx3} yFrom={cylBottom} yMid={cylBottom + 14} yTo={OTy} />

      {/* THREE OUTCOME BOXES */}
      <text x={CX} y={OTy - 6} textAnchor="middle" fontSize={9} fill="#212B32" letterSpacing={1} fontWeight={500}>THREE OUTCOMES</text>
      <g style={{ cursor: "pointer" }}>
        <title>Treatment continuity: right drug delivered at right time, infusion not missed</title>
        <rect x={xs3[0]} y={OTy} width={bw3} height={OTh} rx={6} fill="#E8F1FB" stroke="#085040" strokeWidth={0.75} />
        <text x={cx3[0]} y={OTy + OTh / 2 - 6} textAnchor="middle" fontSize={12} fontWeight={500} fill="#085040">Treatment continuity</text>
        <text x={cx3[0]} y={OTy + OTh / 2 + 10} textAnchor="middle" fontSize={10} fill="#085040">Right drug · right time</text>
      </g>
      <g style={{ cursor: "pointer" }}>
        <title>Hidden disruptions eliminated: no longer missed, no longer silent, now flagged and resolved</title>
        <rect x={xs3[1]} y={OTy} width={bw3} height={OTh} rx={6} fill="#EEEDFB" stroke="#005EB8" strokeWidth={0.75} />
        <text x={cx3[1]} y={OTy + OTh / 2 - 6} textAnchor="middle" fontSize={12} fontWeight={500} fill="#3C3488">Hidden disruptions</text>
        <text x={cx3[1]} y={OTy + OTh / 2 + 10} textAnchor="middle" fontSize={10} fill="#005EB8">Eliminated · not absorbed</text>
      </g>
      <g style={{ cursor: "pointer" }}>
        <title>Proactive intervention: exception detected before NHS staff absorb it, before any complaint is needed</title>
        <rect x={xs3[2]} y={OTy} width={600 - xs3[2]} height={OTh} rx={6} fill="#FEF9E7" stroke="#085040" strokeWidth={0.75} />
        <text x={cx3[2]} y={OTy + OTh / 2 - 6} textAnchor="middle" fontSize={12} fontWeight={500} fill="#633806">Proactive intervention</text>
        <text x={cx3[2]} y={OTy + OTh / 2 + 10} textAnchor="middle" fontSize={10} fill="#085040">Before NHS absorbs it</text>
      </g>

      {/* DASHED SEPARATOR */}
      <line x1={20} y1={dashY} x2={600} y2={dashY} stroke="#F0F4F5" strokeWidth={0.75} strokeDasharray="6 4" />
      <text x={CX} y={dashY + 12} textAnchor="middle" fontSize={9} fill="#212B32">Human involvement - post-action only</text>

      {/* HUMAN POST-ACTION REVIEW */}
      <g style={{ cursor: "pointer" }}>
        <title>Human Board: reviews Reasoning Ledger, updates detection thresholds, signs off exception reports - post-action only</title>
        <rect x={20} y={HUy} width={580} height={HUh} rx={8} fill="#F8FAFC" stroke="#F0F4F5" strokeWidth={0.75} strokeDasharray="5 3" />
        <text x={CX} y={HUy + HUh / 2 - 6} textAnchor="middle" fontSize={12} fontWeight={500} fill="#212B32">Human board - review · audit · governance · policy updates</text>
        <text x={CX} y={HUy + HUh / 2 + 11} textAnchor="middle" fontSize={10} fill="#212B32">Post-action only · no operational authority</text>
      </g>
    </svg>
  );
}
