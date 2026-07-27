"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Ghost } from "lucide-react";
import { formatRelativeTime } from "@/app/constants/formatRelativeTime";
import {
  getEmploymentStatusLabel,
  renderStars,
} from "@/app/constants/reviewLabels";
import {
  getExperienceYearsLabel,
  getCityName,
} from "@/app/constants/lookupHelpers";
import {
  SENIORITY_LABELS,
  PROCESS_LENGTH_LABELS,
  DIFFICULTY_LABELS,
  INTERVIEW_FORMAT_LABELS,
  SALARY_RANGE_LABELS,
} from "@/app/constants/interviewLabels";

export type FeedItem = {
  kind: "salary" | "review" | "interview";
  id: number;
  createdAt: string;
  companySlug: string;
  companyName: string;
  roleName: string;
  salary?: number;
  title?: string;
  review?: string;
  overallRating?: number;
  // Server-only — used to batch the author-profile lookup in page.tsx,
  // then stripped before pagedItems reaches this client component (a raw
  // user_id has no reason to ever cross that boundary, anonymous or not).
  userId?: string;
  isAnonymous: boolean;
  authorUsername?: string | null;
  authorAvatarUrl?: string | null;

  // review details
  experienceYears?: number | null;
  workCity?: number | null;
  employmentStatus?: number | null;
  wouldRecommend?: boolean | null;
  workLifeBalance?: number;
  management?: number;
  careerGrowth?: number;
  workEnvironment?: number;
  transparency?: number;
  employeeValue?: number;

  // salary details
  salarySatisfaction?: number | null;
  techStack?: string | null;
  comment?: string | null;

  // interview details
  experience?: string;
  seniority?: number | null;
  processLength?: number | null;
  difficulty?: number | null;
  interviewFormat?: number | null;
  salaryRange?: number | null;
  applicationYear?: number | null;
  interviewStages?: string[] | null;
  assessmentTypes?: string[] | null;
};

const TAB_BY_KIND: Record<FeedItem["kind"], string> = {
  salary: "maaş",
  review: "yorum",
  interview: "mülakat süreci",
};

export default function FeedCard({ item }: { item: FeedItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card-light card-compact rounded-2xl transition">
      <Link
        href={`/companies/${item.companySlug}?tab=${TAB_BY_KIND[item.kind]}`}
        className="block"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-[var(--surface-2)] flex items-center justify-center shrink-0 overflow-hidden">
            {!item.isAnonymous && item.authorAvatarUrl ? (
              <img
                src={item.authorAvatarUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <Ghost size={16} className="text-[var(--accent)]" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[var(--text-dark)] truncate">
                {item.companyName} · {item.roleName}
              </p>

              <span className="text-xs text-[var(--muted-dark)] shrink-0">
                {formatRelativeTime(item.createdAt)}
              </span>
            </div>

            <p className="mt-0.5 text-xs text-[var(--muted-dark)] truncate">
              {!item.isAnonymous && item.authorUsername
                ? `@${item.authorUsername}`
                : "anonim"}
            </p>

            {item.kind === "salary" && (
              <p className="mt-1 text-lg font-semibold text-[var(--accent)]">
                {(item.salary || 0).toLocaleString("tr-TR")}₺
              </p>
            )}

            {item.kind === "review" && (
              <>
                {item.overallRating != null && (
                  <p className="mt-1 text-sm text-amber-500 tracking-wide">
                    {"★".repeat(Math.round(item.overallRating))}
                    {"☆".repeat(5 - Math.round(item.overallRating))}
                  </p>
                )}

                {item.review && (
                  <p className="mt-1 text-sm text-[var(--muted-dark)] line-clamp-2">
                    {item.review}
                  </p>
                )}
              </>
            )}

            {item.kind === "interview" && (
              <>
                {item.title && (
                  <p className="mt-1 text-sm font-semibold text-[var(--text-dark)] truncate">
                    {item.title}
                  </p>
                )}

                {item.difficulty != null && (
                  <p className="mt-0.5 text-xs text-amber-600">
                    Zorluk: {DIFFICULTY_LABELS[item.difficulty] || "-"}
                  </p>
                )}

                {item.experience && (
                  <p className="mt-1 text-sm text-[var(--muted-dark)] line-clamp-2">
                    {item.experience}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </Link>

      {expanded && (
        <div className="mt-3 space-y-2 rounded-xl bg-black/[0.04] border border-black/5 text-[var(--text-dark)] text-xs p-4">
          {item.kind === "review" && (
            <>
              <div className="flex justify-between">
                <span>Deneyim</span>
                <span>{getExperienceYearsLabel(item.experienceYears)}</span>
              </div>

              <div className="flex justify-between">
                <span>Çalışılan Şehir</span>
                <span>{getCityName(item.workCity)}</span>
              </div>

              <div className="flex justify-between">
                <span>Çalışma Durumu</span>
                <span>
                  {getEmploymentStatusLabel(item.employmentStatus ?? null)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Tavsiye Durumu</span>
                <span>
                  {item.wouldRecommend === true
                    ? "Evet"
                    : item.wouldRecommend === false
                      ? "Hayır"
                      : "-"}
                </span>
              </div>

              <div className="flex justify-between">
                <span>İş-Yaşam Dengesi</span>
                <span>{renderStars(item.workLifeBalance || 0)}</span>
              </div>

              <div className="flex justify-between">
                <span>Yönetim</span>
                <span>{renderStars(item.management || 0)}</span>
              </div>

              <div className="flex justify-between">
                <span>Kariyer Gelişimi</span>
                <span>{renderStars(item.careerGrowth || 0)}</span>
              </div>

              <div className="flex justify-between">
                <span>Çalışma Ortamı</span>
                <span>{renderStars(item.workEnvironment || 0)}</span>
              </div>

              <div className="flex justify-between">
                <span>Şeffaflık</span>
                <span>{renderStars(item.transparency || 0)}</span>
              </div>

              <div className="flex justify-between">
                <span>Çalışana Değer</span>
                <span>{renderStars(item.employeeValue || 0)}</span>
              </div>
            </>
          )}

          {item.kind === "salary" && (
            <>
              <div className="flex justify-between">
                <span>Deneyim</span>
                <span>{getExperienceYearsLabel(item.experienceYears)}</span>
              </div>

              <div className="flex justify-between">
                <span>Çalışılan Şehir</span>
                <span>{getCityName(item.workCity)}</span>
              </div>

              <div className="flex justify-between">
                <span>Maaş Memnuniyeti</span>
                <span>{renderStars(item.salarySatisfaction || 0)}</span>
              </div>

              {item.techStack && (
                <div className="flex justify-between gap-4">
                  <span className="shrink-0">Tech Stack</span>
                  <span className="text-right">{item.techStack}</span>
                </div>
              )}

              {item.comment && (
                <div className="pt-1 border-t border-black/5">
                  <p className="mt-2 whitespace-pre-wrap">{item.comment}</p>
                </div>
              )}
            </>
          )}

          {item.kind === "interview" && (
            <>
              <div className="flex justify-between">
                <span>Seviye</span>
                <span>{SENIORITY_LABELS[item.seniority || 0] || "-"}</span>
              </div>

              <div className="flex justify-between">
                <span>Çalışılan Şehir</span>
                <span>{getCityName(item.workCity)}</span>
              </div>

              <div className="flex justify-between">
                <span>Süreç Uzunluğu</span>
                <span>
                  {PROCESS_LENGTH_LABELS[item.processLength || 0] || "-"}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Mülakat Formatı</span>
                <span>
                  {INTERVIEW_FORMAT_LABELS[item.interviewFormat || 0] || "-"}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Maaş Aralığı</span>
                <span>
                  {SALARY_RANGE_LABELS[item.salaryRange || 0] || "-"}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Başvuru Yılı</span>
                <span>{item.applicationYear || "-"}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="shrink-0">Değerlendirme Türleri</span>
                <span className="text-right">
                  {item.assessmentTypes?.length
                    ? item.assessmentTypes.join(", ")
                    : "-"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="shrink-0">Mülakat Aşamaları</span>
                <span className="text-right">
                  {item.interviewStages?.length
                    ? item.interviewStages.join(", ")
                    : "-"}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="mt-2 flex items-center gap-1 text-xs font-medium text-[var(--primary)] hover:opacity-80"
      >
        {expanded ? (
          <>
            Detayları Gizle <ChevronUp size={14} />
          </>
        ) : (
          <>
            Detayları Göster <ChevronDown size={14} />
          </>
        )}
      </button>
    </div>
  );
}
