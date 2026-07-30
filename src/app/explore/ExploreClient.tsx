"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import FeedCard, { type FeedItem } from "./FeedCard";
import Pagination from "@/components/Pagination";
import CompareView from "./CompareView";
import ExploreModeToggle from "./ExploreModeToggle";
import RoleAutocomplete from "@/components/forms/RoleAutocomplete";
import CompanyAutocomplete from "@/components/forms/CompanyAutocomplete";
import SelectDropdown from "@/components/forms/SelectDropdown";
import TurkishCitySelect from "@/components/forms/TurkishCitySelect";
import FiltersToggle from "@/components/FiltersToggle";
import { experienceLevels } from "@/app/constants/experienceLevels";

const TYPE_TABS: {
  value: "" | "salary" | "review" | "interview";
  label: string;
}[] = [
  { value: "", label: "Tümü" },
  { value: "review", label: "Yorum" },
  { value: "salary", label: "Maaş" },
  { value: "interview", label: "Mülakat Süreci" },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => ({
  value: currentYear - i,
  label: String(currentYear - i),
}));

// experience_years stores a bucket id (1="0-1 yıl" ... 6="10+ yıl", see
// experienceLevels.ts), not a literal year count — options mirror that
// table directly instead of a hand-rolled year-range string.
const EXPERIENCE_OPTIONS = experienceLevels.map((level) => ({
  value: level.id,
  label: level.name,
}));

// "Deneyim" (not "Paylaşım") for the no-filter case — this feed only
// ever aggregates salary/review/interview, never benefits/compensation/
// work-style, so a generic "submission" noun overclaims. "Deneyim"
// both fits (these three are personal, narrative submissions, unlike
// the poll-style excluded ones) and matches the site's own established
// vocabulary ("anonim çalışan deneyimi", "çalışan deneyimi platformu").
const TYPE_NOUN: Record<"" | "salary" | "review" | "interview", string> = {
  "": "Deneyim",
  salary: "Maaş",
  review: "Yorum",
  interview: "Mülakat Deneyimi",
};

type Props = {
  compareMode: boolean;
  typeFilter: "" | "salary" | "review" | "interview";
  pagedItems: FeedItem[];
  itemCount: number;
  currentPage: number;
  totalPages: number;
};

export default function ExploreClient({
  compareMode,
  typeFilter,
  pagedItems,
  itemCount,
  currentPage,
  totalPages,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [roleSearch, setRoleSearch] = useState("");
  const [roleId, setRoleId] = useState<number | null>(null);
  const [companySearch, setCompanySearch] = useState("");
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [experience, setExperience] = useState<number | null>(null);
  const [city, setCity] = useState<number | null>(null);
  const [year, setYear] = useState<number | null>(null);

  // Driven by the URL (not local state) — same source the Akış/Karşılaştır
  // split already used, so all three destinations are one consistent,
  // bookmarkable/shareable "mode" concept instead of two separate toggles
  // (a URL-level Akış/Karşılaştır switch plus a client-only sub-toggle).
  const compareSubMode: "company" | "role" =
    searchParams.get("compareType") === "role" ? "role" : "company";

  return (
    <>
      <div
        className="
          sticky
          top-20
          z-40
          bg-[var(--background)]
          backdrop-blur-2xl
          border-b
          border-black/10
          shadow-sm
          pt-4
          pb-5
          sm:pb-4
          mb-4
        "
      >
        {/* pb-5 on mobile (vs. the sm:pb-4 that matches roles/companies'
            filter bar exactly) gives ExploreModeToggle's -inset-y-1 pill
            room to breathe when the toggle is the last item in the
            stacked mobile column — without it the pill got visually
            cramped against this border. Desktop doesn't need the extra
            4px since the toggle sits mid-row next to the dropdown, so
            keeping pb-4 there is what lines this banner's bottom border
            up with the other pages' at that width. */}
        <div className="container mx-auto px-4 max-w-7xl flex flex-col items-center sm:flex-row sm:flex-wrap sm:justify-between gap-x-4 gap-y-3">
          {compareMode ? (
            <div className="w-full sm:flex-1">
              <FiltersToggle breakpoint="sm">
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-4">
              {/* All four are equally optional narrowing filters — none
                  of them is what's actually being compared (that's
                  CompareView's own 2-3 slots), so all collapse behind
                  the mobile Filtreler toggle together. */}
              {compareSubMode === "role" ? (
                <div className="relative">
                  <CompanyAutocomplete
                    value={companySearch}
                    onChange={setCompanySearch}
                    onCompanySelect={(company) => {
                      setCompanyId(company?.id ?? null);
                    }}
                    searchOnly
                    placeholder="Tüm Şirketler"
                    inputClassName={companySearch ? "pr-8" : ""}
                  />

                  {companySearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setCompanySearch("");
                        setCompanyId(null);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/70"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <RoleAutocomplete
                    roleSearch={roleSearch}
                    setRoleSearch={setRoleSearch}
                    selectedRoleId={roleId}
                    onSelect={setRoleId}
                    searchOnly
                    placeholder="Tüm Pozisyonlar"
                    inputClassName={roleSearch ? "pr-8" : ""}
                  />

                  {roleSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setRoleSearch("");
                        setRoleId(null);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/70"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              )}

              <SelectDropdown
                value={experience}
                onChange={setExperience}
                options={EXPERIENCE_OPTIONS}
                placeholder="Tüm Deneyimler"
              />

              <div className="relative">
                <TurkishCitySelect
                  value={city}
                  onChange={setCity}
                  placeholder="Tüm Şehirler"
                  mutedPlaceholder
                  className={city !== null ? "pr-8" : undefined}
                />

                {city !== null ? (
                  <button
                    type="button"
                    onClick={() => setCity(null)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/70"
                  >
                    <X size={16} />
                  </button>
                ) : (
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none"
                  />
                )}
              </div>

              <SelectDropdown
                value={year}
                onChange={setYear}
                options={YEAR_OPTIONS}
                placeholder="Tüm Yıllar"
              />
              </div>
              </FiltersToggle>
            </div>
          ) : (
            // Narrows one continuous feed by type rather than switching
            // between separate datasets (unlike the company page's 6
            // tabs) — functionally a filter, so it uses the same
            // SelectDropdown filter convention as the rest of the site
            // instead of a tab strip.
            <div className="w-full sm:ml-auto sm:w-60">
              <SelectDropdown
                value={typeFilter}
                onChange={(value) =>
                  router.push(value ? `/explore?type=${value}` : "/explore")
                }
                options={TYPE_TABS}
                defaultValue=""
                mutedAtDefault
                placeholder="Tümü"
              />
            </div>
          )}

          <ExploreModeToggle compareMode={compareMode} compareSubMode={compareSubMode} />
        </div>
      </div>

      <div
        className={`container mx-auto px-4 pt-0 pb-8 w-full ${
          compareMode ? "max-w-5xl" : "max-w-3xl"
        }`}
      >
        {compareMode ? (
          <CompareView
            mode={compareSubMode}
            roleId={roleId}
            roleName={roleId ? roleSearch : null}
            companyId={companyId}
            companyName={companyId ? companySearch : null}
            experience={experience}
            city={city}
            year={year}
          />
        ) : (
          <>
            <div className="text-center mb-4">
              <span className="text-2xl text-[var(--muted-dark)]">
                Son Eklenen
              </span>

              <span className="mx-2 text-2xl font-semibold text-[var(--text-dark)]">
                {itemCount}
              </span>

              <span className="text-2xl text-[var(--muted-dark)]">
                {TYPE_NOUN[typeFilter]}
              </span>
            </div>

            {pagedItems.length === 0 ? (
              <p className="text-center text-[var(--muted-dark)] py-12">
                Henüz paylaşım yok.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {pagedItems.map((item) => (
                  <FeedCard key={`${item.kind}-${item.id}`} item={item} />
                ))}
              </div>
            )}

            <Pagination
              basePath="/explore"
              currentPage={currentPage}
              totalPages={totalPages}
              searchParams={{ type: typeFilter || undefined }}
            />
          </>
        )}
      </div>
    </>
  );
}
