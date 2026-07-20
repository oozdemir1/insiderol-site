"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AnonymityToggle({
  userId,
  initialValue,
}: {
  userId: string;
  initialValue: boolean;
}) {
  const [defaultAnonymous, setDefaultAnonymous] = useState(initialValue);
  const [saving, setSaving] = useState(false);

  const toggle = async () => {
    const next = !defaultAnonymous;

    setDefaultAnonymous(next);
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({ default_anonymous: next })
      .eq("id", userId);

    setSaving(false);

    if (error) {
      // Revert on failure so the switch doesn't silently lie about state.
      setDefaultAnonymous(!next);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-[var(--text-dark)]">
          Varsayılan olarak anonim paylaş
        </p>

        <p className="text-xs text-[var(--muted-dark)] mt-0.5">
          Açıkken yeni paylaşım formların "Anonim" seçili başlar; her
          formda yine de değiştirebilirsin.
        </p>
      </div>

      <button
        type="button"
        onClick={toggle}
        disabled={saving}
        className={`shrink-0 relative w-11 h-6 rounded-full transition-colors ${
          defaultAnonymous ? "bg-[var(--accent)]" : "bg-black/15"
        } disabled:opacity-50`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
            defaultAnonymous ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
