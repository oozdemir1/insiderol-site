"use client";

type SalaryCardProps = {
  role: string;
  salary: number;
  experienceLabel: string;
  cityLabel: string;
  satisfaction?: number;
  techStack?: string | null;
  comment?: string | null;
};

export default function SalaryCard({
  role,
  salary,
  experienceLabel,
  cityLabel,
  techStack,
  comment,
}: SalaryCardProps) {
  return (
    <div className="card-light rounded-2xl p-5">
      <h3 className="text-lg font-semibold text-[var(--text-dark)]">
        {role}
      </h3>

      <p className="text-xl font-bold text-[var(--accent)] mt-3">
        ₺{salary.toLocaleString("tr-TR")}
      </p>

      <div className="flex justify-between mt-3 text-sm text-[var(--muted-dark)]">
        <span>{experienceLabel}</span>
        <span>{cityLabel}</span>
      </div>

      {techStack && (
        <p className="mt-3 text-xs text-[var(--muted-dark)]">{techStack}</p>
      )}

      {comment && (
        <p className="mt-2 text-sm text-[var(--text-dark)] whitespace-pre-wrap">
          {comment}
        </p>
      )}
    </div>
  );
}
