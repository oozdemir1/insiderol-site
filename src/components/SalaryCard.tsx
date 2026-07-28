"use client";

import { useState } from "react";
import { Ghost } from "lucide-react";

// A comment can run up to 1200 chars — in a half-width grid cell that's
// enough text to both wreck scannability and, via the grid's default
// row-stretch, drag an empty-comment neighbor's card open with it. Truncate
// and let "Devamını göster" open both cards in the row together.
const COMMENT_TRUNCATE_LENGTH = 220;

type SalaryCardProps = {
  role: string;
  salary: number;
  experienceLabel: string;
  cityLabel: string;
  satisfaction?: number;
  techStack?: string | null;
  comment?: string | null;
  isAnonymous?: boolean;
  authorUsername?: string | null;
  authorAvatarUrl?: string | null;
};

export default function SalaryCard({
  role,
  salary,
  experienceLabel,
  cityLabel,
  satisfaction,
  techStack,
  comment,
  isAnonymous = true,
  authorUsername,
  authorAvatarUrl,
}: SalaryCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isLongComment = !!comment && comment.length > COMMENT_TRUNCATE_LENGTH;
  const displayedComment =
    isLongComment && !expanded
      ? comment!.slice(0, COMMENT_TRUNCATE_LENGTH).trimEnd() + "…"
      : comment;

  return (
    <div className="card-light rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[var(--surface-2)] flex items-center justify-center shrink-0 overflow-hidden">
            {!isAnonymous && authorAvatarUrl ? (
              <img
                src={authorAvatarUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <Ghost size={14} className="text-[var(--accent)]" />
            )}
          </div>

          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-[var(--text-dark)] truncate">
              {role}
            </h3>

            <p className="text-xs text-[var(--muted-dark)] mt-0.5">
              {!isAnonymous && authorUsername ? `@${authorUsername}` : "anonim"}
            </p>
          </div>
        </div>

        {satisfaction != null && (
          <span className="shrink-0 rounded-md bg-[rgba(123,189,0,0.12)] px-2.5 py-1 text-xs font-medium text-[var(--text-dark)]">
            Memnuniyet ⭐{satisfaction}/5
          </span>
        )}
      </div>

      <p className="text-xl font-bold text-[var(--accent)] mt-3">
        {salary.toLocaleString("tr-TR")}₺
      </p>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-sm text-[var(--muted-dark)]">
        <p>
          Deneyim:{" "}
          <span className="text-[var(--text-dark)]">{experienceLabel}</span>
        </p>

        <p>
          Çalışılan Şehir:{" "}
          <span className="text-[var(--text-dark)]">{cityLabel}</span>
        </p>
      </div>

      {techStack && (
        <p className="mt-3 text-xs text-[var(--muted-dark)]">{techStack}</p>
      )}

      {comment && (
        <>
          <p className="mt-2 text-sm text-[var(--text-dark)] whitespace-pre-wrap">
            {displayedComment}
          </p>

          {isLongComment && (
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="mt-1 text-xs font-medium text-[var(--accent)] hover:underline"
            >
              {expanded ? "Daha az göster" : "Devamını göster"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
