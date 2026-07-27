"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import SalaryCard from "@/components/SalaryCard";
import WorkStyleCard from "@/components/WorkStyleCard";
import BenefitsCard from "@/components/BenefitsCard";
import CompensationCard from "@/components/CompensationCard";
import InterviewCard from "@/components/InterviewCard";
import RatingBar from "@/components/RatingBar";
import ReviewCard from "@/components/ReviewCard";
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
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "tr"));
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
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "tr"));
}

// Client-side counterpart of the /explore and /my-posts author-batching —
// this tab's rows are fetched in the browser (not server-rendered), so the
// same "one profiles lookup for every non-anonymous row" trick runs here
// instead. Anonymous rows are left untouched, same privacy rule as elsewhere.
async function attachAuthors(rows: any[]): Promise<any[]> {
  const userIds = Array.from(
    new Set(
      rows.filter((row) => !row.is_anonymous && row.user_id).map((row) => row.user_id)
    )
  );

  if (userIds.length === 0) return rows;

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")
    .in("id", userIds);

  const profileByUserId = new Map(
    (profiles || []).map((profile: any) => [profile.id, profile])
  );

  return rows.map((row) => {
    const { user_id, ...rest } = row;

    if (row.is_anonymous || !user_id) return rest;

    const profile = profileByUserId.get(user_id);

    return {
      ...rest,
      authorUsername: profile?.username ?? null,
      authorAvatarUrl: profile?.avatar_url ?? null,
    };
  });
}

// Entries arrive sorted most-common-first (ties broken alphabetically), so
// showing just entries[0] reduces each category to a single "what most
// people said" bar instead of a bar per possible answer — with 4-6
// categories per tab, a bar-per-answer layout turned into an unreadable
// wall of bars.
function StatBreakdown({
  title,
  entries,
}: {
  title: string;
  entries: StatEntry[];
}) {
  if (entries.length === 0) return null;

  const top = entries[0];

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-[var(--text-dark)]">{title}</span>
        <span className="text-[var(--muted-dark)]">
          {top.label} · {top.percent}%
        </span>
      </div>

      <div className="h-1.5 rounded-full bg-black/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--accent)]"
          style={{ width: `${Math.min(100, top.percent)}%` }}
        />
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
  const [salariesPage, setSalariesPage] = useState(1);
  const [workStylesPage, setWorkStylesPage] = useState(1);
  const [benefitsPage, setBenefitsPage] = useState(1);
  const [compensationsPage, setCompensationsPage] = useState(1);
  const [interviewsPage, setInterviewsPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [reviewSort, setReviewSort] = useState<"mostHelpful" | "newest" | "highestRating">("newest");
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<number | null>(null);
  const [selectedEmploymentStatus, setSelectedEmploymentStatus] = useState<number | null>(null);
  const [selectedRecommend, setSelectedRecommend] = useState<string | null>(null);
  const REVIEWS_PER_PAGE = 10;

  const [showSalaryForm, setShowSalaryForm] = useState(false);
  const [showWorkStyleForm, setShowWorkStyleForm] = useState(false);
  const [showBenefitsForm, setShowBenefitsForm] = useState(false);
  const [showCompensationForm, setShowCompensationForm] = useState(false);
  const [showInterviewForm, setShowInterviewForm] = useState(false);

  const [clickedHelpful, setClickedHelpful] = useState<number[]>([]); // review.id array
  const pendingHelpfulRef = useRef<Set<number>>(new Set()); // review.id currently mid-request, blocks double-clicks

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

  // City/experience options are built the same way as role options — only
  // values actually present in this company's rows, so a filter can never
  // select its way into a dead-end "0 results" state.
  const buildCityOptions = (rows: any[]) => {
    const ids = new Set<number>();

    rows.forEach((row) => {
      if (row.work_city) ids.add(row.work_city);
    });

    return Array.from(ids)
      .map((id) => ({ value: id, label: getCityName(id) }))
      .sort((a, b) => a.label.localeCompare(b.label, "tr"));
  };

  const buildExperienceOptions = (rows: any[]) => {
    const ids = new Set<number>();

    rows.forEach((row) => {
      if (row.experience_years) ids.add(row.experience_years);
    });

    return Array.from(ids)
      .map((id) => ({ value: id, label: getExperienceYearsLabel(id) }))
      .sort((a, b) => a.value - b.value);
  };

  const workStyleRoleOptions = useMemo(
    () => buildRoleOptions(workStyles),
    [workStyles]
  );

  const benefitsRoleOptions = useMemo(
    () => buildRoleOptions(benefits),
    [benefits]
  );

  const compensationRoleOptions = useMemo(
    () => buildRoleOptions(compensations),
    [compensations]
  );

  const salaryCityOptions = useMemo(
    () => buildCityOptions(salaries),
    [salaries]
  );

  const workStyleCityOptions = useMemo(
    () => buildCityOptions(workStyles),
    [workStyles]
  );

  const benefitsCityOptions = useMemo(
    () => buildCityOptions(benefits),
    [benefits]
  );

  const compensationCityOptions = useMemo(
    () => buildCityOptions(compensations),
    [compensations]
  );

  const interviewCityOptions = useMemo(
    () => buildCityOptions(interviews),
    [interviews]
  );

  const salaryExperienceOptions = useMemo(
    () => buildExperienceOptions(salaries),
    [salaries]
  );

  const reviewCityOptions = useMemo(
    () => buildCityOptions(localReviews),
    [localReviews]
  );

  const reviewExperienceOptions = useMemo(
    () => buildExperienceOptions(localReviews),
    [localReviews]
  );

  const reviewEmploymentStatusOptions = useMemo(() => {
    const ids = new Set<number>();

    localReviews.forEach((r) => {
      if (r.employment_status) ids.add(r.employment_status);
    });

    return Array.from(ids)
      .map((id) => ({ value: id, label: getEmploymentStatusLabel(id) }))
      .sort((a, b) => a.value - b.value);
  }, [localReviews]);

  const reviewRecommendOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];

    if (localReviews.some((r) => r.would_recommend === true)) {
      options.push({ value: "yes", label: "Tavsiye Ediyor" });
    }

    if (localReviews.some((r) => r.would_recommend === false)) {
      options.push({ value: "no", label: "Tavsiye Etmiyor" });
    }

    return options;
  }, [localReviews]);

  useEffect(() => {
    setSelectedRoleId(null);
    setSelectedCity(null);
    setSelectedExperience(null);
    setSelectedEmploymentStatus(null);
    setSelectedRecommend(null);
    setSalariesPage(1);
    setWorkStylesPage(1);
    setBenefitsPage(1);
    setCompensationsPage(1);
    setInterviewsPage(1);
  }, [currentActiveTab]);

  const filteredSalaries = useMemo(
    () =>
      salaries.filter(
        (s) =>
          (!selectedRoleId || s.role_id === selectedRoleId) &&
          (!selectedCity || s.work_city === selectedCity) &&
          (!selectedExperience || s.experience_years === selectedExperience)
      ),
    [salaries, selectedRoleId, selectedCity, selectedExperience]
  );

  const filteredWorkStyles = useMemo(
    () =>
      workStyles.filter(
        (w) =>
          (!selectedRoleId || w.role_id === selectedRoleId) &&
          (!selectedCity || w.work_city === selectedCity)
      ),
    [workStyles, selectedRoleId, selectedCity]
  );

  const filteredBenefits = useMemo(
    () =>
      benefits.filter(
        (b) =>
          (!selectedRoleId || b.role_id === selectedRoleId) &&
          (!selectedCity || b.work_city === selectedCity)
      ),
    [benefits, selectedRoleId, selectedCity]
  );

  const filteredCompensations = useMemo(
    () =>
      compensations.filter(
        (c) =>
          (!selectedRoleId || c.role_id === selectedRoleId) &&
          (!selectedCity || c.work_city === selectedCity)
      ),
    [compensations, selectedRoleId, selectedCity]
  );

  const filteredInterviews = useMemo(
    () =>
      interviews.filter(
        (i) =>
          (!selectedRoleId || i.role_id === selectedRoleId) &&
          (!selectedCity || i.work_city === selectedCity)
      ),
    [interviews, selectedRoleId, selectedCity]
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

  const filterReviews = (reviews: any[]) =>
    reviews.filter(
      (r) =>
        (!selectedRoleId || r.role_id === selectedRoleId) &&
        (!selectedCity || r.work_city === selectedCity) &&
        (!selectedExperience || r.experience_years === selectedExperience) &&
        (!selectedEmploymentStatus ||
          r.employment_status === selectedEmploymentStatus) &&
        (!selectedRecommend ||
          (selectedRecommend === "yes"
            ? r.would_recommend === true
            : r.would_recommend === false))
    );

  const processedReviews = filterReviews(sortReviews(localReviews));
  const reviewsToShow = processedReviews.slice(0, reviewsPage * REVIEWS_PER_PAGE);

  const handleHelpfulClick = async (reviewId: number) => {
    if (pendingHelpfulRef.current.has(reviewId)) return;
    pendingHelpfulRef.current.add(reviewId);

    try {
      const alreadyClicked = clickedHelpful.includes(reviewId);

      const { error } = await supabase.rpc(
        alreadyClicked
          ? "decrement_review_helpful_count"
          : "increment_review_helpful_count",
        { review_id: reviewId }
      );

      if (error) {
        console.error("helpful_count update failed:", error);
        return;
      }

      const updatedClicked = alreadyClicked
        ? clickedHelpful.filter((id) => id !== reviewId)
        : [...clickedHelpful, reviewId];

      setClickedHelpful(updatedClicked);

      localStorage.setItem(
        HELPFUL_VOTES_STORAGE_KEY,
        JSON.stringify(updatedClicked)
      );

      setLocalReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                helpful_count: Math.max(
                  0,
                  (r.helpful_count || 0) + (alreadyClicked ? -1 : 1)
                ),
              }
            : r
        )
      );
    } finally {
      pendingHelpfulRef.current.delete(reviewId);
    }
  };

  // -------------------- DATA FETCH --------------------
  useEffect(() => {
    const fetchData = async () => {
      const { data: ws } = await supabase
        .from("company_work_style")
        .select("*, roles(name)")
        .eq("company_id", companyId)
        .eq("moderation_status", "approved")
        .eq("role_status", "approved")
        .eq("company_status", "approved");
      setWorkStyles(await attachAuthors(ws || []));

      const { data: b } = await supabase
        .from("company_benefits")
        .select("*, roles(name)")
        .eq("company_id", companyId)
        .eq("moderation_status", "approved")
        .eq("role_status", "approved")
        .eq("company_status", "approved");
      setBenefits(await attachAuthors(b || []));

      const { data: c } = await supabase
        .from("company_compensation")
        .select("*, roles(name)")
        .eq("company_id", companyId)
        .eq("moderation_status", "approved")
        .eq("role_status", "approved")
        .eq("company_status", "approved");
      setCompensations(await attachAuthors(c || []));
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

      setInterviews(await attachAuthors(data || []));
    };

    fetchInterviews();
  }, [companyId]);

  // -------------------- Çalışma Koşulları aggregations --------------------
  const remoteEntries = aggregateField(filteredWorkStyles, "remote_policy", REMOTE_POLICY_LABELS);
  const hoursEntries = aggregateField(filteredWorkStyles, "working_hours", WORKING_HOURS_LABELS);
  const overtimeEntries = aggregateField(filteredWorkStyles, "overtime_policy", OVERTIME_POLICY_LABELS);
  const saturdayEntries = aggregateField(filteredWorkStyles, "saturday_policy", SATURDAY_POLICY_LABELS);

  const mealEntries = aggregateField(filteredBenefits, "meal_policy", MEAL_POLICY_LABELS);
  const transportEntries = aggregateField(filteredBenefits, "transportation_policy", TRANSPORTATION_POLICY_LABELS);
  const insuranceEntries = aggregateField(filteredBenefits, "private_insurance", PRIVATE_INSURANCE_LABELS);
  const equipmentEntries = aggregateMultiField(filteredBenefits, "equipment_support");

  const structureEntries = aggregateField(filteredCompensations, "salary_structure", SALARY_STRUCTURE_LABELS);
  const raisePolicyEntries = aggregateField(filteredCompensations, "salary_raise_policy", SALARY_RAISE_POLICY_LABELS);
  const raiseFrequencyEntries = aggregateField(filteredCompensations, "raise_frequency", RAISE_FREQUENCY_LABELS);
  const bonusEntries = aggregateField(filteredCompensations, "bonus_policy", BONUS_POLICY_LABELS);
  const paymentEntries = aggregateField(filteredCompensations, "payment_regular", PAYMENT_REGULAR_LABELS);
  const extraSupportEntries = aggregateMultiField(filteredCompensations, "extra_support");

  const difficultyEntries = aggregateField(filteredInterviews, "difficulty", DIFFICULTY_LABELS);
  const seniorityEntries = aggregateField(filteredInterviews, "seniority", SENIORITY_LABELS);
  const processLengthEntries = aggregateField(filteredInterviews, "process_length", PROCESS_LENGTH_LABELS);
  const interviewFormatEntries = aggregateField(filteredInterviews, "interview_format", INTERVIEW_FORMAT_LABELS);
  const salaryRangeEntries = aggregateField(filteredInterviews, "salary_range", SALARY_RANGE_LABELS);

const isAnyFormOpen =
  currentActiveTab === "Yorum Ekle" ||
  showSalaryForm ||
  showWorkStyleForm ||
  showBenefitsForm ||
  showCompensationForm ||
  showInterviewForm;

  const salaryRoleFilterApplicable =
    currentActiveTab === "maaş" &&
    salaryRoleOptions.length > 0 &&
    !isAnyFormOpen;

  const salaryCityFilterApplicable =
    currentActiveTab === "maaş" &&
    salaryCityOptions.length > 0 &&
    !isAnyFormOpen;

  const salaryExperienceFilterApplicable =
    currentActiveTab === "maaş" &&
    salaryExperienceOptions.length > 0 &&
    !isAnyFormOpen;

  const reviewRoleFilterApplicable =
    currentActiveTab === "yorum" &&
    reviewRoleOptions.length > 0 &&
    !isAnyFormOpen;

  const reviewCityFilterApplicable =
    currentActiveTab === "yorum" &&
    reviewCityOptions.length > 0 &&
    !isAnyFormOpen;

  const reviewExperienceFilterApplicable =
    currentActiveTab === "yorum" &&
    reviewExperienceOptions.length > 0 &&
    !isAnyFormOpen;

  const reviewEmploymentStatusFilterApplicable =
    currentActiveTab === "yorum" &&
    reviewEmploymentStatusOptions.length > 0 &&
    !isAnyFormOpen;

  const reviewRecommendFilterApplicable =
    currentActiveTab === "yorum" &&
    reviewRecommendOptions.length > 0 &&
    !isAnyFormOpen;

  const interviewRoleFilterApplicable =
    currentActiveTab === "mülakat süreci" &&
    interviewRoleOptions.length > 0 &&
    !isAnyFormOpen;

  const interviewCityFilterApplicable =
    currentActiveTab === "mülakat süreci" &&
    interviewCityOptions.length > 0 &&
    !isAnyFormOpen;

  const workStyleRoleFilterApplicable =
    currentActiveTab === "çalışma biçimi" &&
    workStyleRoleOptions.length > 0 &&
    !isAnyFormOpen;

  const workStyleCityFilterApplicable =
    currentActiveTab === "çalışma biçimi" &&
    workStyleCityOptions.length > 0 &&
    !isAnyFormOpen;

  const benefitsRoleFilterApplicable =
    currentActiveTab === "yan hak" &&
    benefitsRoleOptions.length > 0 &&
    !isAnyFormOpen;

  const benefitsCityFilterApplicable =
    currentActiveTab === "yan hak" &&
    benefitsCityOptions.length > 0 &&
    !isAnyFormOpen;

  const compensationRoleFilterApplicable =
    currentActiveTab === "ücret politikası" &&
    compensationRoleOptions.length > 0 &&
    !isAnyFormOpen;

  const compensationCityFilterApplicable =
    currentActiveTab === "ücret politikası" &&
    compensationCityOptions.length > 0 &&
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
                     {salaries?.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mb-4">
                          {salaryRoleFilterApplicable && (
                            <SelectDropdown
                              value={selectedRoleId}
                              onChange={(value) => {
                                setSelectedRoleId(value);
                                setSalariesPage(1);
                              }}
                              options={salaryRoleOptions}
                              placeholder="Tüm Pozisyonlar"
                              className="w-full"
                            />
                          )}

                          {salaryCityFilterApplicable && (
                            <SelectDropdown
                              value={selectedCity}
                              onChange={(value) => {
                                setSelectedCity(value);
                                setSalariesPage(1);
                              }}
                              options={salaryCityOptions}
                              placeholder="Tüm Şehirler"
                              className="w-full"
                            />
                          )}

                          {salaryExperienceFilterApplicable && (
                            <SelectDropdown
                              value={selectedExperience}
                              onChange={(value) => {
                                setSelectedExperience(value);
                                setSalariesPage(1);
                              }}
                              options={salaryExperienceOptions}
                              placeholder="Tüm Deneyimler"
                              className="w-full"
                            />
                          )}

                        <div className="col-start-4 flex items-center justify-end">
                          {!isAnyFormOpen && (
                            <button
                              className={`company-cta-btn ${currentCTA.color} text-white/90`}
                              onClick={() => setShowSalaryForm(true)}
                            >
                              {currentCTA.label}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                     {filteredSalaries.length > 0 && (() => {
                       const satisfactionValues = filteredSalaries
                         .map((s) => Number(s.salary_satisfaction))
                         .filter((v) => v > 0);

                       const averageSatisfaction =
                         satisfactionValues.length > 0
                           ? (
                               satisfactionValues.reduce((a, b) => a + b, 0) /
                               satisfactionValues.length
                             ).toFixed(1)
                           : null;

                       return (
                         <div className="card-light rounded-2xl p-4 mb-4 flex items-center justify-between flex-wrap gap-6">
                           <div className="flex items-center gap-2">
                             <span className="text-sm text-[var(--text-dark)]">
                               Maaş Aralığı
                             </span>

                             <span className="text-sm font-semibold text-[var(--accent)]">
                               {Math.min(
                                 ...filteredSalaries.map(
                                   (s) => Number(s.salary) || 0
                                 )
                               ).toLocaleString("tr-TR")}₺{" "}
                               -{" "}
                               {Math.max(
                                 ...filteredSalaries.map(
                                   (s) => Number(s.salary) || 0
                                 )
                               ).toLocaleString("tr-TR")}₺
                             </span>
                           </div>

                           {averageSatisfaction && (
                             <div className="w-full sm:w-56">
                               <RatingBar
                                 label="Ortalama Memnuniyet"
                                 value={Number(averageSatisfaction)}
                               />
                             </div>
                           )}
                         </div>
                       );
                     })()}

                    {filteredSalaries?.length > 0 ? (
                      <>
                        <div className="grid md:grid-cols-2 gap-6">
                          {filteredSalaries.slice(0, salariesPage * ITEMS_PER_PAGE).map((salary) => (
                            <SalaryCard
                              key={salary.id}
                              role={salary.roles?.name || "-"}
                              salary={Number(salary.salary) || 0}
                              experienceLabel={getExperienceYearsLabel(salary.experience_years)}
                              cityLabel={getCityName(salary.work_city)}
                              satisfaction={salary.salary_satisfaction}
                              techStack={salary.tech_stack}
                              comment={salary.comment}
                              isAnonymous={salary.is_anonymous}
                              authorUsername={salary.authorUsername}
                              authorAvatarUrl={salary.authorAvatarUrl}
                            />
                          ))}
                        </div>

                        {salariesPage * ITEMS_PER_PAGE < filteredSalaries.length && (
                          <LoadMoreButton
                            onClick={() => setSalariesPage(salariesPage + 1)}
                          />
                        )}
                      </>
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
                <div className="grid grid-cols-4 gap-2 mb-4">
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
                    defaultValue="newest"
                    className="w-full"
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
                    className="w-full"
                  />
                )}

                {reviewCityFilterApplicable && (
                  <SelectDropdown
                    value={selectedCity}
                    onChange={(value) => {
                      setSelectedCity(value);
                      setReviewsPage(1);
                    }}
                    options={reviewCityOptions}
                    placeholder="Tüm Şehirler"
                    className="w-full"
                  />
                )}

                {/* CTA — 4th column, spans both rows */}
                <div className="col-start-4 row-start-1 row-span-2 flex items-center justify-end">
                  {!isAnyFormOpen && (
                    <button
                      className={`company-cta-btn ${currentCTA.color} text-white/90`}
                      onClick={() => currentSetActiveTab("Yorum Ekle")}
                    >
                      {currentCTA.label}
                    </button>
                  )}
                </div>

                {reviewExperienceFilterApplicable && (
                  <SelectDropdown
                    value={selectedExperience}
                    onChange={(value) => {
                      setSelectedExperience(value);
                      setReviewsPage(1);
                    }}
                    options={reviewExperienceOptions}
                    placeholder="Tüm Deneyimler"
                    className="w-full"
                  />
                )}

                {reviewEmploymentStatusFilterApplicable && (
                  <SelectDropdown
                    value={selectedEmploymentStatus}
                    onChange={(value) => {
                      setSelectedEmploymentStatus(value);
                      setReviewsPage(1);
                    }}
                    options={reviewEmploymentStatusOptions}
                    placeholder="Çalışma Durumu"
                    className="w-full"
                  />
                )}

                {reviewRecommendFilterApplicable && (
                  <SelectDropdown
                    value={selectedRecommend}
                    onChange={(value) => {
                      setSelectedRecommend(value);
                      setReviewsPage(1);
                    }}
                    options={reviewRecommendOptions}
                    placeholder="Tavsiye Durumu"
                    className="w-full"
                  />
                )}
                </div>
                )}

                <ReviewRatingBars reviews={processedReviews} />

                {/* Review Cards */}
               {reviewsToShow.length > 0 &&
                  reviewsToShow.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      isHelpfulClicked={clickedHelpful.includes(review.id)}
                      onHelpfulClick={() => handleHelpfulClick(review.id)}
                    />
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
                {workStyles.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {workStyleRoleFilterApplicable && (
                      <SelectDropdown
                        value={selectedRoleId}
                        onChange={(value) => {
                          setSelectedRoleId(value);
                          setWorkStylesPage(1);
                        }}
                        options={workStyleRoleOptions}
                        placeholder="Tüm Pozisyonlar"
                        className="w-full"
                      />
                    )}

                    {workStyleCityFilterApplicable && (
                      <SelectDropdown
                        value={selectedCity}
                        onChange={(value) => {
                          setSelectedCity(value);
                          setWorkStylesPage(1);
                        }}
                        options={workStyleCityOptions}
                        placeholder="Tüm Şehirler"
                        className="w-full"
                      />
                    )}

                    <div className="col-start-4 flex items-center justify-end">
                      {!isAnyFormOpen && (
                        <button
                          className={`company-cta-btn ${currentCTA.color} text-white/90`}
                          onClick={() => setShowWorkStyleForm(true)}
                        >
                          {currentCTA.label}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {filteredWorkStyles.length > 0 && (
                  <div className="card-light rounded-2xl p-5 md:p-6 mb-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <StatBreakdown title="Çalışma Şekli" entries={remoteEntries} />
                      <StatBreakdown title="Çalışma Saatleri" entries={hoursEntries} />
                      <StatBreakdown title="Fazla Mesai Sıklığı" entries={overtimeEntries} />
                      <StatBreakdown title="Cumartesi Çalışması" entries={saturdayEntries} />
                    </div>
                  </div>
                )}

                {filteredWorkStyles.length > 0 ? (
                  <>
                    <div className="grid md:grid-cols-2 gap-6">
                      {filteredWorkStyles.slice(0, workStylesPage * ITEMS_PER_PAGE).map((workStyle) => (
                        <WorkStyleCard
                          key={workStyle.id}
                          role={workStyle.roles?.name || "-"}
                          cityLabel={getCityName(workStyle.work_city)}
                          remotePolicyLabel={REMOTE_POLICY_LABELS[workStyle.remote_policy] || "-"}
                          workingHoursLabel={WORKING_HOURS_LABELS[workStyle.working_hours] || "-"}
                          overtimePolicyLabel={OVERTIME_POLICY_LABELS[workStyle.overtime_policy] || "-"}
                          saturdayPolicyLabel={SATURDAY_POLICY_LABELS[workStyle.saturday_policy] || "-"}
                          comment={workStyle.comment}
                          isAnonymous={workStyle.is_anonymous}
                          authorUsername={workStyle.authorUsername}
                          authorAvatarUrl={workStyle.authorAvatarUrl}
                        />
                      ))}
                    </div>

                    {workStylesPage * ITEMS_PER_PAGE < filteredWorkStyles.length && (
                      <LoadMoreButton
                        onClick={() => setWorkStylesPage(workStylesPage + 1)}
                      />
                    )}
                  </>
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
                {benefits.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {benefitsRoleFilterApplicable && (
                      <SelectDropdown
                        value={selectedRoleId}
                        onChange={(value) => {
                          setSelectedRoleId(value);
                          setBenefitsPage(1);
                        }}
                        options={benefitsRoleOptions}
                        placeholder="Tüm Pozisyonlar"
                        className="w-full"
                      />
                    )}

                    {benefitsCityFilterApplicable && (
                      <SelectDropdown
                        value={selectedCity}
                        onChange={(value) => {
                          setSelectedCity(value);
                          setBenefitsPage(1);
                        }}
                        options={benefitsCityOptions}
                        placeholder="Tüm Şehirler"
                        className="w-full"
                      />
                    )}

                    <div className="col-start-4 flex items-center justify-end">
                      {!isAnyFormOpen && (
                        <button
                          className={`company-cta-btn ${currentCTA.color} text-white/90`}
                          onClick={() => setShowBenefitsForm(true)}
                        >
                          {currentCTA.label}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {filteredBenefits.length > 0 && (
                  <div className="card-light rounded-2xl p-5 md:p-6 mb-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <StatBreakdown title="Yemek Desteği" entries={mealEntries} />
                      <StatBreakdown title="Ulaşım Desteği" entries={transportEntries} />
                      <StatBreakdown title="Özel Sağlık Sigortası" entries={insuranceEntries} />
                      <StatBreakdown title="Ekipman Desteği" entries={equipmentEntries} />
                    </div>
                  </div>
                )}

                {filteredBenefits.length > 0 ? (
                  <>
                    <div className="grid md:grid-cols-2 gap-6">
                      {filteredBenefits.slice(0, benefitsPage * ITEMS_PER_PAGE).map((benefit) => (
                        <BenefitsCard
                          key={benefit.id}
                          role={benefit.roles?.name || "-"}
                          cityLabel={getCityName(benefit.work_city)}
                          insuranceLabel={PRIVATE_INSURANCE_LABELS[benefit.private_insurance] || "-"}
                          mealPolicyLabel={MEAL_POLICY_LABELS[benefit.meal_policy] || "-"}
                          transportationPolicyLabel={TRANSPORTATION_POLICY_LABELS[benefit.transportation_policy] || "-"}
                          equipmentSupportLabel={
                            benefit.equipment_support?.length
                              ? benefit.equipment_support.join(", ")
                              : "-"
                          }
                          comment={benefit.comment}
                          isAnonymous={benefit.is_anonymous}
                          authorUsername={benefit.authorUsername}
                          authorAvatarUrl={benefit.authorAvatarUrl}
                        />
                      ))}
                    </div>

                    {benefitsPage * ITEMS_PER_PAGE < filteredBenefits.length && (
                      <LoadMoreButton
                        onClick={() => setBenefitsPage(benefitsPage + 1)}
                      />
                    )}
                  </>
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
                {compensations.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {compensationRoleFilterApplicable && (
                      <SelectDropdown
                        value={selectedRoleId}
                        onChange={(value) => {
                          setSelectedRoleId(value);
                          setCompensationsPage(1);
                        }}
                        options={compensationRoleOptions}
                        placeholder="Tüm Pozisyonlar"
                        className="w-full"
                      />
                    )}

                    {compensationCityFilterApplicable && (
                      <SelectDropdown
                        value={selectedCity}
                        onChange={(value) => {
                          setSelectedCity(value);
                          setCompensationsPage(1);
                        }}
                        options={compensationCityOptions}
                        placeholder="Tüm Şehirler"
                        className="w-full"
                      />
                    )}

                    <div className="col-start-4 flex items-center justify-end">
                      {!isAnyFormOpen && (
                        <button
                          className={`company-cta-btn ${currentCTA.color} text-white/90`}
                          onClick={() => setShowCompensationForm(true)}
                        >
                          {currentCTA.label}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {filteredCompensations.length > 0 && (
                  <div className="card-light rounded-2xl p-5 md:p-6 mb-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <StatBreakdown title="Yıllık Maaş Sistemi" entries={structureEntries} />
                      <StatBreakdown title="Zam Sistemi" entries={raisePolicyEntries} />
                      <StatBreakdown title="Zam Sıklığı" entries={raiseFrequencyEntries} />
                      <StatBreakdown title="Prim Sistemi" entries={bonusEntries} />
                      <StatBreakdown title="Maaş Ödeme Düzeni" entries={paymentEntries} />
                      <StatBreakdown title="Ek Finansal Destek" entries={extraSupportEntries} />
                    </div>
                  </div>
                )}

                {filteredCompensations.length > 0 ? (
                  <>
                    <div className="flex flex-col gap-4">
                      {filteredCompensations.slice(0, compensationsPage * ITEMS_PER_PAGE).map((compensation) => (
                        <CompensationCard
                          key={compensation.id}
                          role={compensation.roles?.name || "-"}
                          cityLabel={getCityName(compensation.work_city)}
                          salaryStructureLabel={SALARY_STRUCTURE_LABELS[compensation.salary_structure] || "-"}
                          raisePolicyLabel={SALARY_RAISE_POLICY_LABELS[compensation.salary_raise_policy] || "-"}
                          raiseFrequencyLabel={RAISE_FREQUENCY_LABELS[compensation.raise_frequency] || "-"}
                          bonusPolicyLabel={BONUS_POLICY_LABELS[compensation.bonus_policy] || "-"}
                          paymentRegularLabel={PAYMENT_REGULAR_LABELS[compensation.payment_regular] || "-"}
                          extraSupportLabel={
                            compensation.extra_support?.length
                              ? compensation.extra_support.join(", ")
                              : "-"
                          }
                          comment={compensation.comment}
                          isAnonymous={compensation.is_anonymous}
                          authorUsername={compensation.authorUsername}
                          authorAvatarUrl={compensation.authorAvatarUrl}
                        />
                      ))}
                    </div>

                    {compensationsPage * ITEMS_PER_PAGE < filteredCompensations.length && (
                      <LoadMoreButton
                        onClick={() => setCompensationsPage(compensationsPage + 1)}
                      />
                    )}
                  </>
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
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {interviewRoleFilterApplicable && (
                    <SelectDropdown
                      value={selectedRoleId}
                      onChange={(value) => {
                        setSelectedRoleId(value);
                        setInterviewsPage(1);
                      }}
                      options={interviewRoleOptions}
                      placeholder="Tüm Pozisyonlar"
                      className="w-full"
                    />
                  )}

                  {interviewCityFilterApplicable && (
                    <SelectDropdown
                      value={selectedCity}
                      onChange={(value) => {
                        setSelectedCity(value);
                        setInterviewsPage(1);
                      }}
                      options={interviewCityOptions}
                      placeholder="Tüm Şehirler"
                      className="w-full"
                    />
                  )}

                  <div className="col-start-4 flex items-center justify-end">
                  {!isAnyFormOpen && (
                    <button
                      className={`company-cta-btn ${currentCTA.color} text-white/90`}
                      onClick={() => setShowInterviewForm(true)}
                    >
                      {currentCTA.label}
                    </button>
                  )}
                  </div>
                </div>
              )}

              {filteredInterviews.length > 0 && (
                <div className="card-light rounded-2xl p-5 md:p-6 mb-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <StatBreakdown title="Zorluk" entries={difficultyEntries} />
                    <StatBreakdown title="Seviye" entries={seniorityEntries} />
                    <StatBreakdown title="Süreç" entries={processLengthEntries} />
                    <StatBreakdown title="Format" entries={interviewFormatEntries} />
                    <StatBreakdown title="Maaş Aralığı" entries={salaryRangeEntries} />
                  </div>
                </div>
              )}

              {filteredInterviews.length > 0 ? (
                <>
                  <div className="flex flex-col gap-4">
                    {filteredInterviews.slice(0, interviewsPage * ITEMS_PER_PAGE).map((interview) => (
                      <InterviewCard key={interview.id} interview={interview} />
                    ))}
                  </div>

                  {interviewsPage * ITEMS_PER_PAGE < filteredInterviews.length && (
                    <LoadMoreButton
                      onClick={() => setInterviewsPage(interviewsPage + 1)}
                    />
                  )}
                </>
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
