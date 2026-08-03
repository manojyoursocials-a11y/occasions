import { Card, CardLabel } from "./Card";

export function StatCard({
  label,
  value,
  sub,
  children,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <Card>
      <CardLabel>{label}</CardLabel>
      <p className="text-2xl font-semibold text-ink">{value}</p>
      {sub && <p className="mt-1 text-sm text-ink/50">{sub}</p>}
      {children}
    </Card>
  );
}
