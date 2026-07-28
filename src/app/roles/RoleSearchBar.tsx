"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import RoleAutocomplete from "@/components/forms/RoleAutocomplete";

export default function RoleSearchBar({
  initialQuery,
}: {
  initialQuery: string;
}) {
  const router = useRouter();

  const [roleSearch, setRoleSearch] = useState(initialQuery);
  const [selectedRoleId, setSelectedRoleId] =
    useState<number | null>(null);

  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    // Always filter the list in place — picking a suggestion just fills
    // the box, it doesn't commit to navigating anywhere. The user picks
    // the exact role from the resulting cards themselves.
    const params = new URLSearchParams(
      window.location.search
    );

    if (roleSearch.trim()) {
      params.set("q", roleSearch.trim());
    } else {
      params.delete("q");
    }

    router.push(`/roles?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto"
    >
      <div className="relative md:w-[320px] md:shrink-0">
        <RoleAutocomplete
          roleSearch={roleSearch}
          setRoleSearch={setRoleSearch}
          selectedRoleId={selectedRoleId}
          onSelect={setSelectedRoleId}
          hideNewRoleSuggestion
          placeholder="Pozisyon ara..."
          inputClassName="text-lg h-10 pr-10"
        />

        {initialQuery ? (
          <a
            href="/roles"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-black/50 hover:text-black"
          >
            ✕
          </a>
        ) : (
          <button
            type="submit"
            aria-label="Ara"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/70"
          >
            <Search size={18} />
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="form-btn flex-1 md:w-auto md:flex-none"
        >
          Ara
        </button>

        <a
          href="/roles"
          className="form-btn form-btn-secondary flex-1 md:w-auto md:flex-none"
        >
          Temizle
        </a>
      </div>
    </form>
  );
}
