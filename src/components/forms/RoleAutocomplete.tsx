"use client";

import { useEffect, useState, useRef, } from "react";
import { supabase } from "@/lib/supabase";
import { toTitleCaseTR } from "@/app/constants/toTitleCaseTR";
import { normalizeSearchText } from "@/app/constants/normalizationUtils";

type Props = {
  roleSearch: string;

  setRoleSearch: (
    value: string
  ) => void;

  selectedRoleId: number | null;

  onSelect: (
    roleId: number | null
  ) => void;

  // Search contexts (e.g. browsing /roles) have no "your post" to attach
  // an unmatched name to, so the moderation-queue messaging below
  // doesn't apply there.
  hideNewRoleSuggestion?: boolean;

  // Filter contexts (e.g. Explore's Karşılaştır role filter) never submit
  // an unmatched name anywhere either, but — unlike hideNewRoleSuggestion —
  // should actively tell the user nothing matched instead of going silent.
  searchOnly?: boolean;

  placeholder?: string;

  // Extra classes merged onto the input, e.g. to reserve space for an
  // icon a parent overlays on top (icon itself isn't rendered here so
  // every other RoleAutocomplete usage stays visually unchanged).
  inputClassName?: string;
};

export default function RoleAutocomplete({
  roleSearch,
  setRoleSearch,
  selectedRoleId,
  onSelect,
  hideNewRoleSuggestion,
  searchOnly,
  placeholder,
  inputClassName,
}: Props) {

  const [loading, setLoading] =
    useState(false);
  
  const [roleSuggested, setRoleSuggested] =
  useState(false);

  const [showDropdown, setShowDropdown] =
    useState(false);

  const [highlightedIndex, setHighlightedIndex] =
    useState(-1);

  const containerRef =
    useRef<HTMLDivElement>(null);

    const handleSuggestRole = async () => {
      const roleName = roleSearch.trim();

      if (!roleName) return;

    const normalizedRole =
     normalizeSearchText(roleName);

      // Check if role already exists
      const { data: existingRole } =
        await supabase
          .from("roles")
          .select("id")
          .eq(
            "normalized_name",
            normalizedRole
          )
          .maybeSingle();

      if (existingRole) {
        alert(
          "Bu pozisyon zaten mevcut."
        );
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("pending_roles")
        .insert({
          suggested_name: roleName,
          user_id: user?.id ?? null,
          source_type: "salary",
        });

      if (error) {
        console.error(error);

        alert(
          "Bu pozisyon daha önce önerilmiş olabilir."
        );

        return;
      }

      alert(
        "Pozisyon öneriniz alınmıştır."
      );

      setRoleSuggested(true);
      setShowDropdown(false);
    };


  const [roles, setRoles] =
    useState<any[]>([]);

  // Tracks the most recent search so a slow response from an
  // older keystroke can't overwrite the result of a newer one.
  const latestSearchRef = useRef("");

  useEffect(() => {

    const currentSearch = roleSearch;
    latestSearchRef.current = currentSearch;

    if (!roleSearch.trim()) {
      setRoles([]);
      return;
    }

    setLoading(true);

    const timeoutId = setTimeout(async () => {

      const normalizedSearch =
        normalizeSearchText(currentSearch);

      const isStale = () =>
        latestSearchRef.current !== currentSearch;

      const [
        { data: roleMatches },
        { data: exactAliasMatch },
        { data: fuzzyAliasMatches },
      ] = await Promise.all([
        supabase
          .from("roles")
          .select("id, name")
          .ilike(
            "normalized_name",
            `%${normalizedSearch}%`
          )
          .limit(5),
        supabase
          .from("role_aliases")
          .select("*")
          .eq(
            "normalized_alias",
            normalizedSearch
          )
          .maybeSingle(),
        supabase
          .from("role_aliases")
          .select("*")
          .ilike(
            "normalized_alias",
            `%${normalizedSearch}%`
          ),
      ]);

      if (isStale()) return;

      if (exactAliasMatch) {
        const { data: matchedRole } =
          await supabase
            .from("roles")
            .select("id, name")
            .eq(
              "id",
              exactAliasMatch.role_id
            )
            .single();

        if (isStale()) return;

        if (matchedRole) {
          setRoles([matchedRole]);
          // Exact alias match (e.g. "HRBP" -> "HR Business Partner")
          // is a confident signal, so auto-confirm the selection even
          // if the user never clicks the suggestion. Without this,
          // role_id stays null and the raw typed text gets saved to
          // pending_roles as if it were an unknown role.
          onSelect(matchedRole.id);
          // Keep the visible text consistent with what a manual click
          // would produce, so the field doesn't show "HRBP" while
          // secretly pointing at "HR Business Partner".
          setRoleSearch(matchedRole.name);
          setLoading(false);
          return;
        }
      }

      let aliasRoles: any[] = [];

      if (fuzzyAliasMatches && fuzzyAliasMatches.length > 0) {
        const roleIds = fuzzyAliasMatches.map(
          (item) => item.role_id
        );

        const { data: matchedRoles } =
          await supabase
            .from("roles")
            .select("id, name")
            .in("id", roleIds);

        if (isStale()) return;

        aliasRoles = matchedRoles ?? [];
      }

      // Merge direct role matches with alias-derived matches so a
      // relevant fuzzy alias hit doesn't get shadowed just because an
      // unrelated role also happened to match the raw ilike search.
      const merged = new Map<number, any>();

      (roleMatches ?? []).forEach((role) =>
        merged.set(role.id, role)
      );

      aliasRoles.forEach((role) =>
        merged.set(role.id, role)
      );

      setRoles(
        Array.from(merged.values()).slice(0, 5)
      );
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [roleSearch]);

  useEffect(() => {
    setHighlightedIndex(roles.length > 0 ? 0 : -1);
  }, [roles]);

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

  const exactRoleMatch = roles.find(
    (role) =>
      normalizeSearchText(role.name) ===
      normalizeSearchText(roleSearch)
  );

  useEffect(() => {

    if (exactRoleMatch) {
      onSelect(exactRoleMatch.id);
    }

  }, [exactRoleMatch]);

 const shouldShowNewRoleMessage =
  !hideNewRoleSuggestion &&
  !searchOnly &&
  roleSearch.trim().length > 1 &&
  roles.length === 0 &&
  !roleSuggested;

const shouldShowNotFoundMessage =
  !!searchOnly &&
  roleSearch.trim().length > 1 &&
  roles.length === 0;

const shouldShowDropdown =
  showDropdown &&
  roleSearch.length > 0 &&
  !selectedRoleId &&
  (
    roles.length > 0 ||
    shouldShowNewRoleMessage ||
    shouldShowNotFoundMessage
  );


  return (
    <div ref={containerRef} className="relative">

      <input
        maxLength={50}
        type="text"
        value={roleSearch}
        placeholder={placeholder}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => {
          // A role is already selected (exact match, alias match, or a
          // dropdown click) means roleSearch already holds the canonical
          // DB name (e.g. "HR Business Partner") — re-title-casing it
          // would mangle acronyms like "HR" into "Hr".
          if (selectedRoleId) return;

          setRoleSearch(
            toTitleCaseTR(roleSearch)
          );
        }}
        onChange={(e) => {
          setRoleSearch(e.target.value);

          setRoleSuggested(false);

          setLoading(true);

          onSelect(null);
        }}
        onKeyDown={(e) => {

          if (!roles.length) return;

          if (e.key === "ArrowDown") {
            e.preventDefault();

            setHighlightedIndex((prev) =>
              prev < roles.length - 1
                ? prev + 1
                : 0
            );
          }

          if (e.key === "ArrowUp") {
            e.preventDefault();

            setHighlightedIndex((prev) =>
              prev > 0
                ? prev - 1
                : roles.length - 1
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

            const role = roles[highlightedIndex];

            onSelect(role.id);
            setRoleSearch(role.name);
            setShowDropdown(false);
          }
        }}
        className={`form-field ${inputClassName || ""}`}
      />

      {
        shouldShowDropdown && (
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

            {roles.map((role, index) => (
              <button
                type="button"
                key={role.id}
                onClick={() => {

                  onSelect(role.id);

                  setRoleSearch(role.name);
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
                {role.name}
              </button>
            ))}

            

            {
              shouldShowNewRoleMessage && (
                <div
                  className="
                    w-full
                    bg-emerald-500/10
                    px-4
                    py-1.5
                    text-xs
                    leading-relaxed
                    text-white
                  "
                >
                  ⚠️ "{roleSearch}" pozisyonu henüz sistemde bulunmuyor.
                  Paylaşımınızla birlikte incelemeye gönderilecektir.
                </div>
              )
            }

            {
              shouldShowNotFoundMessage && (
                <div
                  className="
                    w-full
                    bg-red-500/10
                    px-4
                    py-1.5
                    text-xs
                    leading-relaxed
                    text-white
                  "
                >
                  ❌ "{roleSearch}" adında bir pozisyon bulunamadı.
                </div>
              )
            }

          </div>
        )
      }

    </div>
  );
}