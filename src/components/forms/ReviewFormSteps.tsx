"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FaStar } from "react-icons/fa";
import RatingPills from "../RatingPills";
import LoginForm from "../auth/LoginForm";
import RegisterPanel from "../auth/RegisterPanel";
import AuthGoogleButton from "../auth/AuthGoogleButton";
import AuthDivider from "../auth/AuthDivider";
import RoleAutocomplete from "./RoleAutocomplete";
import CompanyAutocomplete from "./CompanyAutocomplete";
import TurkishCitySelect from "./TurkishCitySelect";
import SelectDropdown from "./SelectDropdown";
import { experienceLevels } from "@/app/constants/experienceLevels";
import FormSuccessMessage from "../ui/FormSuccessMessage";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import ExitConfirmPopup from "@/components/ui/ExitConfirmPopup";
import { toTitleCaseTR } from "@/app/constants/toTitleCaseTR";
import { fetchDefaultAnonymity } from "@/lib/fetchDefaultAnonymity";
import { translateSubmissionError } from "@/lib/translateSubmissionError";


type Props = {
  companyId?: number;
  companyName?: string;
  onSubmit?: () => void;
  onCancel?: () => void;
  showHeader?: boolean;
  mode?: "create" | "edit";
  initialData?: any;
};


type ReviewFormData = {
  id?: number;

  companyId: number | null;

  companyName: string;

  hqCity: number | null;

  companyWebsite: string;

  title: string;

  role_id: number | null;

  experience_years: number | null;

  employment_status: number | null;

  review: string;

  overall_rating: number;

  work_life_balance: number;

  management: number;

  career_growth: number;

  work_environment: number;

  transparency: number;

  employee_value: number;

  is_anonymous: boolean;

  workCity: number | null;

  would_recommend: boolean | null;
};

const INITIAL_FORM_DATA: ReviewFormData = {
  title: "",
  role_id: null,
  experience_years: null,
  employment_status: null,
  review: "",
  overall_rating: 0,
  work_life_balance: 0,
  management: 0,
  career_growth: 0,
  work_environment: 0,
  transparency: 0,
  employee_value: 0,
  is_anonymous: true,

  companyId: null,
  companyName: "",
  hqCity: null,
  companyWebsite: "",

  workCity: null,

  would_recommend: null,
  };

    export default function ReviewFormSteps({
      companyId,
      companyName,
      onSubmit,
      onCancel,
      showHeader = true,
      mode = "create",
      initialData,
    }: Props) {

const [step, setStep] = useState(1);


  const resolvedInitialData = {
  ...INITIAL_FORM_DATA,

  ...initialData,

  companyId:
    companyId ??
    initialData?.company_id ??
    null,
};
  
 const [formData, setFormData] =
  useState<ReviewFormData>(
    resolvedInitialData
  );
 
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [draftLoaded, setDraftLoaded] =  useState(false);
  const [isNewCompany, setIsNewCompany] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [workCityInvalid, setWorkCityInvalid] = useState(false);
  const [hqCityInvalid, setHqCityInvalid] = useState(false);
  const router = useRouter();
  
  const isCompanyContext = !!companyId;

  const draftKey = companyId
  ? `reviewFormDraft_company_${companyId}`
  : "reviewFormDraft_general";
 

    const [jobTitle, setJobTitle] = useState( initialData?.roleName || ""
      );

      useEffect(() => {
      if (mode === "edit") {
        setJobTitle(
          initialData?.roles?.name ||
          initialData?.pending_role_name ||
          initialData?.roleName ||
          ""
        );
      }
    }, [mode, initialData]);

useEffect(() => {

  if (mode === "edit") {

  setDraftLoaded(true);

  return;
}

  const savedDraft =
  localStorage.getItem(
    draftKey
  );

    if (savedDraft) {

      const parsedDraft =
        JSON.parse(savedDraft);

      setFormData({
        ...INITIAL_FORM_DATA,
        ...parsedDraft,

        companyId:
          companyId ??
          parsedDraft.companyId,
      });

      if (parsedDraft.jobTitle) {
        setJobTitle(parsedDraft.jobTitle);
      }
    } else {
      // No draft yet — seed is_anonymous from the account's saved
      // preference instead of the hardcoded default.
      fetchDefaultAnonymity().then((defaultAnonymous) => {
        if (defaultAnonymous !== null) {
          setFormData((prev) => ({
            ...prev,
            is_anonymous: defaultAnonymous,
          }));
        }
      });
    }

  setDraftLoaded(true);

}, []);



useEffect(() => {

  if (mode === "edit") return;
  if (!draftLoaded) return;

    localStorage.setItem(
    draftKey,
    // jobTitle lives outside formData (it drives RoleAutocomplete
    // directly), so it has to be folded in here or drafts silently
    // lose the typed position on reload.
    JSON.stringify({ ...formData, jobTitle })
  );

}, [formData, jobTitle, draftLoaded]);


const validateStep1 = () => {
  const nextErrors: Record<string, string> = {};

  if (mode !== "edit" && !isCompanyContext) {
    const hasCompany =
      !!formData.companyId ||
      !!selectedCompany?.id ||
      isNewCompany;

    if (!hasCompany) {
      nextErrors.company = "Şirket seçimi zorunlu.";
    }

    if (isNewCompany && formData.hqCity === null) {
      nextErrors.hqCity = hqCityInvalid
        ? "Lütfen geçerli bir şehir giriniz."
        : "Genel merkez şehri zorunlu.";
    }
  }

  if (mode !== "edit" && !jobTitle.trim()) {
    nextErrors.role = "Pozisyon seçimi zorunlu.";
  }

  if (!formData.title.trim()) {
    nextErrors.title = "Başlık zorunlu.";
  } else if (formData.title.trim().length < 5) {
    nextErrors.title = "Başlık en az 5 karakter olmalı.";
  }

  if (formData.experience_years === null) {
    nextErrors.experience_years = "Deneyim seçimi zorunlu.";
  }

  if (formData.employment_status === null) {
    nextErrors.employment_status = "Çalışma durumu zorunlu.";
  }

  if (formData.workCity === null) {
    nextErrors.workCity = workCityInvalid
      ? "Lütfen geçerli bir şehir giriniz."
      : "Şehir seçimi zorunlu.";
  }

  if (formData.review.trim().length < 20) {
    nextErrors.review =
      "Yorum en az 20 karakter olmalı.";
  }

  return nextErrors;
};

const validateStep2 = () => {
  const nextErrors: Record<string, string> = {};

  if (!formData.overall_rating) {
    nextErrors.overall_rating =
      "Genel değerlendirme zorunlu.";
  }

  if (!formData.work_life_balance) {
    nextErrors.work_life_balance = "İş-yaşam dengesi seçimi zorunlu.";
  }

  if (!formData.management) {
    nextErrors.management = "Yönetim kalitesi seçimi zorunlu.";
  }

  if (!formData.career_growth) {
    nextErrors.career_growth = "Kariyer gelişimi seçimi zorunlu.";
  }

  if (!formData.work_environment) {
    nextErrors.work_environment = "Çalışma ortamı seçimi zorunlu.";
  }

  if (!formData.transparency) {
    nextErrors.transparency = "İletişim şeffaflığı seçimi zorunlu.";
  }

  if (!formData.employee_value) {
    nextErrors.employee_value = "Takdir ve değer görme seçimi zorunlu.";
  }

  if (formData.would_recommend === null) {
    nextErrors.would_recommend =
      "Tavsiye durumu zorunlu.";
  }

  return nextErrors;
};

const clearError = (field: string) => {
  setErrors((prev) => {
    if (!prev[field]) return prev;

    const next = { ...prev };
    delete next[field];
    return next;
  });
};

 const handleSubmit = (
  e: React.FormEvent
) => {
  e.preventDefault();
  submitForm();
};

const submitForm = async () => {

  if (loading) return;

  const step1Errors = validateStep1();
  const step2Errors = validateStep2();
  const allErrors = { ...step1Errors, ...step2Errors };

  if (Object.keys(allErrors).length > 0) {
    setErrors(allErrors);

    if (Object.keys(step1Errors).length > 0) {
      setStep(1);
    }

    return;
  }

  setErrors({});
  setSubmitError("");

  setLoading(true);
try {

    const {
  data: { user },
    } = await supabase.auth.getUser();

if (!user) {

  localStorage.setItem(
    "redirectAfterAuth",
    window.location.href
  );

  setShowAuthModal(true);

  return;
}

      let roleId = formData.role_id;
      let finalCompanyId =
        formData.companyId ||
        selectedCompany?.id;

      const pendingRoleName =
        !roleId && jobTitle.trim()
          ? jobTitle.trim()
          : null;
      
      const roleStatus =
        pendingRoleName
          ? "pending"
          : "approved";

      const companyStatus =
        isNewCompany
          ? "pending"
          : "approved";

      if (
          mode === "create" &&
          pendingRoleName
        ) {
        const {
          data: existingPending,
        } = await supabase
          .from("pending_roles")
          .select(
            "id, submission_count"
          )
          .eq(
            "suggested_name",
            pendingRoleName
          )
          .maybeSingle();

        if (existingPending) {
          const { error: bumpRoleError } = await supabase
            .from("pending_roles")
            .update({
              submission_count:
                (existingPending.submission_count ?? 0) + 1,
            })
            .eq("id", existingPending.id);

          if (bumpRoleError) {
            console.warn(bumpRoleError);
          }

        } else {

          const { error } =
          await supabase
            .from("pending_roles")
            .insert({
              suggested_name:
                pendingRoleName,
              user_id: user.id,
              source_type: "review",
              submission_count: 1,
            });

        // An orphaned suggestion here (no matching pending_roles row) can
        // never be approved by an admin — fail the whole submission
        // instead of just logging it.
        if (error) {
          console.warn(error);
          setSubmitError(translateSubmissionError(error.message));
          return;
        }
        }
      }



if (isNewCompany) {

  const {
    data: existingPending,
  } = await supabase
    .from("pending_companies")
    .select("id, submission_count")
    .eq(
      "suggested_name",
      formData.companyName.trim()
    )
    .maybeSingle();

  if (existingPending) {

    const { error: bumpCompanyError } = await supabase
      .from("pending_companies")
      .update({
        submission_count:
          (existingPending.submission_count ?? 0) + 1,
      })
      .eq("id", existingPending.id);

    if (bumpCompanyError) {
      console.warn(bumpCompanyError);
    }

  } else {

    const { error: pendingCompanyError } = await supabase
      .from("pending_companies")
      .insert({
        suggested_name:
          formData.companyName.trim(),

        user_id: user.id,

        source_type: "review",

        submission_count: 1,

        website:
          formData.companyWebsite?.trim() || null,

        hq_city: formData.hqCity,
      });

    if (pendingCompanyError) {
      console.warn(pendingCompanyError);
      setSubmitError(translateSubmissionError(pendingCompanyError.message));
      return;
    }
  }
}



      const reviewPayload = {
      company_id: finalCompanyId,
      
      role_id: roleId,
      
      moderation_status: "pending",

      role_status: roleStatus,

      company_status: companyStatus,

      pending_company_name:
        isNewCompany
          ? toTitleCaseTR(formData.companyName)
          : null,

      pending_role_name:
        pendingRoleName
          ? toTitleCaseTR(pendingRoleName)
          : null,
        
      user_id: user.id,

      title: formData.title,

      experience_years:
        formData.experience_years,

      employment_status:
        formData.employment_status,

      review: formData.review,
      
      work_city: formData.workCity,
      
      overall_rating:
        formData.overall_rating,

      work_life_balance:
        formData.work_life_balance,

      management:
        formData.management,

      career_growth:
        formData.career_growth,

      work_environment:
        formData.work_environment,

      transparency:
        formData.transparency,

      employee_value:
        formData.employee_value,

      would_recommend:
        formData.would_recommend,

      is_anonymous:
        formData.is_anonymous,
    };
    
let error = null;

if (mode === "edit") {

  const response = await supabase
    .from("company_reviews")
    .update(reviewPayload)
    .eq("id", initialData?.id)
    .eq("user_id", user.id)
    .select();

  error = response.error;

  // RLS can silently match 0 rows instead of erroring — without this,
  // the user sees "saved" while nothing actually changed.
  if (!error && (!response.data || response.data.length === 0)) {
    error = {
      message:
        "company_reviews: 0 rows updated (muhtemelen RLS engelledi)",
    };
  }

} else {

  const response = await supabase
    .from("company_reviews")
    .insert([reviewPayload]);

  error = response.error;
}

if (error) {
  // Expected/handled failure — console.warn instead of console.error
  // so Next's dev overlay doesn't treat an already-user-facing
  // message as an unhandled bug.
  console.warn(error);
  setSubmitError(translateSubmissionError(error.message));
  return;
}

    // Reset state
    setFormData({
  ...INITIAL_FORM_DATA,
  companyId: companyId ?? null,
});

fetchDefaultAnonymity().then((defaultAnonymous) => {
  if (defaultAnonymous !== null) {
    setFormData((prev) => ({
      ...prev,
      is_anonymous: defaultAnonymous,
    }));
  }
});

    setJobTitle("");

localStorage.removeItem(
  draftKey
);

setIsNewCompany(false);

if (mode === "edit") {

  setSaveSuccess(true);

  setTimeout(() => {

    router.push(
      "/my-posts?tab=Yorum"
    );

  }, 500);

  return;
}

setSubmitted(true);

    } finally {

  setLoading(false);

}
  };

  return (
      <> 

  {submitted ? (
  <FormSuccessMessage
    title=" Teşekkürler!"
    message="
      Yorumun başarıyla alındı.
      Yayınlanması biraz zaman alabilir.
    "
    icon={
      <CheckCircle2
        size={42}
        strokeWidth={1.8}
        className="form-success-icon"
      />
    }

     buttonText="Katkılarıma Git"
      onButtonClick={() =>
        router.push("/my-posts?tab=Yorum")
      }
  />
) : (

       <form
  onSubmit={handleSubmit}
  className="form-shell text-dark space-y-6"
>
  {/* Header */}
      {showHeader && (
        <div
          className="
            flex items-center justify-center
            gap-1
            px-4
            pb-2
            text-xl
            text-[var(--text-dark)]
            border-b-2 border-[#2a8f78]
          "
        >

          <ShieldCheck
            size={24}
            strokeWidth={2.75}
            className="
              mr-1
              text-[var(--lime)]
            "
          />

          {companyName ? (
            <>
              <span className="text-black/50">
                {companyName} · Anonim 
              </span>

                <span className="font-medium text-[var(--text-dark)]">
                Yorum 
              </span>

               <span className="text-black/50">
                Paylaş
              </span>
            </>
          ) : (
            <span className="text-black/50">
              Şirketine Anonim Yorum Ekle
            </span>
          )}

       </div>
      )}

  {/* Step Indicator */}
  <div className="mb-8">
    <div className="flex items-center justify-between mb-3">

      {/* Step 1 */}
      <div className="flex items-center gap-3">
        <div
          className={`
            h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold
            ${step >= 1
              ? "bg-[var(--accent)] text-white"
              : "bg-black/5 text-muted"}
          `}
        >
          1
        </div>

        <div>
          <p className="form-section-title">
            Yorumla
          </p>

          <p className="form-helper">
            Genel yorumlarını paylaş
          </p>
        </div>
      </div>

      <div className="h-px flex-1 mx-4 bg-black/10" />

      {/* Step 2 */}
      <div className="flex items-center gap-3">
        <div
          className={`
            h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold
            ${step >= 2
              ? "bg-[var(--accent)] text-white"
              : "bg-black/5 text-muted"}
          `}
        >
          2
        </div>

        <div>
          <p className="form-section-title">
            Puanla
          </p>

          <p className="form-helper">
            1 düşük, 5 mükemmel
          </p>
        </div>
      </div>
    </div>

    {/* Progress */}
    <div className="h-2 rounded-full bg-black/5 overflow-hidden">
      <div
        className={`
          h-full rounded-full bg-[var(--accent)]
          transition-all duration-300
          ${step === 1 ? "w-1/2" : "w-full"}
        `}
      />
    </div>
  </div>

  {/* STEP 1 */}
  {step === 1 && (
    <div className="space-y-5">

      {/* Title */}
      <div>
        <label className="form-label block mb-2">
          Başlık
        </label>

        <input
          maxLength={80}
          type="text"
          value={formData.title}
          onChange={(e) => {
            setFormData((prev) => ({
              ...prev,

              title: e.target.value,
            }));

            if (e.target.value.trim()) {
              clearError("title");
            }
          }}
          placeholder="Örn: Güçlü ekip kültürü, gelişim fırsatları var"
          className={`form-field ${
            errors.title ? "!border-red-500" : ""
          }`}
        />

        {errors.title && (
          <p className="text-xs text-[red] mt-1">
            {errors.title}
          </p>
        )}
      </div>

      {/* Job + Status */}
      <div className="grid gap-5">

          {/*Company autocomplete*/}
            {!isCompanyContext && (
            <div>
              <label className="form-label block mb-2">
                Şirket
              </label>

              {mode === "edit" ? (
                <div>
                  <div
                    className="
                      form-field
                      flex
                      items-center
                      !bg-gray-100
                    "
                  >
                    {formData.companyName || "-"}
                  </div>

                  <p className="text-xs text-[red] mt-1">
                    Şirket bilgisi düzenlenemez.
                  </p>
                </div>
              ) : (
                <>
                  <CompanyAutocomplete
                    value={formData.companyName}
                    placeholder="Şirket ara ya da öner..."
                    onChange={(value) => {
                      setFormData((prev) => ({
                        ...prev,
                        companyName: value,
                      }));

                      if (value.trim()) {
                        clearError("company");
                      }
                    }}
                    onCompanySelect={setSelectedCompany}
                    onNewCompanyChange={setIsNewCompany}
                    setFormData={setFormData}
                    inputClassName={
                      errors.company ? "!border-red-500" : ""
                    }
                  />

                  {errors.company && (
                    <p className="text-xs text-[red] mt-1">
                      {errors.company}
                    </p>
                  )}
                </>
              )}
        
           {isNewCompany && (
                      <div className="grid md:grid-cols-2 gap-5 mt-5">
                        <div>
                          <label className="form-label block mb-2">
                            Genel Merkez Şehri
                          </label>

                      <TurkishCitySelect
                             placeholder="Seç"
                             showChevron
                            value={formData.hqCity}
                            onChange={(value) => {
                              setFormData((prev) => ({
                                ...prev,

                                hqCity: value,

                                workCity:
                                  !prev.workCity
                                    ? value
                                    : prev.workCity,
                              }));

                              if (value !== null) {
                                clearError("hqCity");
                              }
                            }}
                            onInvalidChange={setHqCityInvalid}
                            className={
                              errors.hqCity ? "!border-red-500" : ""
                            }
                          />

                          {errors.hqCity && (
                            <p className="text-xs text-[red] mt-1">
                              {errors.hqCity}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="form-label block mb-2">
                            Website (Opsiyonel)
                          </label>

                          <input
                            type="text"
                            maxLength={200}
                            value={
                              formData.companyWebsite
                            }
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                companyWebsite:
                                  e.target.value,
                              })
                            }
                            className="form-field"
                          />
                        </div>
                      </div>
                    )}
        
        </div>

      )}

           </div>
        
        <div className="grid md:grid-cols-4 gap-5">
                  {/* Role autocomplete*/}
            
      <div>
            <label className="form-label block mb-2">
              Pozisyon
            </label>

           {mode === "edit" ? (
              <div>
                 <div
                  className="
                    form-field
                    flex
                    items-center
                    !bg-gray-100
                  "
                >
                  {jobTitle}
                </div>

                <p className="text-xs text-[red] mt-1">
                  Pozisyon bilgisi düzenlenemez.
                </p>
              </div>
            ) : (
              <>
                <RoleAutocomplete
                  roleSearch={jobTitle}
                  placeholder="Pozisyon ara ya da öner..."
                  setRoleSearch={(value) => {
                    setJobTitle(value);

                    if (value.trim()) {
                      clearError("role");
                    }
                  }}
                  selectedRoleId={formData.role_id}
                  onSelect={(roleId) =>
                    setFormData((prev) => ({
                      ...prev,
                      role_id: roleId,
                    }))
                  }
                  inputClassName={
                    errors.role ? "!border-red-500" : ""
                  }
                />

                {errors.role && (
                  <p className="text-xs text-[red] mt-1">
                    {errors.role}
                  </p>
                )}
              </>
            )}
          </div>
          <div>
            <label className="form-label block mb-2">
              Deneyim
            </label>

           <SelectDropdown
              value={formData.experience_years}
              onChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  experience_years: value,
                }));

                if (value !== null) {
                  clearError("experience_years");
                }
              }}
              options={experienceLevels.map((level) => ({
                value: level.id,
                label: level.name,
              }))}
              className={
                errors.experience_years ? "!border-red-500" : ""
              }
            />

            {errors.experience_years && (
              <p className="text-xs text-[red] mt-1">
                {errors.experience_years}
              </p>
            )}
          </div>


          <div>
            <label className="form-label block mb-2">
              Çalışma Durumu
            </label>

              <SelectDropdown
                value={formData.employment_status}
                onChange={(value) => {
                  setFormData((prev) => ({
                    ...prev,
                    employment_status: value,
                  }));

                  if (value !== null) {
                    clearError("employment_status");
                  }
                }}
                options={[
                  { value: 1, label: "Halen çalışıyor" },
                  { value: 2, label: "Eski çalışan" },
                ]}
                className={
                  errors.employment_status ? "!border-red-500" : ""
                }
              />

              {errors.employment_status && (
                <p className="text-xs text-[red] mt-1">
                  {errors.employment_status}
                </p>
              )}
          </div>

           <div>
            <label className="form-label block mb-2">
              Çalışılan Şube Şehri
            </label>

           <TurkishCitySelect
                             placeholder="Seç"
                             showChevron
                  value={formData.workCity}
                  onChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      workCity: value,
                    }));

                    if (value !== null) {
                      clearError("workCity");
                    }
                  }}
                  onInvalidChange={setWorkCityInvalid}
                  className={
                    errors.workCity ? "!border-red-500" : ""
                  }
                />

                {errors.workCity && (
                  <p className="text-xs text-[red] mt-1">
                    {errors.workCity}
                  </p>
                )}
          </div>
 </div>


      {/* Review */}
          <div>
            <label className="form-label block mb-2">
              Yorum{" "}
              <span className="font-normal text-[11px] text-[var(--muted-dark)]">
                (en az 20 karakter)
              </span>
            </label>

            <textarea
            maxLength={1200}
            value={formData.review}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,

                review: e.target.value,
              }));

              if (e.target.value.trim().length >= 20) {
                clearError("review");
              }
            }}
            className={`form-field ${
              errors.review ? "!border-red-500" : ""
            }`}
            />

            <div className="flex justify-end mt-1">
              <span className="text-[11px] text-[var(--muted-dark)]">
                {formData.review.length}/1200
                </span>
            </div>

            {errors.review && (
              <p className="text-xs text-[red] mt-1">
                {errors.review}
              </p>
            )}
          </div>

    </div>
  )}

  {/* STEP 2 */}
  {step === 2 && (
    <div className="flex flex-col gap-6">

      

      {/* Rating Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Card */}
          <div className="card-light p-5 rounded-3xl">
            <label className="form-label block mb-3">
              İş-Yaşam Dengesi
            </label>

            <RatingPills
              value={formData.work_life_balance}
              onChange={(value) => {
                setFormData((prev) => ({
                  ...prev,

                  work_life_balance: value,
                }));

                clearError("work_life_balance");
              }}
            />

            {errors.work_life_balance && (
              <p className="text-xs text-[red] mt-1">
                {errors.work_life_balance}
              </p>
            )}
          </div>

            {/* Card */}
          <div className="card-light p-5 rounded-3xl">
            <label className="form-label block mb-3">
              Yönetim Kalitesi
            </label>

            <RatingPills
              value={formData.management}
              onChange={(value) => {
                setFormData((prev) => ({
                  ...prev,

                  management: value,
                }));

                clearError("management");
              }}
            />

            {errors.management && (
              <p className="text-xs text-[red] mt-1">
                {errors.management}
              </p>
            )}
          </div>

        {/* Card */}
          <div className="card-light p-5 rounded-3xl">
            <label className="form-label block mb-3">
              Kariyer Gelişimi
            </label>

            <RatingPills
              value={formData.career_growth}
              onChange={(value) => {
                setFormData((prev) => ({
                  ...prev,

                  career_growth: value,
                }));

                clearError("career_growth");
              }}
            />

            {errors.career_growth && (
              <p className="text-xs text-[red] mt-1">
                {errors.career_growth}
              </p>
            )}
          </div>

          {/* Card */}
          <div className="card-light p-5 rounded-3xl">
            <label className="form-label block mb-3">
              Çalışma Ortamı{" "}
              <span className="font-normal text-[11px] text-[var(--muted-dark)]">
                (fiziksel/sosyal ortam)
              </span>
            </label>

            <RatingPills
              value={formData.work_environment}
              onChange={(value) => {
                setFormData((prev) => ({
                  ...prev,

                  work_environment: value,
                }));

                clearError("work_environment");
              }}
            />

            {errors.work_environment && (
              <p className="text-xs text-[red] mt-1">
                {errors.work_environment}
              </p>
            )}
          </div>
                {/* Card */}
                <div className="card-light p-5 rounded-3xl">
                  <label className="form-label block mb-3">
                    İletişim Şeffaflığı
                  </label>

                  <RatingPills
                    value={formData.transparency}
                    onChange={(value) => {
                      setFormData((prev) => ({
                        ...prev,

                        transparency: value,
                      }));

                      clearError("transparency");
                    }}
                  />

                  {errors.transparency && (
                    <p className="text-xs text-[red] mt-1">
                      {errors.transparency}
                    </p>
                  )}
                </div>

                {/* Card */}
                <div className="card-light p-5 rounded-3xl">
                  <label className="form-label block mb-3">
                    Takdir ve Değer Görme
                  </label>

                  <RatingPills
                    value={formData.employee_value}
                    onChange={(value) => {
                      setFormData((prev) => ({
                        ...prev,

                        employee_value: value,
                      }));

                      clearError("employee_value");
                    }}
                  />

                  {errors.employee_value && (
                    <p className="text-xs text-[red] mt-1">
                      {errors.employee_value}
                    </p>
                  )}
                </div>

      </div>


    {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Overall */}
        <div className="card-light p-5 rounded-3xl">

            <div>
               <label className="form-label block mb-3">
                Genel Puan
              </label>

           <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <FaStar
                  key={n}
                  size={28}
                  className={`cursor-pointer transition ${
                    formData.overall_rating >= n
                      ? "text-yellow-400 scale-105"
                      : "text-gray-500 hover:text-yellow-300"
                  }`}
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,

                      overall_rating: n,
                    }));

                    clearError("overall_rating");
                  }}
                />
              ))}
            </div>

            {errors.overall_rating && (
              <p className="text-xs text-[red] mt-1">
                {errors.overall_rating}
              </p>
            )}
          </div>
        </div>

          {/* Recommend */}
          <div className="card-light p-5 rounded-3xl">

            <p className="text-sm font-medium text-[var(--text-dark)] mb-3">
              Bu şirkette çalışmayı tavsiye eder misiniz?
            </p>

   <div className="flex gap-2">

                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      would_recommend: true,
                    }));

                    clearError("would_recommend");
                  }}
                  className={`
                    rounded-xl
                    px-4 py-2
                    text-sm
                    transition

                    ${
                      formData.would_recommend === true
                        ? "bg-green-600 text-white"
                        : "border border-black/10"
                    }
                  `}
                >
                  Evet
                </button>

         

 

<button
  type="button"
  onClick={() => {
    setFormData((prev) => ({
      ...prev,
      would_recommend: false,
    }));

    clearError("would_recommend");
  }}
  className={`
    rounded-xl
    px-4 py-2
    text-sm
    transition

    ${
      formData.would_recommend === false
        ? "text-white"
        : "border border-black/10"
    }
  `}
  style={
    formData.would_recommend === false
      ? {
          backgroundColor: "#dc2626",
        }
      : {}
  }
>
  Hayır
</button>

   </div>

   {errors.would_recommend && (
     <p className="text-xs text-[red] mt-2">
       {errors.would_recommend}
     </p>
   )}


          </div>
        {/* Privacy */}
        <div className="card-light p-5 rounded-3xl">
          <div>
             <label className="form-label block mb-3">
              Anonimlik
            </label>

              <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_anonymous}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,

                    is_anonymous:
                      e.target.checked,
                  }))
                }
                className="w-4 h-4"
              />

              <span className="text-sm text-[var(--muted-dark)]">
                Anonim paylaş
              </span>
            </label>
          </div>
        </div>

      </div>


    </div>
  )}

  {submitError && (
    <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-600 mt-6">
      {submitError}
    </div>
  )}

  {/* Navigation */}
  <div className="flex items-center justify-between mt-8 pt-6 border-t border-black/5">

<div>
  {step > 1 && (
    <button
      type="button"
      className="form-btn form-btn-secondary"
      onClick={() => setStep(step - 1)}
    >
      Geri
    </button>
  )}
</div>

    <div className="flex items-center gap-2">

        {(

            <button
              type="button"
              className="form-btn form-btn-secondary"
              onClick={() =>
                setShowExitConfirm(true)
              }
            >
              Vazgeç
            </button>
          )}

          {showExitConfirm && (
                         <ExitConfirmPopup
                           onCancel={() =>
                             setShowExitConfirm(false)
                           }
                           onConfirm={() => {

                           setShowExitConfirm(false);
                           setErrors({});
                           setSubmitError("");

                           localStorage.removeItem(
                              draftKey
                            );

                            setFormData({
                              ...INITIAL_FORM_DATA,
                              companyId: companyId ?? null,
                            });

                            setJobTitle("");

                            fetchDefaultAnonymity().then((defaultAnonymous) => {
                              if (defaultAnonymous !== null) {
                                setFormData((prev) => ({
                                  ...prev,
                                  is_anonymous: defaultAnonymous,
                                }));
                              }
                            });

                             if (onCancel) {
                               onCancel();
                             } else if (mode === "edit") {
                               router.push("/my-posts?tab=Yorum");
                             } else {
                               router.push("/share?tab=Yorum");
                             }
                           }}
                         />
                       )}
      {step < 2 ? (

        <button
          type="button"
          className="form-btn font-semibold"
          onClick={(e) => {
            e.preventDefault();

            const step1Errors = validateStep1();

            if (Object.keys(step1Errors).length > 0) {
              setErrors(step1Errors);
              return;
            }

            setErrors({});
            setStep(step + 1);
          }}
        >
          Devam Et
        </button>

      ) : (

 

          <button
            type="submit"
            disabled={loading}
            className="form-btn"
          >
            {loading
              ? mode === "edit"
                ? "Kaydediliyor..."
                : "Gönderiliyor..."
              : mode === "edit"
                ? "Kaydet"
                : "Gönder"}
          </button>

    

      )}

    </div>



  </div>

</form>
     )}

 {saveSuccess && (

<div
  className="
    mt-3

    flex items-center justify-center
    gap-2

    rounded-xl

    
    border border-green-200

    px-4 py-3

    text-sm
    font-medium

    text-green-600
  "
    style={{
    backgroundColor:
      "rgba(34, 197, 94, 0.08)",
  }}
>

          <span>✓</span>

          <span>
            Değişiklikler kaydedildi!
          </span>

        </div>

      )}

      {showAuthModal && (
        <div
         onClick={() => setShowAuthModal(false)}
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-black/35 backdrop-blur-sm
            p-4
          "
        >
          <div
             onClick={(e) => e.stopPropagation()}
             className="
              w-full max-w-sm
              overflow-hidden
              rounded-3xl
              border border-white/10
              bg-[var(--surface)]
              text-white
              shadow-xl
            "
          >

            {/* Tabs */}
            <div className="flex w-full border-b border-white/10">

              <button
                type="button"
                onClick={() => setAuthTab("login")}
                className={`
                  flex-1
                  py-4
                  text-sm
                  font-medium
                  transition-all

                  ${
                    authTab === "login"
                      ? `
                        bg-[var(--surface-2)]
                        text-white
                      `
                      : `
                        bg-transparent
                        text-[var(--muted)]
                        hover:bg-white/[0.05]
                        hover:text-white
                      `
                  }
                `}
              >
                Giriş Yap
              </button>

              <button
                type="button"
                onClick={() => setAuthTab("signup")}
                className={`
                  flex-1
                  py-4
                  text-sm
                  font-medium
                  transition-all

                  ${
                    authTab === "signup"
                      ? `
                        bg-[var(--surface-2)]
                        text-white
                      `
                      : `
                        bg-transparent
                        text-[var(--muted)]
                        hover:bg-white/[0.05]
                        hover:text-white
                      `
                  }
                `}
              >
                Kaydol
              </button>

            </div>

            {/* Body */}
            <div className="p-6">


              {authTab === "login" ? (

                

                <div className="space-y-4">
                   <h1 className="text-3xl font-bold mb-2 text-center">
                    Giriş Yap
                  </h1>
                  
                  <p className="text-[var(--muted)] mb-8 text-center">
                      <>
                      <span className="text-white">
                        insider
                      </span>

                      <span className="text-[var(--accent)]">
                        ol
                      </span>

                      {" "}hesabına giriş yap.
                    </>
                    </p>
              <AuthGoogleButton />
              <AuthDivider />
              <LoginForm
                onSuccess={() => {
                  setShowAuthModal(false);
                  submitForm();
                }}
              />

                </div>

              ) : (
                
              <div >
                <RegisterPanel />
              </div>
          

              )}

            </div>

          </div>
        </div>
      )}

    </>
    );
    }
