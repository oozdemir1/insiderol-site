"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

const AVATARS = Array.from(
  { length: 10 },
  (_, i) => `/avatars/avatar_${i + 1}.png`
);

export default function AvatarPicker({
  userId,
  currentAvatar,
}: {
  userId: string;
  currentAvatar: string | null;
}) {
  const [selected, setSelected] = useState(currentAvatar);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const chooseAvatar = async (avatar: string) => {
    if (avatar === selected) {
      setOpen(false);
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: avatar })
      .eq("id", userId);

    setSaving(false);

    if (!error) {
      setSelected(avatar);
      setOpen(false);

      // Navbar caches the profile client-side on mount, so it won't pick
      // up this change on its own — a full reload keeps it in sync.
      window.location.reload();
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-24 h-24 rounded-full overflow-hidden border border-black/10 bg-white block"
      >
        {selected && (
          <img
            src={selected}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        )}
      </button>

      {open && (
        <div
          className="
            absolute
            top-full
            left-1/2
            ml-[-148px]
            mt-3
            z-50
            grid
            grid-cols-5
            gap-2
            p-3
            w-[296px]
            rounded-2xl
            border border-[var(--border)]
            bg-[var(--surface)]
            shadow-2xl
          "
        >
          {AVATARS.map((avatar) => (
            <button
              key={avatar}
              type="button"
              disabled={saving}
              onClick={() => chooseAvatar(avatar)}
              className={`w-12 h-12 rounded-full overflow-hidden border-2 transition ${
                avatar === selected
                  ? "border-[var(--accent)]"
                  : "border-transparent hover:border-white/30"
              }`}
            >
              <img
                src={avatar}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
