import Link from "next/link";
import { slugifyText } from "@/app/constants/normalizationUtils";

type RoleCardProps = {
  role: {
    id: number;
    name: string;
  };
  averageSatisfaction: number;
  averageSalary: number;
  salaryCount: number;
  reviewCount: number;
};

export default function RoleCard({
  role,
  averageSatisfaction,
  averageSalary,
  salaryCount,
  reviewCount,
}: RoleCardProps) {

  return (

<Link
  href={`/roles/${role.id}-${slugifyText(role.name)}`}
  className="block"
>

  <div
    className="
      card-light
      rounded-[1rem]
      p-5
      md:p-6
      relative
    "
  >

    <h2 className="text-md font-semibold text-[var(--text-dark)]">
      {role.name}
    </h2>

    <div className="mt-3">
      <div className="text-lg md:text-xl font-bold text-[var(--accent)] tracking-tight">
        {averageSalary > 0
          ? `${averageSalary.toLocaleString("tr-TR")}₺`
          : "-"}
      </div>

      <p className="text-[10px] tracking-[0.14em] text-[var(--muted-dark)]/80 mt-1">
        Ortalama Maaş
      </p>
    </div>

    <div className="mt-4 pt-4 border-t border-black/5">
      <div className="grid grid-cols-3 gap-10">
        <div className="card-light card-compact flex flex-col items-center justify-center">
          <div className="text-sm tracking-[0.14em] text-[var(--muted-dark)]/90 font-semibold">
            {averageSatisfaction > 0 ? averageSatisfaction.toFixed(1) : "-"}
          </div>
          <p className="text-[10px] tracking-[0.14em] text-[var(--muted-dark)]/80 mt-1">
            Maaş Skoru
          </p>
        </div>

        <div className="card-light card-compact flex flex-col items-center justify-center">
          <div className="text-sm tracking-[0.14em] text-[var(--muted-dark)]/90 font-semibold">
            {salaryCount}
          </div>
          <p className="text-[10px] tracking-[0.14em] text-[var(--muted-dark)]/80 mt-1">
            Maaş Verisi
          </p>
        </div>

        <div className="card-light card-compact flex flex-col items-center justify-center">
          <div className="text-sm tracking-[0.14em] text-[var(--muted-dark)]/90 font-semibold">
            {reviewCount}
          </div>
          <p className="text-[10px] tracking-[0.14em] text-[var(--muted-dark)]/80 mt-1">
            Yorum
          </p>
        </div>
      </div>
    </div>
  </div>
</Link>

  );
}
