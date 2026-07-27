"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import TurkishCitySelect from "@/components/forms/TurkishCitySelect";

export default function CityFilter({
  defaultValue,
}: {
  defaultValue?: string;
}) {
  const router = useRouter();

  const [cityId, setCityId] = useState<number | null>(
    defaultValue ? Number(defaultValue) : null
  );

  return (
    <div className="relative">
      <input type="hidden" name="hqCity" value={cityId ?? ""} />
      <TurkishCitySelect value={cityId} onChange={setCityId} mutedPlaceholder className="pr-8" />

      {cityId !== null ? (
        <button
          type="button"
          onClick={() => {
            setCityId(null);

            const params = new URLSearchParams(window.location.search);
            params.delete("hqCity");
            router.push(`/companies?${params.toString()}`);
          }}
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
  );
}
