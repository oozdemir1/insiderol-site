"use client";

import { useState } from "react";
import CompanyAutocomplete from "@/components/forms/CompanyAutocomplete";

export default function CompanySearchInput({
  defaultValue,
}: {
  defaultValue: string;
}) {
  const [search, setSearch] = useState(defaultValue);

  return (
    <>
      {/* Mirrors IndustryTypeahead's pattern: the visible input below
          has no name attribute, so this hidden one is what the
          surrounding native <form> actually submits. */}
      <input type="hidden" name="q" value={search} />

      <CompanyAutocomplete
        value={search}
        onChange={setSearch}
        searchOnly
        placeholder="Şirket ara..."
        inputClassName="text-lg h-10 pr-10"
      />
    </>
  );
}
