"use client";

import { useState } from "react";
import { Ghost } from "lucide-react";
import {
  SENIORITY_LABELS,
  PROCESS_LENGTH_LABELS,
  DIFFICULTY_LABELS,
  INTERVIEW_FORMAT_LABELS,
  SALARY_RANGE_LABELS,
} from "@/app/constants/interviewLabels";
import { getCityName } from "@/app/constants/lookupHelpers";

// Same truncate-then-expand threshold as SalaryCard/WorkStyleCard/etc, but
// clamped by CSS line-count rather than a character slice — the experience
// text is a long personal narrative (like a review body), not a short
// secondary comment, so it gets ReviewCard's treatment instead.
const EXPERIENCE_TRUNCATE_LENGTH = 220;

type InterviewCardProps = {
  interview: any;
};

export default function InterviewCard({ interview }: InterviewCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isLongExperience =
    (interview.experience?.length || 0) > EXPERIENCE_TRUNCATE_LENGTH;

  return (
    <div className="card-light rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[var(--surface-2)] flex items-center justify-center shrink-0 overflow-hidden">
            {!interview.is_anonymous && interview.authorAvatarUrl ? (
              <img
                src={interview.authorAvatarUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <Ghost size={14} className="text-[var(--accent)]" />
            )}
          </div>

          <div className="min-w-0">
            <h4 className="font-semibold text-lg text-[var(--text-dark)] truncate">
              {interview.title}
            </h4>

            <p className="text-sm text-[var(--muted-dark)] mt-1">
              {interview.roles?.name || "-"}
            </p>

            <p className="text-xs text-[var(--muted-dark)] mt-0.5">
              {!interview.is_anonymous && interview.authorUsername
                ? `@${interview.authorUsername}`
                : "anonim"}
            </p>
          </div>
        </div>

        <span className="shrink-0 rounded-md bg-[rgba(123,189,0,0.10)] px-2.5 py-1 text-xs font-medium text-[var(--text-dark)]">
          {DIFFICULTY_LABELS[interview.difficulty] || "-"}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-x-4 gap-y-1 text-sm text-[var(--muted-dark)]">
        <p>
          Seviye:{" "}
          <span className="text-[var(--text-dark)]">
            {SENIORITY_LABELS[interview.seniority] || "-"}
          </span>
        </p>

        <p>
          Süreç:{" "}
          <span className="text-[var(--text-dark)]">
            {PROCESS_LENGTH_LABELS[interview.process_length] || "-"}
          </span>
        </p>

        <p>
          Format:{" "}
          <span className="text-[var(--text-dark)]">
            {INTERVIEW_FORMAT_LABELS[interview.interview_format] || "-"}
          </span>
        </p>

        <p>
          Maaş Aralığı:{" "}
          <span className="text-[var(--text-dark)]">
            {SALARY_RANGE_LABELS[interview.salary_range] || "-"}
          </span>
        </p>

        <p>
          Yıl:{" "}
          <span className="text-[var(--text-dark)]">
            {interview.application_year || "-"}
          </span>
        </p>

        <p>
          Çalışılan Şehir:{" "}
          <span className="text-[var(--text-dark)]">
            {getCityName(interview.work_city)}
          </span>
        </p>
      </div>

      <p
        className={`mt-3 text-sm text-[var(--text-dark)] whitespace-pre-wrap ${
          !expanded ? "line-clamp-2" : ""
        }`}
      >
        {interview.experience}
      </p>

      {isLongExperience && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-1 text-xs font-medium text-[var(--accent)] hover:underline"
        >
          {expanded ? "Daha az göster" : "Devamını göster"}
        </button>
      )}
    </div>
  );
}
