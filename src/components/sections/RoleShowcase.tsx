import Link from "next/link";
import { Briefcase } from "lucide-react";
import { slugifyText } from "@/app/constants/normalizationUtils";

type ShowcaseRole = {
  id: number;
  name: string;
};

export default function RoleShowcase({
  roles,
  totalCount,
}: {
  roles: ShowcaseRole[];
  totalCount: number;
}) {
  if (roles.length === 0) return null;

  return (
    <section className="py-28 px-8 bg-[var(--section-light)]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-dark)]">
            {totalCount}+ pozisyon
          </h2>
          <p className="text-[var(--muted-dark)] text-lg mt-4">
            Aradığın pozisyonu bul, maaş ve deneyimleri incele.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {roles.map((role) => (
            <Link
              key={role.id}
              href={`/roles/${role.id}-${slugifyText(role.name)}`}
              className="inline-flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-full border border-black/[0.06] bg-[var(--card-light)] shadow-[0_1px_2px_rgba(16,24,40,0.03),0_8px_20px_rgba(16,24,40,0.05)] hover:bg-white transition-colors text-sm font-medium text-[var(--text-dark)]"
            >
              <span className="w-7 h-7 rounded-full bg-[var(--card-green-2)] text-white flex items-center justify-center shrink-0">
                <Briefcase size={13} />
              </span>
              {role.name}
            </Link>
          ))}
        </div>

        <div className="flex justify-center mt-11">
          <Link
            href="/roles"
            className="inline-flex items-center gap-2 bg-[var(--text-dark)] text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Pozisyon Ara
          </Link>
        </div>
      </div>
    </section>
  );
}
