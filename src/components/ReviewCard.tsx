"use client";

import { useState } from "react";
import { Ghost, Check, X } from "lucide-react";
import { formatRelativeTime } from "@/app/constants/formatRelativeTime";
import {
  getEmploymentStatusLabel,
  renderStars,
} from "@/app/constants/reviewLabels";
import {
  getExperienceYearsLabel,
  getCityName,
} from "@/app/constants/lookupHelpers";

type ReviewCardProps = {
  review: any;
  isHelpfulClicked: boolean;
  onHelpfulClick: () => void;
};

export default function ReviewCard({
  review,
  isHelpfulClicked,
  onHelpfulClick,
}: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card-light rounded-2xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[var(--surface-2)] flex items-center justify-center shrink-0 overflow-hidden">
            {!review.is_anonymous && review.authorAvatarUrl ? (
              <img
                src={review.authorAvatarUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <Ghost size={14} className="text-[var(--accent)]" />
            )}
          </div>

          <div className="min-w-0">
            <h4 className="font-semibold text-lg text-[var(--text-dark)] truncate">
              {review.title}
            </h4>

            <p className="text-sm text-[var(--muted-dark)] mt-1">
              {review.roles?.name || "-"} · {getEmploymentStatusLabel(review.employment_status)}
            </p>

            <p className="text-xs text-[var(--muted-dark)] mt-0.5">
              {!review.is_anonymous && review.authorUsername
                ? `@${review.authorUsername}`
                : "anonim"}{" "}
              · {formatRelativeTime(review.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap sm:shrink-0">
          <span className="rounded-md bg-[rgba(123,189,0,0.12)] px-2.5 py-1 text-xs font-medium text-[var(--text-dark)]">
            Genel Puan ⭐{review.overall_rating}/5
          </span>

          {review.would_recommend != null && (
            <span
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium ${
                review.would_recommend
                  ? "bg-[rgba(123,189,0,0.12)] text-[var(--text-dark)]"
                  : "bg-red-500/10 text-[var(--text-dark)]"
              }`}
            >
              {review.would_recommend ? (
                <Check
                  size={14}
                  strokeWidth={2.5}
                  className="text-[var(--accent)]"
                />
              ) : (
                <X size={14} strokeWidth={2.5} className="text-red-600" />
              )}
              Tavsiye
            </span>
          )}
        </div>
      </div>

      <p
        className={`mt-2 text-sm text-[var(--text-dark)] whitespace-pre-wrap ${
          !expanded ? "line-clamp-2" : ""
        }`}
      >
        {review.review}
      </p>

      {expanded && (
        <div className="mt-3 space-y-2 rounded-xl bg-black/[0.04] border border-black/5 text-[var(--text-dark)] text-xs p-4">
          <div className="flex justify-between">
            <span>Deneyim</span>
            <span>{getExperienceYearsLabel(review.experience_years)}</span>
          </div>

          <div className="flex justify-between">
            <span>Çalışılan Şehir</span>
            <span>{getCityName(review.work_city)}</span>
          </div>

          <div className="flex justify-between">
            <span>İş-Yaşam Dengesi</span>
            <span>{renderStars(review.work_life_balance)}</span>
          </div>

          <div className="flex justify-between">
            <span>Yönetim Kalitesi</span>
            <span>{renderStars(review.management)}</span>
          </div>

          <div className="flex justify-between">
            <span>Kariyer Gelişimi</span>
            <span>{renderStars(review.career_growth)}</span>
          </div>

          <div className="flex justify-between">
            <span>Çalışma Ortamı</span>
            <span>{renderStars(review.work_environment)}</span>
          </div>

          <div className="flex justify-between">
            <span>İletişim Şeffaflığı</span>
            <span>{renderStars(review.transparency)}</span>
          </div>

          <div className="flex justify-between">
            <span>Çalışana Değer</span>
            <span>{renderStars(review.employee_value)}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="text-sm font-medium text-[var(--primary)] hover:opacity-80"
        >
          {expanded ? "↑ Detayları Gizle" : "↓ Detayları Göster"}
        </button>

        <button
          type="button"
          aria-pressed={isHelpfulClicked}
          className="cursor-pointer px-2 py-1 rounded text-sm bg-transparent text-[var(--text-dark)] hover:bg-black/10"
          onClick={onHelpfulClick}
        >
          👍 {review.helpful_count || 0}
        </button>
      </div>
    </div>
  );
}
