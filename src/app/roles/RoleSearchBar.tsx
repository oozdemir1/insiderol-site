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
    <form onSubmit={handleSubmit} className="contents">
      <div className="relative">
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
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40">
            <Search size={18} />
          </span>
        )}
      </div>

      <button
        type="submit"
        className="form-btn"
      >
        Ara
      </button>

      <a
        href="/roles"
        className="form-btn form-btn-secondary"
      >
        Temizle
      </a>
    </form>
  );
}
