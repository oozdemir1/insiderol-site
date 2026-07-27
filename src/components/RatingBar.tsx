export default function RatingBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-[var(--text-dark)]">{label}</span>
        <span className="text-[var(--muted-dark)]">{value.toFixed(1)}</span>
      </div>

      <div className="h-1.5 rounded-full bg-black/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--accent)]"
          style={{
            width: `${Math.min(100, (value / 5) * 100)}%`,
          }}
        />
      </div>
    </div>
  );
}
