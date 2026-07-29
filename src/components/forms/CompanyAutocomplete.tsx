"use client";

import { useEffect, useState, useRef, } from "react";
import { supabase } from "@/lib/supabase";
import { toTitleCaseTR } from "@/app/constants/toTitleCaseTR";
import { normalizeCompanySearchText } from "@/app/constants/companyUtils";

type CompanyAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;

  onCompanySelect?: (company: any) => void;

  onNewCompanyChange?: (isNew: boolean) => void;

  setFormData?: React.Dispatch<
    React.SetStateAction<any>
  >;

  // Search contexts (e.g. Explore's Karşılaştır company pickers) never
  // submit an unmatched name anywhere, so the "we'll add it for review"
  // messaging is wrong there — show a plain not-found warning instead.
  searchOnly?: boolean;

  // Extra classes merged onto the input, e.g. an error-state border.
  inputClassName?: string;

  placeholder?: string;
};

export default function CompanyAutocomplete({
  value,
  onChange,
  onCompanySelect,
  onNewCompanyChange,
  setFormData,
  searchOnly,
  inputClassName,
  placeholder,
}: CompanyAutocompleteProps) {

  const [companies, setCompanies] =
    useState<any[]>([]);
  
    const [showDropdown, setShowDropdown] =
    useState(false);

    const [highlightedIndex, setHighlightedIndex] =
  useState(-1);

  const containerRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data } = await supabase
        .from("companies")
        .select("*");

      if (data) {
        setCompanies(data);
      }
    };

    fetchCompanies();
  }, []);


const filteredCompanies = companies.filter(
  (company: any) =>
    company.name &&
    normalizeCompanySearchText(company.name).includes(
      normalizeCompanySearchText(value)
    )
);

useEffect(() => {
  if (filteredCompanies.length > 0) {
    setHighlightedIndex(0);
  } else {
    setHighlightedIndex(-1);
  }
}, [value]);

  const exactMatch = companies.find(
    (company: any) =>
      company.name &&
      normalizeCompanySearchText(company.name) ===
        normalizeCompanySearchText(value)
  );

  const shouldShowNewCompanyFields =
    value.trim().length >= 1 &&
    !exactMatch &&
    filteredCompanies.length === 0;

  useEffect(() => {
    if (exactMatch) {
      onCompanySelect?.(exactMatch);
      } else {

      onCompanySelect?.(null);

      setFormData?.((prev: any) => {

      if (prev.companyId === null && prev.company_id === null) {
        return prev;
      }

      return {
        ...prev,

        // Consuming forms disagree on casing (Salary/Review read
        // companyId, WorkStyle/Benefits/Compensation/Interview read
        // company_id) — write both so this component works for either.
        companyId: null,
        company_id: null,
      };
    });
    }

    onNewCompanyChange?.(
      shouldShowNewCompanyFields
    );
  }, [
    exactMatch,
    shouldShowNewCompanyFields,
    onCompanySelect,
    onNewCompanyChange,
  ]);

  useEffect(() => {

  const handleClickOutside = (
    event: MouseEvent
  ) => {

    if (
      containerRef.current &&
      !containerRef.current.contains(
        event.target as Node
      )
    ) {

      setShowDropdown(false);

    }
  };

  document.addEventListener(
    "mousedown",
    handleClickOutside
  );

  return () => {

    document.removeEventListener(
      "mousedown",
      handleClickOutside
    );

  };

}, []);

const shouldShowDropdown =
  showDropdown &&
  value.length > 0 &&
  (
    filteredCompanies.length > 0 ||
    shouldShowNewCompanyFields
  );

  return (
     <div ref={containerRef} className="relative">
      <input
        maxLength={50}
        type="text"
        value={value}
        placeholder={placeholder}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => {
          // A resolved company already holds its canonical DB name
          // (e.g. "IBM") — re-title-casing it here would mangle
          // acronyms the same way it did in RoleAutocomplete.
          if (exactMatch) return;

          onChange(toTitleCaseTR(value));
        }}
        onChange={(e) => {
          onChange(e.target.value);
          setHighlightedIndex(-1);
        }}

        onKeyDown={(e) => {

          if (!filteredCompanies.length) return;

          if (e.key === "ArrowDown") {
            e.preventDefault();

            setHighlightedIndex((prev) =>
              prev < filteredCompanies.length - 1
                ? prev + 1
                : 0
            );
          }

          if (e.key === "ArrowUp") {
            e.preventDefault();

            setHighlightedIndex((prev) =>
              prev > 0
                ? prev - 1
                : filteredCompanies.length - 1
            );
          }

          if (e.key === "Escape") {
            setShowDropdown(false);
            setHighlightedIndex(-1);
          }

          if (
            e.key === "Enter" &&
            highlightedIndex >= 0
          ) {
            e.preventDefault();

            const company =
              filteredCompanies[highlightedIndex];

            onChange(company.name);

            setShowDropdown(false);

            setFormData?.((prev: any) => ({
              ...prev,

              companyId: company.id,
              company_id: company.id,

              companyName: company.name,

              hqCity:
                company.hq_city || null,
            }));
          }
        }}

        className={`form-field ${inputClassName || ""}`}
        />

      {shouldShowDropdown && (
        <div
          className="
            absolute
            top-full
            left-0
            z-50
            mt-1
            w-full

            overflow-hidden

            rounded-md

            border border-[var(--border)]

            bg-[var(--surface)]
            hover:bg-[var(--surface-2)]

            p-0

            text-white

            shadow-2xl

            transition-all duration-200
          "
        >
          {filteredCompanies
          .slice(0, 5)
          .map((company: any, index: number) => (
              <button
                type="button"
                key={company.id}
                onClick={() => {

                  onChange(company.name);
                  setShowDropdown(false);

                  setFormData?.((prev: any) => ({
                    ...prev,

                    companyId: company.id,
                    company_id: company.id,

                    companyName:
                      company.name,

                    hqCity:
                      company.hq_city || null,
                  }));
                }}
                className={`
                      w-full
                      border-b border-black/5
                      px-4 py-1.5
                      text-left
                      text-sm
                      text-white/90
                      transition
                      last:border-0
                      ${
                        highlightedIndex === index
                          ? "bg-white/10"
                          : "hover:bg-white/5"
                      }
                    `}
              >
                <div>
                  {company.name}
                </div>

               
              </button>
            ))}


         {shouldShowNewCompanyFields && (
           <div
                  className={`
                    w-full
                    px-4
                    py-1.5
                    text-xs
                    leading-relaxed
                    text-white
                    ${searchOnly ? "bg-red-500/10" : "bg-emerald-500/10"}
                  `}
                >
            {searchOnly ? (
              <>❌ "{value}" adında bir şirket bulunamadı.</>
            ) : (
              <>
                ⚠️ "{value}" şirketi henüz sistemde bulunmuyor.
                Paylaşımınızla birlikte incelemeye gönderilecektir.
              </>
            )}
          </div>
        )}
        </div>
      )}
    </div>
  );
}