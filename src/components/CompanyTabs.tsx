"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import SalaryCard from "@/components/SalaryCard";
import ReviewRatingBars from "./CompanyOverviewBars";
import ReviewFormSteps from "./forms/ReviewFormSteps";
import SalaryForm from "./forms/SalaryForm";
import WorkStyleForm from "./forms/WorkStyleForm";
import BenefitsForm from "./forms/BenefitsForm";
import CompensationForm from "./forms/CompensationForm";
import InterviewForm from "./forms/InterviewForm";
import LoadMoreButton from "./ui/LoadMoreButton";
import CompanyTabsNav from "./CompanyTabsNav";
import ContentEmptyState from "./ui/ContentEmptyState";
import SelectDropdown from "./forms/SelectDropdown";
import { getEmploymentStatusLabel } from "@/app/constants/reviewLabels";
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
import {
  OVERTIME_POLICY_LABELS,
  WORKING_HOURS_LABELS,
  SATURDAY_POLICY_LABELS,
  REMOTE_POLICY_LABELS,
  MEAL_POLICY_LABELS,
  TRANSPORTATION_POLICY_LABELS,
  PRIVATE_INSURANCE_LABELS,
  SALARY_STRUCTURE_LABELS,
  SALARY_RAISE_POLICY_LABELS,
  RAISE_FREQUENCY_LABELS,
  BONUS_POLICY_LABELS,
  PAYMENT_REGULAR_LABELS,
} from "@/app/constants/companyPolicyLabels";

const HELPFUL_VOTES_STORAGE_KEY = "insiderol_helpful_reviews";

type StatEntry = { label: string; count: number; percent: number };

// Single-select field (numeric id -> label map) aggregated into a
// percent-per-answer breakdown, sorted so the most common answer is first
// (used as the accordion's collapsed-state highlight).
function aggregateField(
  rows: any[],
  field: string,
  labels: Record<number, string>
): StatEntry[] {
  const counts: Record<string, number> = {};

  rows.forEach((row) => {
    const raw = row[field];
    const label = raw != null ? labels[raw] || "Bilinmiyor" : "Bilinmiyor";
    counts[label] = (counts[label] || 0) + 1;
  });

  const total = rows.length || 1;

  return Object.entries(counts)
    .map(([label, count]) => ({
      label,
      count,
      percent: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

// Multi-select fields (string[] columns) already store human-readable
// labels, so this just tallies occurrences rather than mapping ids.
function aggregateMultiField(rows: any[], field: string): StatEntry[] {
  const counts: Record<string, number> = {};

  rows.forEach((row) => {
    (row[field] || []).forEach((label: string) => {
      counts[label] = (counts[label] || 0) + 1;
    });
  });

  const respondents = rows.length || 1;

  return Object.entries(counts)
    .map(([label, count]) => ({
      label,
      count,
      percent: Math.round((count / respondents) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

function StatBreakdown({
  title,
  entries,
}: {
  title: string;
  entries: StatEntry[];
}) {
  if (entries.length === 0) return null;

  return (
    <div>
      <h4 className="text-sm font-medium text-[var(--text-dark)] mb-2">
        {title}
      </h4>

      <div className="space-y-1.5">
        {entries.map((entry) => (
          <div
            key={entry.label}
            className="flex justify-between text-sm text-[var(--muted-dark)]"
          >
            <span>{entry.label}</span>
            <span>{entry.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommentList({ comments }: { comments: string[] }) {
  if (comments.length === 0) return null;

  return (
    <div className="mt-5 pt-4 border-t border-black/5 space-y-3">
      <h4 className="text-sm font-medium text-[var(--text-dark)]">
        Yorumlar
      </h4>

      {comments.map((comment, index) => (
        <p
          key={index}
          className="text-sm text-[var(--muted-dark)] whitespace-pre-wrap"
        >
          {comment}
        </p>
      ))}
    </div>
  );
}

export default function CompanyTabs({
  companyId,
  companyName,
  hqCity,
  reviews,
  salaries,
  showNav = true,
  activeTab: externalActiveTab,
  setActiveTab: externalSetActiveTab,
}: {
  companyId: number;
  companyName: string;
  hqCity: number;
  reviews: any[];
  salaries: any[];
  showNav?: boolean;

  activeTab?: string;
  setActiveTab?: React.Dispatch<
    React.SetStateAction<string>
  >;
})

{
  const [activeTab, setActiveTab] = useState("yorum");
  const currentActiveTab = externalActiveTab ?? activeTab;
  const currentSetActiveTab = externalSetActiveTab ?? setActiveTab;
  const tabList = [
    "yorum",
    "maaş",
    "çalışma biçimi",
    "yan hak",
    "ücret politikası",
    "mülakat süreci",
  ];

  const ctaConfig: Record<string, { label: string; color: string }> = {
    "yorum": { label: "+ Yorum Paylaş", color: "cta-btn" },
    "maaş": { label: "+ Maaş Paylaş", color: "cta-btn" },
    "çalışma biçimi": { label: "+ Çalışma Biçimi Paylaş", color: "cta-btn" },
    "yan hak": { label: "+ Yan Hak Paylaş", color: "cta-btn" },
    "ücret politikası": { label: "+ Ücret Politikası Paylaş", color: "cta-btn" },
    "mülakat süreci": { label: "+ Mülakat Süreci Paylaş", color: "cta-btn" },
  };

  const currentCTA =
      ctaConfig[currentActiveTab] ||
      {
        label: "+ Ekle",
        color: "bg-zinc-700 hover:bg-zinc-600",
      };

  const [workStyles, setWorkStyles] = useState<any[]>([]);
  const [benefits, setBenefits] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);

  const [compensations, setCompensations] = useState<any[]>([]);

  // Local mutable copy of the server-fetched reviews so a "helpful" click
  // can bump the displayed count immediately without waiting for a refetch.
  // Re-synced whenever the `reviews` prop changes — a client-side nav
  // between two company pages can reuse this component instance without
  // remounting it (same as why workStyles/benefits/interviews below key
  // their fetch off companyId instead of running once).
  const [localReviews, setLocalReviews] = useState<any[]>(reviews);

  useEffect(() => {
    setLocalReviews(reviews);
  }, [reviews]);

  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewSort, setReviewSort] = useState<"mostHelpful" | "newest" | "highestRating">("newest");
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const REVIEWS_PER_PAGE = 10;

  const [showSalaryForm, setShowSalaryForm] = useState(false);
  const [showWorkStyleForm, setShowWorkStyleForm] = useState(false);
  const [showBenefitsForm, setShowBenefitsForm] = useState(false);
  const [showCompensationForm, setShowCompensationForm] = useState(false);
  const [showInterviewForm, setShowInterviewForm] = useState(false);

  const [clickedHelpful, setClickedHelpful] = useState<number[]>([]); // review.id array

  // Persist which reviews this browser has already voted "helpful" on so a
  // page refresh can't be used to vote again — hydrated client-side only,
  // same pattern as the form-draft localStorage usage elsewhere.
  useEffect(() => {
    const saved = localStorage.getItem(HELPFUL_VOTES_STORAGE_KEY);

    if (saved) {
      setClickedHelpful(JSON.parse(saved));
    }
  }, []);

  // -------------------- Role filter (applies to yorum/maaş/mülakat — not
  // to çalışma koşulları, which is a company-wide aggregate). Each tab
  // gets its own option list, scoped to that tab's own data — a role that
  // only has salary submissions shouldn't show up (and then dead-end) on
  // the Mülakat filter. The selection also resets on tab change so a
  // choice made on one tab can't silently produce a false "no results" on
  // another. --------------------
  const buildRoleOptions = (rows: any[]) => {
    const map = new Map<number, string>();

    rows.forEach((row) => {
      if (row.role_id && row.roles?.name) {
        map.set(row.role_id, row.roles.name);
      }
    });

    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "tr"));
  };

  const salaryRoleOptions = useMemo(
    () => buildRoleOptions(salaries),
    [salaries]
  );

  const reviewRoleOptions = useMemo(
    () => buildRoleOptions(localReviews),
    [localReviews]
  );

  const interviewRoleOptions = useMemo(
    () => buildRoleOptions(interviews),
    [interviews]
  );

  useEffect(() => {
    setSelectedRoleId(null);
  }, [currentActiveTab]);

  const filteredSalaries = useMemo(
    () =>
      selectedRoleId
        ? salaries.filter((s) => s.role_id === selectedRoleId)
        : salaries,
    [salaries, selectedRoleId]
  );

  const filteredInterviews = useMemo(
    () =>
      selectedRoleId
        ? interviews.filter((i) => i.role_id === selectedRoleId)
        : interviews,
    [interviews, selectedRoleId]
  );

  // -------------------- Review sort/filter --------------------
  const sortReviews = (reviews: any[]) => {
    switch (reviewSort) {
      case "mostHelpful":
        return [...reviews].sort(
          (a, b) => (b.helpful_count || 0) - (a.helpful_count || 0)
        );

      case "newest":
        return [...reviews].sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );

      case "highestRating":
        return [...reviews].sort(
          (a, b) => (b.overall_rating || 0) - (a.overall_rating || 0)
        );

      default:
        return reviews;
    }
  };

  const filterReviews = (reviews: any[]) => {
    if (!selectedRoleId) return reviews;
    return reviews.filter((r) => r.role_id === selectedRoleId);
  };

  const processedReviews = filterReviews(sortReviews(localReviews));
  const reviewsToShow = processedReviews.slice(0, reviewsPage * REVIEWS_PER_PAGE);

  const renderStars = (rating: number) => {
    const stars = [];
    const maxStars = 5;
    for (let i = 1; i <= maxStars; i++) {
      if (i <= Math.round(rating)) {
        stars.push(<AiFillStar key={i} className="text-amber-400 inline" />);
      } else {
        stars.push(<AiOutlineStar key={i} className="text-amber-400 inline" />);
      }
    }
    return stars;
  };

  // -------------------- DATA FETCH --------------------
  useEffect(() => {
    const fetchData = async () => {
      const { data: ws } = await supabase
        .from("company_work_style")
        .select("*")
        .eq("company_id", companyId)
        .eq("moderation_status", "approved")
        .eq("role_status", "approved")
        .eq("company_status", "approved");
      setWorkStyles(ws || []);

      const { data: b } = await supabase
        .from("company_benefits")
        .select("*")
        .eq("company_id", companyId)
        .eq("moderation_status", "approved")
        .eq("role_status", "approved")
        .eq("company_status", "approved");
      setBenefits(b || []);

      const { data: c } = await supabase
        .from("company_compensation")
        .select("*")
        .eq("company_id", companyId)
        .eq("moderation_status", "approved")
        .eq("role_status", "approved")
        .eq("company_status", "approved");
      setCompensations(c || []);
    };
    fetchData();
  }, [companyId]);

  useEffect(() => {
    const fetchInterviews = async () => {
      const { data } = await supabase
        .from("interview_experiences")
        .select("*, roles(name)")
        .eq("company_id", companyId)
        .eq("moderation_status", "approved")
        .eq("role_status", "approved")
        .eq("company_status", "approved")
        .order("created_at", { ascending: false });

      setInterviews(data || []);
    };

    fetchInterviews();
  }, [companyId]);

  // -------------------- Çalışma Koşulları aggregations --------------------
  const remoteEntries = aggregateField(workStyles, "remote_policy", REMOTE_POLICY_LABELS);
  const hoursEntries = aggregateField(workStyles, "working_hours", WORKING_HOURS_LABELS);
  const overtimeEntries = aggregateField(workStyles, "overtime_policy", OVERTIME_POLICY_LABELS);
  const saturdayEntries = aggregateField(workStyles, "saturday_policy", SATURDAY_POLICY_LABELS);
  const workStyleComments = workStyles.map((w) => w.comment?.trim()).filter(Boolean);

  const mealEntries = aggregateField(benefits, "meal_policy", MEAL_POLICY_LABELS);
  const transportEntries = aggregateField(benefits, "transportation_policy", TRANSPORTATION_POLICY_LABELS);
  const insuranceEntries = aggregateField(benefits, "private_insurance", PRIVATE_INSURANCE_LABELS);
  const equipmentEntries = aggregateMultiField(benefits, "equipment_support");
  const benefitsComments = benefits.map((b) => b.comment?.trim()).filter(Boolean);

  const structureEntries = aggregateField(compensations, "salary_structure", SALARY_STRUCTURE_LABELS);
  const raisePolicyEntries = aggregateField(compensations, "salary_raise_policy", SALARY_RAISE_POLICY_LABELS);
  const raiseFrequencyEntries = aggregateField(compensations, "raise_frequency", RAISE_FREQUENCY_LABELS);
  const bonusEntries = aggregateField(compensations, "bonus_policy", BONUS_POLICY_LABELS);
  const paymentEntries = aggregateField(compensations, "payment_regular", PAYMENT_REGULAR_LABELS);
  const extraSupportEntries = aggregateMultiField(compensations, "extra_support");
  const compensationComments = compensations.map((c) => c.comment?.trim()).filter(Boolean);

const isAnyFormOpen =
  currentActiveTab === "Yorum Ekle" ||
  showSalaryForm ||
  showWorkStyleForm ||
  showBenefitsForm ||
  showCompensationForm ||
  showInterviewForm;

  const salaryRoleFilterApplicable =
    currentActiveTab === "maaş" &&
    salaryRoleOptions.length > 1 &&
    !isAnyFormOpen;

  const reviewRoleFilterApplicable =
    currentActiveTab === "yorum" &&
    reviewRoleOptions.length > 1 &&
    !isAnyFormOpen;

  const interviewRoleFilterApplicable =
    currentActiveTab === "mülakat süreci" &&
    interviewRoleOptions.length > 1 &&
    !isAnyFormOpen;

  return (

    <div>
      {/* Tab Buttons */}
       {showNav && (

        <CompanyTabsNav
        activeTab={currentActiveTab}
        setActiveTab={currentSetActiveTab}
        tabList={tabList}
      />
        )}

       {/* Tab Content */}
      <div className="mt-4">
         {/* -------------------- JSX Salaries tab content-------------------- */}

             {currentActiveTab === "maaş" && (
                <>
                  {showSalaryForm ? (
                    <SalaryForm
                      companyId={companyId}
                      companyName={companyName}
                      onCancel={() =>
                        setShowSalaryForm(false)
                      }
                    />
                  ) : (
                    <>
                     {filteredSalaries.length > 0 && (
                       <div className="card-light rounded-2xl p-4 mb-4 flex items-center justify-between">
                         <span className="text-sm text-[var(--text-dark)]">
                           Maaş Aralığı
                         </span>

                         <span className="text-sm font-semibold text-[var(--accent)]">
                           ₺
                           {Math.min(
                             ...filteredSalaries.map(
                               (s) => Number(s.salary) || 0
                             )
                           ).toLocaleString("tr-TR")}{" "}
                           - ₺
                           {Math.max(
                             ...filteredSalaries.map(
                               (s) => Number(s.salary) || 0
                             )
                           ).toLocaleString("tr-TR")}
                         </span>
                       </div>
                     )}

                     {salaries?.length > 0 && (
                      <div className="flex items-center justify-between gap-3 mb-4">
                        {salaryRoleFilterApplicable ? (
                          <SelectDropdown
                            value={selectedRoleId}
                            onChange={setSelectedRoleId}
                            options={salaryRoleOptions}
                            placeholder="Tüm Pozisyonlar"
                            className="w-56"
                          />
                        ) : <div />}

                        {!isAnyFormOpen && (
                          <button
                            className={`company-cta-btn ${currentCTA.color} text-white/90`}
                            onClick={() => setShowSalaryForm(true)}
                          >
                            {currentCTA.label}
                          </button>
                        )}
                      </div>
                    )}

                    {filteredSalaries?.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-6">
                        {filteredSalaries.map((salary) => (
                          <SalaryCard
                            key={salary.id}
                            role={salary.roles?.name || "-"}
                            salary={Number(salary.salary) || 0}
                            experienceLabel={getExperienceYearsLabel(salary.experience_years)}
                            cityLabel={getCityName(salary.work_city)}
                            techStack={salary.tech_stack}
                            comment={salary.comment}
                          />
                        ))}
                      </div>
                    ) : (
                      <ContentEmptyState
                        title="Henüz maaş bilgisi paylaşılmamış!"
                        message="Bu şirket için ilk maaş bilgisini siz paylaşın."
                        buttonText="+ Maaş Paylaş"
                        buttonClassName="company-cta-btn cta-btn text-white/90 mt-5"
                        onButtonClick={() =>
                          setShowSalaryForm(true)
                        }
                      />
                    )}
                    </>
                  )}
                </>
              )}
        {/* -------------------- JSX Review tab content-------------------- */}

       {currentActiveTab === "yorum" && (
            <div className="flex flex-col gap-4">

                <ReviewRatingBars reviews={processedReviews} />

                {processedReviews.length === 0 && (
                  <ContentEmptyState
                    title="Henüz yorum paylaşılmamış!"
                    message="Bu şirket için ilk yorumu siz paylaşın."
                    buttonText="+ Yorum Paylaş"
                    buttonClassName="company-cta-btn cta-btn text-white/90 mt-5"
                    onButtonClick={() =>
                      currentSetActiveTab("Yorum Ekle")
                    }
                  />
                )}

                {/* Sort + Filter */}

                {processedReviews.length > 0 && (
                <div className="flex gap-2 mb-4 items-start justify-between">
                  <div className="flex gap-2 items-start">
                {/* Sort dropdown */}
                <SelectDropdown
                    value={reviewSort}
                    onChange={(value) => {
                      setReviewSort((value as any) || "newest");
                      setReviewsPage(1);
                    }}
                    options={[
                      { value: "newest", label: "Yeni → Eski" },
                      { value: "highestRating", label: "Yüksek Rating → Düşük" },
                      { value: "mostHelpful", label: "En Çok Yardımcı" },
                    ]}
                    className="w-48"
                />

                {reviewRoleFilterApplicable && (
                  <SelectDropdown
                    value={selectedRoleId}
                    onChange={(value) => {
                      setSelectedRoleId(value);
                      setReviewsPage(1);
                    }}
                    options={reviewRoleOptions}
                    placeholder="Tüm Pozisyonlar"
                    className="w-56"
                  />
                )}
                    </div>

                     {/* Sağ CTA Button */}
              {!isAnyFormOpen && (
                <div>
                  <button
                    className={`company-cta-btn ${currentCTA.color} text-white/90`}
                    onClick={() => currentSetActiveTab("Yorum Ekle")}
                  >
                    {currentCTA.label}
                  </button>
                </div>
              )}
                </div>
                )}
                {/* Review Cards */}
               {reviewsToShow.length > 0 &&
                  reviewsToShow.map((review) => (
                    <div
                      key={review.id}
                      className="card-light rounded-2xl p-4"
                    >
                      <h4 className="font-semibold text-lg text-[var(--text-dark)]">
                        {review.title}
                      </h4>

                      <p className="text-sm text-[var(--muted-dark)] mt-1">
                        {review.roles?.name || "-"} · {getEmploymentStatusLabel(review.employment_status)}
                      </p>

                      <p className="mt-2 text-[var(--text-dark)] whitespace-pre-wrap">
                        {review.review}
                      </p>

                      <div className="flex gap-3 mt-3 text-sm items-center flex-wrap text-[var(--muted-dark)]">
                        <div className="flex gap-1 mt-0 items-center group relative">
                          {renderStars(review.overall_rating || 0)}

                          <span className="absolute -top-6 left-0 card-light text-[var(--text-dark)] text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                            Ortalama: {review.overall_rating}
                          </span>
                        </div>

                        <span>
                          Yönetim: {review.management}/5
                        </span>

                        <span>
                          Kariyer: {review.career_growth}/5
                        </span>

                        <button
                          className={`cursor-pointer px-2 py-1 rounded ${
                            clickedHelpful.includes(review.id)
                              ? "bg-[var(--accent)] text-white"
                              : "bg-black/5 text-[var(--text-dark)] hover:bg-black/10"
                          }`}
                          onClick={async () => {
                            if (clickedHelpful.includes(review.id))
                              return;

                            const { error } = await supabase.rpc(
                              "increment_review_helpful_count",
                              { review_id: review.id }
                            );

                            if (error) {
                              console.error(
                                "helpful_count update failed:",
                                error
                              );
                              return;
                            }

                            const updatedClicked = [
                              ...clickedHelpful,
                              review.id,
                            ];

                            setClickedHelpful(updatedClicked);

                            localStorage.setItem(
                              HELPFUL_VOTES_STORAGE_KEY,
                              JSON.stringify(updatedClicked)
                            );

                            setLocalReviews((prev) =>
                              prev.map((r) =>
                                r.id === review.id
                                  ? {
                                      ...r,
                                      helpful_count:
                                        (r.helpful_count || 0) + 1,
                                    }
                                  : r
                              )
                            );
                          }}
                        >
                          👍 {review.helpful_count || 0}
                        </button>

                      </div>
                    </div>
                  ))}

                {/* Load More */}
                {reviewsToShow.length < processedReviews.length && (

                  <LoadMoreButton
                    onClick={() =>
                      setReviewsPage(
                        reviewsPage + 1
                      )
                    }
                  />

                )}
            </div>
            )}

        {/* -------------------- JSX Work Style tab content -------------------- */}

        {currentActiveTab === "çalışma biçimi" && (
          <>
            {showWorkStyleForm ? (
              <WorkStyleForm
                companyId={companyId}
                companyName={companyName}
                onCancel={() => setShowWorkStyleForm(false)}
              />
            ) : (
              <>
                {workStyles.length > 0 && !isAnyFormOpen && (
                  <div className="flex justify-end mb-4">
                    <button
                      className={`company-cta-btn ${currentCTA.color} text-white/90`}
                      onClick={() => setShowWorkStyleForm(true)}
                    >
                      {currentCTA.label}
                    </button>
                  </div>
                )}

                {workStyles.length > 0 ? (
                  <div className="card-light rounded-2xl p-5 md:p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <StatBreakdown title="Çalışma Şekli" entries={remoteEntries} />
                      <StatBreakdown title="Çalışma Saatleri" entries={hoursEntries} />
                      <StatBreakdown title="Fazla Mesai Sıklığı" entries={overtimeEntries} />
                      <StatBreakdown title="Cumartesi Çalışması" entries={saturdayEntries} />
                    </div>

                    <CommentList comments={workStyleComments} />
                  </div>
                ) : (
                  <ContentEmptyState
                    title="Henüz çalışma biçimi bilgisi paylaşılmamış!"
                    message="Bu şirket için ilk çalışma biçimi bilgisini siz paylaşın."
                    buttonText="+ Çalışma Biçimi Paylaş"
                    buttonClassName="company-cta-btn cta-btn text-white/90 mt-5"
                    onButtonClick={() => setShowWorkStyleForm(true)}
                  />
                )}
              </>
            )}
          </>
        )}

        {/* -------------------- JSX Benefits tab content -------------------- */}

        {currentActiveTab === "yan hak" && (
          <>
            {showBenefitsForm ? (
              <BenefitsForm
                companyId={companyId}
                companyName={companyName}
                onCancel={() => setShowBenefitsForm(false)}
              />
            ) : (
              <>
                {benefits.length > 0 && !isAnyFormOpen && (
                  <div className="flex justify-end mb-4">
                    <button
                      className={`company-cta-btn ${currentCTA.color} text-white/90`}
                      onClick={() => setShowBenefitsForm(true)}
                    >
                      {currentCTA.label}
                    </button>
                  </div>
                )}

                {benefits.length > 0 ? (
                  <div className="card-light rounded-2xl p-5 md:p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <StatBreakdown title="Yemek Desteği" entries={mealEntries} />
                      <StatBreakdown title="Ulaşım Desteği" entries={transportEntries} />
                      <StatBreakdown title="Özel Sağlık Sigortası" entries={insuranceEntries} />
                      <StatBreakdown title="Ekipman Desteği" entries={equipmentEntries} />
                    </div>

                    <CommentList comments={benefitsComments} />
                  </div>
                ) : (
                  <ContentEmptyState
                    title="Henüz yan hak bilgisi paylaşılmamış!"
                    message="Bu şirket için ilk yan hak bilgisini siz paylaşın."
                    buttonText="+ Yan Hak Paylaş"
                    buttonClassName="company-cta-btn cta-btn text-white/90 mt-5"
                    onButtonClick={() => setShowBenefitsForm(true)}
                  />
                )}
              </>
            )}
          </>
        )}

        {/* -------------------- JSX Compensation tab content -------------------- */}

        {currentActiveTab === "ücret politikası" && (
          <>
            {showCompensationForm ? (
              <CompensationForm
                companyId={companyId}
                companyName={companyName}
                onCancel={() => setShowCompensationForm(false)}
              />
            ) : (
              <>
                {compensations.length > 0 && !isAnyFormOpen && (
                  <div className="flex justify-end mb-4">
                    <button
                      className={`company-cta-btn ${currentCTA.color} text-white/90`}
                      onClick={() => setShowCompensationForm(true)}
                    >
                      {currentCTA.label}
                    </button>
                  </div>
                )}

                {compensations.length > 0 ? (
                  <div className="card-light rounded-2xl p-5 md:p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <StatBreakdown title="Yıllık Maaş Sistemi" entries={structureEntries} />
                      <StatBreakdown title="Zam Sistemi" entries={raisePolicyEntries} />
                      <StatBreakdown title="Zam Sıklığı" entries={raiseFrequencyEntries} />
                      <StatBreakdown title="Prim Sistemi" entries={bonusEntries} />
                      <StatBreakdown title="Maaş Ödeme Düzeni" entries={paymentEntries} />
                      <StatBreakdown title="Ek Finansal Destek" entries={extraSupportEntries} />
                    </div>

                    <CommentList comments={compensationComments} />
                  </div>
                ) : (
                  <ContentEmptyState
                    title="Henüz ücret politikası bilgisi paylaşılmamış!"
                    message="Bu şirket için ilk ücret politikası bilgisini siz paylaşın."
                    buttonText="+ Ücret Politikası Paylaş"
                    buttonClassName="company-cta-btn cta-btn text-white/90 mt-5"
                    onButtonClick={() => setShowCompensationForm(true)}
                  />
                )}
              </>
            )}
          </>
        )}

        {/* -------------------- JSX Interview tab content -------------------- */}

        {currentActiveTab === "mülakat süreci" && (
            <>
            {showInterviewForm ? (
              <InterviewForm
                companyId={companyId}
                companyName={companyName}
                onCancel={() =>
                  setShowInterviewForm(false)
                }
              />
            ) : (
             <>
              {interviews.length > 0 && (
                <div className="flex items-center justify-between gap-3 mb-4">
                  {interviewRoleFilterApplicable ? (
                    <SelectDropdown
                      value={selectedRoleId}
                      onChange={setSelectedRoleId}
                      options={interviewRoleOptions}
                      placeholder="Tüm Pozisyonlar"
                      className="w-56"
                    />
                  ) : <div />}

                  {!isAnyFormOpen && (
                    <button
                      className={`company-cta-btn ${currentCTA.color} text-white/90`}
                      onClick={() => setShowInterviewForm(true)}
                    >
                      {currentCTA.label}
                    </button>
                  )}
                </div>
              )}

              {filteredInterviews.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {filteredInterviews.map((interview) => (
                    <div
                      key={interview.id}
                      className="card-light rounded-2xl p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-semibold text-[var(--text-dark)]">
                            {interview.title}
                          </h4>

                          <p className="text-sm text-[var(--muted-dark)] mt-1">
                            {interview.roles?.name || "-"}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-md bg-[rgba(123,189,0,0.10)] px-3 py-1 text-sm font-medium text-[var(--text-dark)]">
                          {DIFFICULTY_LABELS[interview.difficulty] || "-"}
                        </span>
                      </div>

                      <p className="mt-3 text-[15px] leading-7 text-[var(--text-dark)] whitespace-pre-wrap">
                        {interview.experience}
                      </p>

                      <div className="mt-4 pt-4 border-t border-black/5 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-[var(--muted-dark)]">
                        <div className="flex justify-between">
                          <span>Seviye</span>
                          <span>{SENIORITY_LABELS[interview.seniority] || "-"}</span>
                        </div>

                        <div className="flex justify-between">
                          <span>Süreç</span>
                          <span>{PROCESS_LENGTH_LABELS[interview.process_length] || "-"}</span>
                        </div>

                        <div className="flex justify-between">
                          <span>Format</span>
                          <span>{INTERVIEW_FORMAT_LABELS[interview.interview_format] || "-"}</span>
                        </div>

                        <div className="flex justify-between">
                          <span>Maaş Aralığı</span>
                          <span>{SALARY_RANGE_LABELS[interview.salary_range] || "-"}</span>
                        </div>

                        <div className="flex justify-between">
                          <span>Yıl</span>
                          <span>{interview.application_year || "-"}</span>
                        </div>

                        <div className="flex justify-between">
                          <span>Şehir</span>
                          <span>{getCityName(interview.work_city)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <ContentEmptyState
                  title="Henüz mülakat deneyimi paylaşılmamış!"
                  message="Bu şirket için ilk mülakat deneyimini siz paylaşın."
                  buttonText="+ Mülakat Süreci Paylaş"
                  buttonClassName="company-cta-btn cta-btn text-white/90 mt-5"
                  onButtonClick={() =>
                    setShowInterviewForm(true)
                  }
                />
              )}
            </>
            )}
          </>
        )}


        {/* --- Yorum Ekle Button --- */}
        {currentActiveTab === "Yorum Ekle" && (
          <>
            <ReviewFormSteps
              companyId={companyId}
              companyName={companyName}
              onSubmit={() =>
                currentSetActiveTab("yorum")
              }
              onCancel={() =>
                currentSetActiveTab("yorum")
              }
            />
          </>
        )}
      </div>
    </div>
  );
}
