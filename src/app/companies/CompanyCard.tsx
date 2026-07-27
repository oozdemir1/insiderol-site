import Link from "next/link";
import type { Company } from "@/types/company";
import { turkishCities } from "@/app/constants/turkishCities";
import { BadgeCheck } from "lucide-react";
import { INDUSTRIES } from "../constants/industries";

type CompanyCardProps = {
  company: Company;
  reviewCount: number;
  salaryCount: number;
  reviews: any[];
};

export default function CompanyCard({
  company,
  reviewCount,
  salaryCount,
   reviews,
}: CompanyCardProps) {

const getHqCityName = (
  hqCityId: number | null
) => {
  return (
    turkishCities.find(
      (city) => city.id === hqCityId
    )?.name || "-"
  );

};

const industryName =
  INDUSTRIES.find(
    (industry) => industry.id === Number(company.industry)
  )?.name || "-";


const averageReviewRating =
  Number(
    company.average_rating || 0
  ).toFixed(1);

  return (

<Link
  href={`/companies/${company.slug}`}
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

    <div
  title={
    company.is_verified
      ? "Onaylı!"
      : "Henüz onaylanmadı!"
  }
  className="absolute top-4 right-4"
>
  <BadgeCheck
    size={20}
    className={
      company.is_verified
        ? "text-green-500"
        : "text-gray-300"
    }
  />
</div>

    <div className="flex items-center gap-4">
      {company.logo_url ? (
            <div
                className="
                w-22 h-22
                rounded-xl
                bg-white
                border border-black/5
                shadow-[0_1px_2px_rgba(0,0,0,0.03)]
                flex items-center justify-center
                overflow-hidden
                "
            >
                <img
                src={company.logo_url}
                alt={company.name}
               className="w-full h-full object-contain"
                />
            </div>
            ) : (
        <div
          className="
            w-14
            h-14
            rounded-md
            border
            flex
            items-center
            justify-center
            font-semibold
          "
        >
          {company.name.charAt(0)}
        </div>
      )}

      <div className="flex-1">
  <h2 className="text-md font-semibold text-[var(--text-dark)]">
    {company.name}
  </h2>

  {industryName && (
    <p className="text-[10px] tracking-[0.14em] text-[var(--muted-dark)]/80">
      {industryName}
    </p>
  )}

  {company.hq_city && (
    <p className="text-[10px] tracking-[0.14em] text-[var(--muted-dark)]/80">
      {getHqCityName(Number(company.hq_city))}
    </p>
  )}
</div>
    </div>

   <div className="mt-4 pt-4 border-t border-black/5">
  <div className="grid grid-cols-3 gap-10">
    <div className="card-light card-compact flex flex-col items-center justify-center">
       <div className="text-sm tracking-[0.14em] text-[var(--muted-dark)]/90 font-semibold"> ⭐ {averageReviewRating}</div>
       <p className="text-[10px] tracking-[0.14em] text-[var(--muted-dark)]/80 mt-1">
        Puan
      </p>
    </div>

    <div className="card-light card-compact flex flex-col items-center justify-center">
       <div className="text-sm tracking-[0.14em] text-[var(--muted-dark)]/90 font-semibold">{salaryCount}</div>
       <p className="text-[10px] tracking-[0.14em] text-[var(--muted-dark)]/80 mt-1">
        Maaş
      </p>
    </div>

    <div className="card-light card-compact flex flex-col items-center justify-center">
      <div className="text-sm tracking-[0.14em] text-[var(--muted-dark)]/90 font-semibold">{reviewCount}</div>
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