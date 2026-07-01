"use client";

interface Segment {
  color: string;
  pct: number;
  key: string;
}

function StackedBar({ segments }: { segments: Segment[] }) {
  return (
    <div>
      {/* Bar */}
      <div
        style={{
          display: "flex",
          height: 34,
          borderRadius: 5,
          overflow: "hidden",
          gap: 1,
        }}
      >
        {segments.map((seg) => (
          <div
            key={seg.key}
            style={{
              flex: seg.pct,
              minWidth: seg.pct < 0.5 ? 7 : undefined,
              backgroundColor: seg.color,
              display: "flex",
              alignItems: "center",
              paddingLeft: seg.pct > 5 ? 10 : 0,
            }}
          >
            {seg.pct > 5 && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#FFFFFF",
                  whiteSpace: "nowrap",
                }}
              >
                {seg.pct}%
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Segment labels below bar - only for non-green segments */}
      <div style={{ display: "flex", gap: 1, marginTop: 4 }}>
        {/* Spacer for green portion */}
        <div style={{ flex: segments[0].pct }} />
        {segments.slice(1).map((seg) => (
          <div
            key={seg.key + "-label"}
            style={{
              flex: seg.pct,
              minWidth: seg.pct < 0.5 ? 7 : undefined,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: seg.color === "#F0F4F5" ? "#212B32" : seg.color,
                whiteSpace: "nowrap",
              }}
            >
              {seg.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const legendItems = [
  { color: "#005EB8", label: "Courier / Traffic" },
  { color: "#005EB8", label: "Cold Chain" },
  { color: "#085040", label: "Hospital Receiving" },
  { color: "#085040", label: "Homecare Scheduling" },
];

export default function DelayBreakdownChart({
  headerRight = "1.3% of deliveries · last 30 days",
  showLegend = true,
}: {
  headerRight?: string;
  showLegend?: boolean;
}) {
  const baselineSegments: Segment[] = [
    { color: "#085040", pct: 98.7, key: "ontime" },
    { color: "#F0F4F5", pct: 1.3,  key: "unattributed" },
  ];

  const currentSegments: Segment[] = [
    { color: "#085040", pct: 98.7, key: "ontime" },
    { color: "#005EB8", pct: 0.8,  key: "courier" },
    { color: "#005EB8", pct: 0.2,  key: "coldchain" },
    { color: "#085040", pct: 0.2,  key: "hospital" },
    { color: "#085040", pct: 0.1,  key: "homecare" },
  ];

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #ebebeb",
        borderRadius: 10,
        padding: "20px 24px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
        }}
      >
        <div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#212B32",
            }}
          >
            Delivery performance breakdown
          </span>
          <p style={{ fontSize: 13, color: "#212B32", margin: "4px 0 0 0" }}>
            Baseline vs attributed root causes · silent delay rate
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#005EB8" }}>
            {headerRight}
          </span>
        </div>
      </div>

      {/* Rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Row 1 - Baseline */}
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{ width: 160, flexShrink: 0, paddingTop: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#005EB8" }}>
              Baseline -
            </span>
            <br />
            <span style={{ fontSize: 12, color: "#212B32" }}>
              unattributed
            </span>
          </div>
          <div style={{ flex: 1 }}>
            <StackedBar segments={baselineSegments} />
          </div>
        </div>

        {/* Row 2 - Current period */}
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{ width: 160, flexShrink: 0, paddingTop: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#005EB8" }}>
              Current period -
            </span>
            <br />
            <span style={{ fontSize: 12, color: "#212B32" }}>
              attributed
            </span>
          </div>
          <div style={{ flex: 1 }}>
            <StackedBar segments={currentSegments} />
          </div>
        </div>

      </div>

      {/* Legend - hidden when root cause cards serve as legend below */}
      {showLegend && (
        <div
          style={{
            borderTop: "1px solid #ebebeb",
            marginTop: 20,
            paddingTop: 14,
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          {legendItems.map((item) => (
            <div
              key={item.label}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  backgroundColor: item.color,
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 12, color: "#212B32" }}>{item.label}</span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                backgroundColor: "#085040",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 12, color: "#212B32" }}>On-time (98.7%)</span>
          </div>
        </div>
      )}
    </div>
  );
}
