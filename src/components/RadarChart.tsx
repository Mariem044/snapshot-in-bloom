type AxisValues = { guilt: number; denial: number; fight: number; hope: number };

// Display order around the chart: guilt top, fight right, hope bottom, denial left.
const ORDER: { key: keyof AxisValues; label: string }[] = [
  { key: "guilt", label: "Guilt" },
  { key: "fight", label: "Fight" },
  { key: "hope", label: "Hope" },
  { key: "denial", label: "Denial" },
];

const SIZE = 220;
const C = SIZE / 2;
const R = 76;

function point(axisIndex: number, value: number): [number, number] {
  const angle = -Math.PI / 2 + (axisIndex * Math.PI) / 2;
  const r = (Math.max(0, Math.min(100, value)) / 100) * R;
  return [C + r * Math.cos(angle), C + r * Math.sin(angle)];
}

function polygon(values: AxisValues): string {
  return ORDER.map((o, i) => point(i, values[o.key]).join(",")).join(" ");
}

export function RadarChart({ student, average }: { student: AxisValues; average: AxisValues | null }) {
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="mx-auto w-full max-w-64" role="img" aria-label="Trait radar chart">
      {/* grid rings */}
      {[25, 50, 75, 100].map((v) => (
        <polygon
          key={v}
          points={ORDER.map((_, i) => point(i, v).join(",")).join(" ")}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={v === 100 ? 1.2 : 0.6}
          opacity={0.7}
        />
      ))}
      {/* spokes */}
      {ORDER.map((_, i) => {
        const [x, y] = point(i, 100);
        return <line key={i} x1={C} y1={C} x2={x} y2={y} stroke="var(--color-border)" strokeWidth={0.6} opacity={0.6} />;
      })}
      {/* class average, faint */}
      {average && (
        <polygon
          points={polygon(average)}
          fill="color-mix(in oklab, var(--color-muted-foreground) 12%, transparent)"
          stroke="var(--color-muted-foreground)"
          strokeWidth={1}
          strokeDasharray="4 3"
          opacity={0.55}
        />
      )}
      {/* student shape */}
      <polygon
        points={polygon(student)}
        fill="color-mix(in oklab, var(--color-primary) 22%, transparent)"
        stroke="var(--color-primary)"
        strokeWidth={1.8}
        style={{ filter: "drop-shadow(0 0 6px color-mix(in oklab, var(--color-primary) 60%, transparent))" }}
      />
      {ORDER.map((o, i) => {
        const [x, y] = point(i, student[o.key]);
        return <circle key={o.key} cx={x} cy={y} r={2.4} fill="var(--color-primary)" />;
      })}
      {/* labels */}
      {ORDER.map((o, i) => {
        const [x, y] = point(i, 122);
        return (
          <text
            key={o.key}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--color-muted-foreground)"
            fontSize={11}
            fontFamily="var(--font-display)"
            letterSpacing="0.15em"
            style={{ textTransform: "uppercase" }}
          >
            {o.label}
          </text>
        );
      })}
    </svg>
  );
}
