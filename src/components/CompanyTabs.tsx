"use client";

import { useRef, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import SalaryCard from "@/components/SalaryCard";
import ReviewFormSteps from "./forms/ReviewFormSteps";
import SalaryForm from "./forms/SalaryForm";
import WorkStyleForm from "./forms/WorkStyleForm";
import BenefitsForm from "./forms/BenefitsForm";
import CompensationForm from "./forms/CompensationForm";
import InterviewForm from "./forms/InterviewForm";
import LoadMoreButton from "./ui/LoadMoreButton";
import CompanyTabsNav from "./CompanyTabsNav";
import ContentEmptyState from "./ui/ContentEmptyState";

export default function CompanyTabs({
  companyId,
  companyName,
  hqCity,
  reviews,
  showNav = true,
  activeTab: externalActiveTab,
  setActiveTab: externalSetActiveTab,
}: {
  companyId: number;
  companyName: string;
  hqCity: number;
  reviews: any[];
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
  const tabList = ["yorum", "maaş", "çalışma biçimi", "yan hak", "ücret politikası", "mülakat süreci"];

  const ctaConfig: Record<string, { label: string; color: string }> = {
  "yorum": {
    label: "+ Yorum Paylaş",
    color: "cta-btn",
  },

  "maaş": {
    label: "+ Maaş Paylaş",
    color: "cta-btn",
  },

  "çalışma biçimi": {
    label: "+ Çalışma Biçimi Paylaş",
    color: "cta-btn",
  },

  "yan hak": {
    label: "+ Yan Hak Paylaş",
    color: "cta-btn",
  },

  "ücret politikası": {
    label: "+ Ücret Politikası Paylaş",
    color: "cta-btn",
  },

  "mülakat süreci": {
    label: "+ Mülakat Süreci Paylaş",
    color: "cta-btn",
  },
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
  const [compensationStats, setCompensationStats] = useState<any>({});
  
  const [workStyleStats, setWorkStyleStats] = useState<any>({});
  const [benefitsStats, setBenefitsStats] = useState<any>({});

  const [openCard, setOpenCard] = useState<string | null>(null);

  const [reviewsToShow, setReviewsToShow] = useState<any[]>([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewSort, setReviewSort] = useState<"mostHelpful" | "newest" | "highestRating">("newest");
  const [reviewFilter, setReviewFilter] = useState<{ job_title?: string; employment_status?: string }>({});
  const REVIEWS_PER_PAGE = 10;

  const [showSalaryForm, setShowSalaryForm] = useState(false);
  const [showWorkStyleForm, setShowWorkStyleForm] = useState(false);
  const [showBenefitsForm, setShowBenefitsForm] = useState(false);
  const [showCompensationForm, setShowCompensationForm] = useState(false);
  const [showInterviewForm, setShowInterviewForm] = useState(false);

  const [clickedHelpful, setClickedHelpful] = useState<number[]>([]); // review.id array

  const dropdownRef = useRef<HTMLDivElement>(null);

  const [salaries, setSalaries] = useState<any[]>([]);
  
 // -------------------- Review Filter functions Style --------------------
const sortReviews = (reviews: any[]) => {
  switch (reviewSort) {

    case "mostHelpful":
      return [...reviews].sort(
        (a, b) =>
          (b.helpful_count || 0) -
          (a.helpful_count || 0)
      );

    case "newest":
      return [...reviews].sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );

    case "highestRating":
      return [...reviews].sort(
        (a, b) =>
          (b.overall_rating || 0) -
          (a.overall_rating || 0)
      );

    default:
      return reviews;
  }
};

    const filterReviews = (reviews: any[]) => {
    return reviews.filter((r) => {
        if (reviewFilter.job_title && r.job_title !== reviewFilter.job_title) return false;
        if (reviewFilter.employment_status && r.employment_status !== reviewFilter.employment_status) return false;
        return true;
    });
    };

    const processedReviews = filterReviews(sortReviews(reviews));
    const currentReviews = processedReviews.slice(0, reviewsPage * REVIEWS_PER_PAGE);

    // -------------------- Review Filter job title auto complete dropdown function --------------------
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [jobTitleInput, setJobTitleInput] = useState("");
    const jobTitles = Array.from(new Set((reviews || []).map(r => r.job_title || ""))); // tüm unvanlar
    const filteredJobTitles = jobTitles.filter((title) =>
        title.toLowerCase().includes(jobTitleInput.toLowerCase())
);

     // -------------------- Helper fonksiyon — rating’ten yıldız oluşturma --------------------
    const renderStars = (rating: number) => {
    const stars = [];
    const maxStars = 5;
    for (let i = 1; i <= maxStars; i++) {
        if (i <= Math.round(rating)) {
        stars.push(<AiFillStar key={i} className="text-yellow-400 inline" />);
        } else {
        stars.push(<AiOutlineStar key={i} className="text-yellow-400 inline" />);
        }
    }
    return stars;
    };


  // -------------------- DATA FETCH Work Style --------------------
  useEffect(() => {
    const fetchData = async () => {
      const { data: ws } = await supabase
        .from("company_work_style")
        .select("*")
        .eq("company_id", companyId)
        .eq("moderation_status", "approved")
        .eq("role_status", "approved")
        .eq("company_status", "approved")
      setWorkStyles(ws || []);

      const { data: b } = await supabase
        .from("company_benefits")
        .select("*")
        .eq("company_id", companyId)
        .eq("moderation_status", "approved")
        .eq("role_status", "approved")
        .eq("company_status", "approved")
      setBenefits(b || []);

      const { data: c } = await supabase
        .from("company_compensation")
        .select("*")
        .eq("company_id", companyId)
        .eq("moderation_status", "approved")
        .eq("role_status", "approved")
        .eq("company_status", "approved")
      setCompensations(c || []);
    };
    fetchData();
  }, [companyId]);


  // -------------------- WORK STYLE AGGREGATION --------------------
  useEffect(() => {
    if (workStyles.length === 0) return;

    const agg: any = {
      overtime_policy: {} as Record<string, number>,
      working_hours: {} as Record<string, number>,
      saturday_policy: {} as Record<string, number>,
      remote_policy: {} as Record<string, number>,
    };

    workStyles.forEach((ws) => {
      ["overtime_policy", "working_hours", "saturday_policy", "remote_policy"].forEach((field) => {
        const val = ws[field] || "Bilinmiyor";
        agg[field][val] = (agg[field][val] || 0) + 1;
      });
    });

    Object.keys(agg).forEach((field) => {
      const total = workStyles.length;
      Object.keys(agg[field]).forEach((key) => {
        agg[field][key] = Math.round((agg[field][key] / total) * 100);
      });
    });

    setWorkStyleStats(agg);
  }, [workStyles]);

  // -------------------- BENEFITS AGGREGATION --------------------
  useEffect(() => {
    if (benefits.length === 0) return;

    const agg: any = {};

    ["meal_policy", "transportation_policy", "private_insurance", "equipment_support"].forEach((field) => {
      agg[field] = {};
      benefits.forEach((b) => {
        const val = b[field] || "Bilinmiyor";
        if (!agg[field][val]) agg[field][val] = { count: 0, companies: [] };
        agg[field][val].count += 1;
        agg[field][val].companies.push(b.company);
      });
    });

    // Multi-select
    agg["additional_benefits_selected"] = {};
    benefits.forEach((b) => {
      (b.additional_benefits_selected || []).forEach((item: string) => {
        if (!agg["additional_benefits_selected"][item])
          agg["additional_benefits_selected"][item] = { count: 0, companies: [] };
        agg["additional_benefits_selected"][item].count += 1;
        agg["additional_benefits_selected"][item].companies.push(b.company);
      });
    });

    // Free text
    agg["additional_benefits_other"] = {};
    benefits.forEach((b) => {
      const val = b.additional_benefits_other?.trim();
      if (val) {
        if (!agg["additional_benefits_other"][val])
          agg["additional_benefits_other"][val] = { count: 0, companies: [] };
        agg["additional_benefits_other"][val].count += 1;
        agg["additional_benefits_other"][val].companies.push(b.company);
      }
    });

    // Convert to %
    Object.keys(agg).forEach((field) => {
      const total = benefits.length;
      Object.keys(agg[field]).forEach((key) => {
        agg[field][key].percent = Math.round((agg[field][key].count / total) * 100);
      });
    });

    setBenefitsStats(agg);
  }, [benefits]);

    // -------------------- DATA FETCH Compensations --------------------


      useEffect(() => {
        const fetchData = async () => {
          const { data: c } = await supabase
          .from("company_compensation")
          .select("*")
          .eq("company_id", companyId)
          .eq("moderation_status", "approved")
          .eq("role_status", "approved")
          .eq("company_status", "approved")
          setCompensations(c || []);
        };
        fetchData();
      }, [companyId]);

        // -------------------- DATA Compensations AGGREGATION --------------------

      useEffect(() => {
        if (compensations.length === 0) return;

        const agg: any = {};

        [
          "salary_structure",
          "salary_satisfaction",
          "bonus_policy",
          "bonus_frequency",
          "salary_raise_policy",
          "raise_frequency",
        ].forEach((field) => {
          agg[field] = {};

          compensations.forEach((c) => {
            const val =
              c[field] || "Bilinmiyor";

            if (!agg[field][val]) {
              agg[field][val] = {
                count: 0,
                percent: 0,
                companies: [],
              };
            }

            agg[field][val].count += 1;
          });

          // %
          const total = compensations.length;

          Object.keys(agg[field]).forEach(
            (key) => {
              agg[field][key].percent =
                Math.round(
                  (agg[field][key].count /
                    total) *
                    100
                );
            }
          );
        });

        setCompensationStats(agg);
      }, [compensations]);

// -------------------- DATA FETCH Review --------------------

    useEffect(() => {
    // Her render veya state değişiminde processedReviews hesapla
    const processed = filterReviews(sortReviews(reviews));
    const current = processed.slice(0, reviewsPage * REVIEWS_PER_PAGE);
    setReviewsToShow(current);
    }, [reviewsPage, reviewSort, reviewFilter, reviews]);

    // -------------------- Job title filter Dropdown close event --------------------

    useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
    }, [dropdownRef]);

    // -------------------- Salaries fetch event --------------------
      useEffect(() => {
  const fetchSalaries = async () => {
    const { data } = await supabase
      .from("salaries")
      .select("*")
      .eq("company_id", companyId)
      .eq("moderation_status", "approved")
      .eq("role_status", "approved")
      .eq("company_status", "approved")

    setSalaries(data || []);
  };

  fetchSalaries();
}, [companyId]);


const isAnyFormOpen =
  currentActiveTab === "Yorum Ekle" ||
  showSalaryForm ||
  showWorkStyleForm ||
  showBenefitsForm ||
  showCompensationForm ||
  showInterviewForm;


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
                      <div className="flex justify-end mb-4">
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

                    {salaries?.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-6">
                        {salaries.map((salary) => (
                          <SalaryCard
                            key={salary.id}
                            company={salary.company}
                            role={salary.role}
                            salary={salary.salary}
                            location={salary.experience_years}
                            type={salary.type}
                            logo={salary.company_logo}
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
                <select
                    className="bg-zinc-800 text-white px-2 py-1 rounded"
                    value={reviewSort}
                    onChange={(e) => {
                    setReviewSort(e.target.value as any);
                    setReviewsPage(1);
                    }}
                >
                    <option value="newest">Yeni → Eski</option>
                    <option value="highestRating">Yüksek Rating → Düşük</option>
                    <option value="mostHelpful">En Çok Yardımcı</option>
                </select>

                {/* Job title autocomplete */}

                    <div className="relative w-60" ref={dropdownRef}>
                    <input
                        type="text"
                        placeholder="Pozisyon ara..."
                        value={jobTitleInput}
                        onChange={(e) => setJobTitleInput(e.target.value)}
                        onFocus={() => setIsDropdownOpen(true)}
                        className="bg-zinc-800 text-white px-2 py-1 rounded w-full"
                    />

                    {isDropdownOpen && (
                        <ul className="absolute z-10 w-full bg-zinc-900 border border-zinc-700 rounded mt-1 max-h-40 overflow-auto">
                        <li
                            className="px-2 py-1 cursor-pointer hover:bg-zinc-700"
                            onClick={() => {
                            setReviewFilter({ ...reviewFilter, job_title: "" });
                            setJobTitleInput("");
                            setIsDropdownOpen(false);
                            setReviewsPage(1);
                            }}
                        >
                            Tüm Pozisyonlar
                        </li>
                        {filteredJobTitles.map((title) => (
                            <li
                            key={title}
                            className="px-2 py-1 cursor-pointer hover:bg-zinc-700"
                            onClick={() => {
                                setReviewFilter({ ...reviewFilter, job_title: title });
                                setJobTitleInput(title);
                                setIsDropdownOpen(false);
                                setReviewsPage(1);
                            }}
                            >
                            {title}
                            </li>
                        ))}
                        </ul>
                    )}
                    </div>
                    </div>

                     {/* Sağ CTA Button */}
              {!isAnyFormOpen && (
                <div>
                  <button
                    className={`company-cta-btn ${currentCTA.color} text-white/90`}
                    onClick={() => {
                      if (currentActiveTab === "yorum") {
                        currentSetActiveTab("Yorum Ekle");
                        return;
                      }

                      if (currentActiveTab === "maaş") {
                        setShowSalaryForm(true);
                        return;
                      }

                      if (currentActiveTab === "çalışma biçimi") {
                        setShowWorkStyleForm(true);
                        return;
                      }

                      if (currentActiveTab === "yan hak") {
                        setShowBenefitsForm(true);
                        return;
                      }

                      if (currentActiveTab === "ücret politikası") {
                        setShowCompensationForm(true);
                        return;
                      }

                      if (currentActiveTab === "mülakat süreci") {
                        setShowInterviewForm(true);
                        return;
                      }
                    }}
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
                      className="border border-zinc-700 rounded-2xl p-4 bg-zinc-900 text-white "
                    >
                      <h4 className="font-semibold text-lg">
                        {review.title}
                      </h4>

                      <p className="text-sm text-zinc-400 mt-1">
                        {review.job_title} - {review.employment_status}
                      </p>

                      <p className="mt-2">
                        {review.review}
                      </p>

                      <div className="flex gap-2 mt-2 text-sm items-center flex-wrap">
                        <div className="flex gap-1 mt-0 items-center group relative">
                          {renderStars(review.overall_rating || 0)}

                          <span className="absolute -top-6 left-0 bg-zinc-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                            Ortalama: {review.overall_rating}
                          </span>
                        </div>

                        <span>
                          Management: {review.management}
                        </span>

                        <span>
                          Career: {review.career_growth}
                        </span>

                        <button
                          className={`cursor-pointer px-2 py-1 rounded ${
                            clickedHelpful.includes(review.id)
                              ? "bg-blue-600 text-white"
                              : "bg-zinc-700 text-white"
                          }`}
                          onClick={async () => {
                            if (clickedHelpful.includes(review.id))
                              return;

                            const updatedReviews =
                              reviewsToShow.map((r) =>
                                r.id === review.id
                                  ? {
                                      ...r,
                                      helpful_count:
                                        (r.helpful_count || 0) + 1,
                                    }
                                  : r
                              );

                            setReviewsToShow(updatedReviews);

                            await supabase
                              .from("company_reviews")
                              .update({
                                helpful_count:
                                  (review.helpful_count || 0) + 1,
                              })
                              .eq("id", review.id);

                            setClickedHelpful([
                              ...clickedHelpful,
                              review.id,
                            ]);
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

        {/* -------------------- JSX Work Styles tab content-------------------- */}
        
          {currentActiveTab === "çalışma biçimi" && (
            <>
              {showWorkStyleForm ? (
                <WorkStyleForm
                  companyId={companyId}
                  companyName={companyName}
                  onCancel={() =>
                    setShowWorkStyleForm(false)
                  }
                />
              ) : (
                <>
 
                {workStyles.length > 0 && (
                  <div className="flex justify-end mb-4">
                    {!isAnyFormOpen && (
                      <button
                        className={`company-cta-btn ${currentCTA.color} text-white/90`}
                        onClick={() =>
                          setShowWorkStyleForm(true)
                        }
                      >
                        {currentCTA.label}
                      </button>
                    )}
                  </div>
                )}

                  {workStyles.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {[
                        "overtime_policy",
                        "working_hours",
                        "saturday_policy",
                        "remote_policy",
                      ].map((field) => (
                        <div
                          key={field}
                          className="border border-zinc-700 rounded-2xl p-5 bg-zinc-900 text-white"
                        >
                          <h3 className="font-semibold text-lg mb-3">
                            {field === "overtime_policy" &&
                              "Mesai Politikası"}
                            {field === "working_hours" &&
                              "Çalışma Saatleri"}
                            {field === "saturday_policy" &&
                              "Cumartesi Politikası"}
                            {field === "remote_policy" &&
                              "Çalışma Düzeni"}
                          </h3>

                          {workStyleStats[field] &&
                            Object.entries(
                              workStyleStats[field]
                            ).map(([key, val]) => (
                              <div
                                key={key}
                                className="flex justify-between mb-1 text-sm"
                              >
                                <span>{key}</span>
                                <span>
                                  {(val as any).percent}%
                                </span>
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                  <ContentEmptyState
                    title="Henüz çalışma biçimi bilgisi paylaşılmamış!"
                    message="Bu şirket için ilk çalışma biçimi bilgisini siz paylaşın."
                    buttonText="+ Çalışma Biçimi Paylaş"
                    buttonClassName="company-cta-btn cta-btn text-white/90 mt-5"
                    onButtonClick={() =>
                      setShowWorkStyleForm(true)
                    }
                  />
                  )}
                </>
              )}
            </>
          )}

        {/* -------------------- JSX Benefits tab content-------------------- */}

              {currentActiveTab === "yan hak" && (
          <>
            {showBenefitsForm ? (
              <BenefitsForm
                companyId={companyId}
                companyName={companyName}
                onCancel={() =>
                  setShowBenefitsForm(false)
                }
              />
            ) : (
              <>

              {benefits.length > 0 && (
                <div className="flex justify-end mb-4">
                  {!isAnyFormOpen && (
                    <button
                      className={`company-cta-btn ${currentCTA.color} text-white/90`}
                      onClick={() =>
                        setShowBenefitsForm(true)
                      }
                    >
                      {currentCTA.label}
                    </button>
                  )}
                </div>
              )}

                {benefits.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      "meal_policy",
                      "transportation_policy",
                      "private_insurance",
                      "equipment_support",
                    ].map((field) => (
                      <div
                        key={field}
                        className="border border-zinc-700 rounded-2xl p-5 bg-zinc-900 text-white"
                      >
                        <h3 className="font-semibold text-lg mb-3">
                          {field === "meal_policy" &&
                            "Yemek Desteği"}

                          {field ===
                            "transportation_policy" &&
                            "Ulaşım Desteği"}

                          {field ===
                            "private_insurance" &&
                            "Özel Sağlık Sigortası"}

                          {field ===
                            "equipment_support" &&
                            "Ekipman Desteği"}
                        </h3>

                        {benefitsStats[field] &&
                          Object.entries(
                            benefitsStats[field]
                          ).map(([key, val]) => (
                            <div
                              key={key}
                              className="flex justify-between mb-1 text-sm"
                            >
                              <span>{key}</span>

                              <span>
                                {(val as any).percent}%
                              </span>
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <ContentEmptyState
                    title="Henüz yan hak bilgisi paylaşılmamış!"
                    message="Bu şirket için ilk yan hak bilgisini siz paylaşın."
                    buttonText="+ Yan Hak Paylaş"
                    buttonClassName="company-cta-btn cta-btn text-white/90 mt-5"
                    onButtonClick={() =>
                      setShowBenefitsForm(true)
                    }
                  />
                )}
              </>
            )}
          </>
        )}

                {/* -------------------- JSX Compensation Ücret Politiaksı tab content-------------------- */}
             {currentActiveTab === "ücret politikası" && (
                  <>
                    {showCompensationForm ? (
                      <CompensationForm
                        companyId={companyId}
                        companyName={companyName}
                        onCancel={() =>
                          setShowCompensationForm(false)
                        }
                      />
                    ) : (
                      <>
      
                        {compensations.length > 0 && (
                          <div className="flex justify-end mb-4">
                            {!isAnyFormOpen && (
                              <button
                                className={`company-cta-btn ${currentCTA.color} text-white/90`}
                                onClick={() =>
                                  setShowCompensationForm(true)
                                }
                              >
                                {currentCTA.label}
                              </button>
                            )}
                          </div>
                        )}

                        {compensations.length > 0 ? (
                          <div className="grid md:grid-cols-2 gap-6">
                            {[
                              "salary_satisfaction",
                              "salary_structure",
                              "bonus_policy",
                              "salary_raise_policy",
                              "raise_frequency",
                            ].map((field) => (
                              <div
                                key={field}
                                className="border border-zinc-700 rounded-2xl p-5 bg-zinc-900 text-white"
                              >
                                <h3 className="font-semibold text-lg mb-3">
                                  {field ===
                                    "salary_satisfaction" &&
                                    "Maaş Memnuniyeti"}

                                  {field ===
                                    "salary_structure" &&
                                    "Yıllık Maaş Sistemi"}

                                  {field ===
                                    "bonus_policy" &&
                                    "Bonus Sistemi"}

                                  {field ===
                                    "salary_raise_policy" &&
                                    "Zam Sistemi"}

                                  {field ===
                                    "raise_frequency" &&
                                    "Zam Sıklığı"}
                                </h3>

                                {Object.entries(
                                  (compensationStats?.[
                                    field
                                  ] as Record<string, any>) || {}
                                ).map(([key, val]) => (
                                  <div
                                    key={key}
                                    className="flex justify-between mb-1 text-sm"
                                  >
                                    <span>{key}</span>

                                    <span>
                                      {(val as any).percent}%
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <ContentEmptyState
                            title="Henüz ücret politikası bilgisi paylaşılmamış!"
                            message="Bu şirket için ilk ücret politikası bilgisini siz paylaşın."
                            buttonText="+ Ücret Politikası Paylaş"
                            buttonClassName="company-cta-btn cta-btn text-white/90 mt-5"
                            onButtonClick={() =>
                              setShowCompensationForm(true)
                            }
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
                        <div className="flex justify-end mb-4">
                          {!isAnyFormOpen && (
                            <button
                              className={`company-cta-btn ${currentCTA.color} text-white/90`}
                              onClick={() =>
                                setShowInterviewForm(true)
                              }
                            >
                              {currentCTA.label}
                            </button>
                          )}
                        </div>
                      )}

                      {interviews.length > 0 ? (
                        <div className="space-y-4">
                          {interviews.map((interview) => (
                            <div
                           
                              key={interview.id}
                              className="border border-zinc-700 rounded-2xl p-4 bg-zinc-900 text-white"
                            >
                              <pre>
                                {JSON.stringify(interview, null, 2)}  /*  Interview results will go here and replace JSON*/
                              </pre>
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