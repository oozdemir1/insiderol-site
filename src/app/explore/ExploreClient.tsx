"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, X } from "lucide-react";
import FeedCard, { type FeedItem } from "./FeedCard";
import Pagination from "@/components/Pagination";
import CompareView from "./CompareView";
import ExploreModeToggle from "./ExploreModeToggle";
import RoleAutocomplete from "@/components/forms/RoleAutocomplete";
import SelectDropdown from "@/components/forms/SelectDropdown";
import TurkishCitySelect from "@/components/forms/TurkishCitySelect";

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

const EXPERIENCE_OPTIONS = [
  { value: "0-2", label: "0-2 yıl" },
  { value: "3-5", label: "3-5 yıl" },
  { value: "5+", label: "5+ yıl" },
];

const TYPE_NOUN: Record<"" | "salary" | "review" | "interview", string> = {
  "": "Paylaşım",
  salary: "Maaş Paylaşımı",
  review: "Yorum Paylaşımı",
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
  const [roleSearch, setRoleSearch] = useState("");
  const [roleId, setRoleId] = useState<number | null>(null);
  const [experience, setExperience] = useState<string | null>(null);
  const [city, setCity] = useState<number | null>(null);
  const [year, setYear] = useState<number | null>(null);

  return (
    <>
      <div
        className="
          sticky
          top-20
          z-40
          bg-[var(--background)]
          pt-4
          mb-4
        "
        style={{
          paddingBottom: "1rem",
        }}
      >
        <div className="container mx-auto px-4 max-w-7xl flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          {compareMode ? (
            <div className="grid gap-3 grid-cols-2 md:grid-cols-4 flex-1">
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
            </div>
          ) : (
            <div className="flex items-center gap-6">
              {TYPE_TABS.map((tab) => (
                <Link
                  key={tab.value}
                  href={tab.value ? `/explore?type=${tab.value}` : "/explore"}
                  className={`share-tab-minimal lowercase ${
                    typeFilter === tab.value ? "share-tab-minimal-active" : ""
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          )}

          <ExploreModeToggle compareMode={compareMode} />
        </div>

        <div
          className="
            fixed
            left-0
            right-0
            h-4
            border-b
            bg-[var(--background)]
            shadow-sm
            border-black/10
            pointer-events-none
          "
          style={{
            marginTop: "1.75px",
          }}
        />
      </div>

      <div
        className={`container mx-auto px-4 pt-0 pb-8 w-full ${
          compareMode ? "max-w-5xl" : "max-w-3xl"
        }`}
      >
        {compareMode ? (
          <CompareView
            roleId={roleId}
            experience={experience}
            city={city}
            year={year}
          />
        ) : (
          <>
            <div className="text-center mb-4">
              <span className="text-2xl text-[var(--muted-dark)]">
                En Son Yapılan
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
