"use client";

import { useState } from "react";
import { Ghost } from "lucide-react";

// Mirrors SalaryCard's truncate-then-expand treatment for the same reason:
// a long comment in a half-width grid cell both hurts scannability and, via
// the grid's default row-stretch, drags an empty-comment neighbor open with it.
const COMMENT_TRUNCATE_LENGTH = 220;

type WorkStyleCardProps = {
  role: string;
  cityLabel: string;
  remotePolicyLabel: string;
  workingHoursLabel: string;
  overtimePolicyLabel: string;
  saturdayPolicyLabel: string;
  comment?: string | null;
  isAnonymous?: boolean;
  authorUsername?: string | null;
  authorAvatarUrl?: string | null;
};

export default function WorkStyleCard({
  role,
  cityLabel,
  remotePolicyLabel,
  workingHoursLabel,
  overtimePolicyLabel,
  saturdayPolicyLabel,
  comment,
  isAnonymous = true,
  authorUsername,
  authorAvatarUrl,
}: WorkStyleCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isLongComment = !!comment && comment.length > COMMENT_TRUNCATE_LENGTH;
  const displayedComment =
    isLongComment && !expanded
      ? comment!.slice(0, COMMENT_TRUNCATE_LENGTH).trimEnd() + "…"
      : comment;

  return (
    <div className="card-light rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
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

          <div>
            <h3 className="text-lg font-semibold text-[var(--text-dark)]">
              {role}
            </h3>

            <p className="text-xs text-[var(--muted-dark)] mt-0.5">
              {!isAnonymous && authorUsername ? `@${authorUsername}` : "anonim"}
            </p>
          </div>
        </div>

        <span className="shrink-0 rounded-md bg-[rgba(123,189,0,0.12)] px-2.5 py-1 text-xs font-medium text-[var(--text-dark)]">
          {remotePolicyLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-sm text-[var(--muted-dark)]">
        <p>
          Çalışma Saatleri:{" "}
          <span className="text-[var(--text-dark)]">{workingHoursLabel}</span>
        </p>

        <p>
          Çalışılan Şehir:{" "}
          <span className="text-[var(--text-dark)]">{cityLabel}</span>
        </p>

        <p>
          Fazla Mesai:{" "}
          <span className="text-[var(--text-dark)]">{overtimePolicyLabel}</span>
        </p>

        <p>
          Cumartesi:{" "}
          <span className="text-[var(--text-dark)]">{saturdayPolicyLabel}</span>
        </p>
      </div>

      {comment && (
        <>
          <p className="mt-3 text-sm text-[var(--text-dark)] whitespace-pre-wrap">
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
