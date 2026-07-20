"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { normalizeSearchText } from "@/app/constants/normalizationUtils";
import { Search, X } from "lucide-react";

type CompanyResult = { id: number; name: string; slug: string };
type RoleResult = { id: number; name: string };

export default function CompanySearch() {

  const [query, setQuery] = useState("");

  const [companies, setCompanies] = useState<CompanyResult[]>([]);
  const [roles, setRoles] = useState<RoleResult[]>([]);

  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Tracks the most recent search so a slow response from an
  // older keystroke can't overwrite the result of a newer one.
  const latestSearchRef = useRef("");

  useEffect(() => {

    const currentSearch = query;
    latestSearchRef.current = currentSearch;

    if (!query.trim()) {
      setCompanies([]);
      setRoles([]);
      return;
    }

    setLoading(true);

    const timeoutId = setTimeout(async () => {

      const normalized = normalizeSearchText(currentSearch);

      const isStale = () =>
        latestSearchRef.current !== currentSearch;

      const [
        { data: companyMatches },
        { data: roleMatches },
      ] = await Promise.all([
        supabase
          .from("companies")
          .select("id, name, slug")
          .ilike("search_name", `%${normalized}%`)
          .limit(5),
        supabase
          .from("roles")
          .select("id, name")
          .ilike("normalized_name", `%${normalized}%`)
          .limit(5),
      ]);

      if (isStale()) return;

      setCompanies(companyMatches ?? []);
      setRoles(roleMatches ?? []);
      setLoading(false);

    }, 300);

    return () => clearTimeout(timeoutId);

  }, [query]);

  useEffect(() => {

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };

  }, []);

  const hasResults = companies.length > 0 || roles.length > 0;
  const shouldShowDropdown = showDropdown && query.trim().length > 0;

  return (
    <div ref={containerRef} className="relative w-full">

      <input
        type="text"
        placeholder="Şirket veya pozisyon ara..."
        value={query}
        onFocus={() => setShowDropdown(true)}
        onChange={(e) =>
          setQuery(e.target.value)
        }
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 outline-none focus:border-white/30 text-sm"
      />

      {query ? (
        <button
          type="button"
          onClick={() => setQuery("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
        >
          <X size={16} />
        </button>
      ) : (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
          <Search size={16} />
        </span>
      )}

      {shouldShowDropdown && (

        <div className="absolute top-full mt-2 w-full max-h-96 overflow-y-auto border border-white/10 rounded-xl overflow-hidden bg-black z-50">

          {!loading && !hasResults && (
            <div className="px-4 py-3 text-sm text-white/50">
              Sonuç bulunamadı!
            </div>
          )}

          {companies.length > 0 && (
            <div>
              <div className="px-4 pt-3 pb-1 text-xs font-medium tracking-wide text-white/40">
                ŞİRKETLER
              </div>

              {companies.map((company) => (
                <Link
                  key={company.id}
                  href={`/companies/${company.slug}`}
                  onClick={() => setShowDropdown(false)}
                  className="block px-4 py-3 hover:bg-white/5 transition border-b border-white/5 last:border-0"
                >
                  {company.name}
                </Link>
              ))}
            </div>
          )}

          {roles.length > 0 && (
            <div>
              <div className="px-4 pt-3 pb-1 text-xs font-medium tracking-wide text-white/40">
                POZİSYONLAR
              </div>

              {roles.map((role) => (
                <Link
                  key={role.id}
                  href={`/roles/${role.id}`}
                  onClick={() => setShowDropdown(false)}
                  className="block px-4 py-3 hover:bg-white/5 transition border-b border-white/5 last:border-0"
                >
                  {role.name}
                </Link>
              ))}
            </div>
          )}

        </div>

      )}

    </div>
  );
}
