"use client";

type SalaryCardProps = {
  logo?: string;
  company: string;
  role: string;
  salary: string;
  location: string | number;
  type: string;
};

export default function SalaryCard({
  logo,
  company,
  role,
  salary,
  location,
  type,
}: SalaryCardProps) {
  return (
    <div className="card-light rounded-2xl p-5">
      {logo && (
        <img
          src={logo}
          alt={company}
          className="w-12 h-12 object-contain mb-4"
        />
      )}

      <h3 className="text-lg font-semibold text-[var(--text-dark)]">
        {company}
      </h3>

      <p className="text-sm text-[var(--muted-dark)] mt-1">
        {role}
      </p>

      <p className="text-xl font-bold text-[var(--accent)] mt-4">
        {salary}
      </p>

      <div className="flex justify-between mt-4 text-sm text-[var(--muted-dark)]">
        <span>{location}</span>
        <span>{type}</span>
      </div>
    </div>
  );
}