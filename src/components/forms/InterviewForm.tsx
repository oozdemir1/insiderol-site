"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import RoleAutocomplete from "./RoleAutocomplete";
import TurkishCitySelect from "./TurkishCitySelect";
import SelectDropdown from "./SelectDropdown";
import CompanyAutocomplete from "./CompanyAutocomplete";
import LoginForm from "../auth/LoginForm";
import RegisterForm from "../auth/RegisterForm";
import AuthGoogleButton from "../auth/AuthGoogleButton";
import AuthDivider from "../auth/AuthDivider";
import FormSuccessMessage from "../ui/FormSuccessMessage";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import ExitConfirmPopup from "@/components/ui/ExitConfirmPopup";
import { toTitleCaseTR } from "@/app/constants/toTitleCaseTR";
import { fetchDefaultAnonymity } from "@/lib/fetchDefaultAnonymity";
import { translateSubmissionError } from "@/lib/translateSubmissionError";



  type InterviewFormData = {

  id?: number;
  company_id: number | null;
  role_id: number | null;

  roleName?: string;
  pending_role_name?: string;

  companyName: string;
  hqCity: number | null;
  workCity: number | null;
  companyWebsite: string;

  seniority: number | null;
  process_length: number | null;
  difficulty: number | null;
  salary_range: number | null;

  interview_stages: string | null;
  interview_format: number | null;
  assessment_types: string | null;

  title: string;
  experience: string;
  application_year: number | null;

  is_anonymous: boolean;
};

  type Company = {
  id: number;
  name: string;
  hq_city: number | null;
};    

type Props = {
  companyId?: number;
  companyName?: string;
  hqCity?: number;
  showHeader?: boolean;

  mode?: "create" | "edit";
  initialData?: InterviewFormData;

  onCancel?: () => void;
};

  const INITIAL_FORM_DATA: InterviewFormData = {
  company_id: null,
  role_id: null,
  seniority: null,
  process_length: null,
  difficulty: null,
  salary_range: null,
  interview_format: null,
  interview_stages: null,
  assessment_types: null,
  title: "",
  experience: "",
  application_year: null,

  is_anonymous: true,

  companyName: "",
  hqCity: null,
  workCity: null,
  companyWebsite: "",
};


export default function InterviewForm({
  companyId,
  companyName,
  showHeader = true,
  mode = "create",
  initialData,
  onCancel,
}: Props){

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] =  useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [workCityInvalid, setWorkCityInvalid] = useState(false);
  const [hqCityInvalid, setHqCityInvalid] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedAssessments, setSelectedAssessments,] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isNewCompany, setIsNewCompany] =  useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const router = useRouter();



const [formData, setFormData] =
  useState<InterviewFormData>(
    {
      ...INITIAL_FORM_DATA,
      ...initialData,

      company_id:
        companyId ??
        initialData?.company_id ??
        null,
    }
  );

  const [roleSearch, setRoleSearch] = useState("");

useEffect(() => {
  if (mode === "edit") {
    setRoleSearch(
      initialData?.pending_role_name ||
      initialData?.roleName ||
      ""
    );
  }
}, [mode, initialData]);

useEffect(() => {
  if (
    mode === "edit" &&
    initialData
  ) {
    setSelectedStages(
      Array.isArray(
        initialData.interview_stages
      )
        ? initialData.interview_stages
        : []
    );

    setSelectedAssessments(
      Array.isArray(
        initialData.assessment_types
      )
        ? initialData.assessment_types
        : []
    );
  }
}, [mode, initialData]);

  const isCompanyContext = !!formData.company_id;
  const draftKey = companyId
  ? `interviewFormDraft_company_${companyId}`
  : "interviewFormDraft_general";

  useEffect(() => {

    if (mode === "edit") {
  setDraftLoaded(true);
  return;
}

  const savedDraft =
    localStorage.getItem(draftKey);
    

  if (savedDraft) {

    const parsedDraft =
      JSON.parse(savedDraft);

 setFormData({
  ...INITIAL_FORM_DATA,
  ...parsedDraft,

  company_id:
    companyId ??
    parsedDraft.company_id,
});

    if (parsedDraft.roleSearch) {
      setRoleSearch(parsedDraft.roleSearch);
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

}, [companyId]);

useEffect(() => {

  if (!draftLoaded) return;

 localStorage.setItem(
  draftKey,
  // roleSearch lives outside formData (it drives RoleAutocomplete
  // directly), so it has to be folded in here or drafts silently
  // lose the typed position on reload.
  JSON.stringify({ ...formData, roleSearch })
);

}, [formData, roleSearch, draftLoaded]);

  const handleSelectChange = (
    field: keyof InterviewFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,

      [field]:
        value === ""
          ? null
          : Number(value),
    }));

    if (value !== "") {
      clearError(field as string);
    }
  };

  const toggleStage = (stage: string) => {
    setSelectedStages((prev) => {
      if (prev.includes(stage)) {
        return prev.filter(
          (item) => item !== stage
        );
      }

      return [...prev, stage];
    });
  };

  const toggleAssessment = (
  assessment: string
) => {
  setSelectedAssessments((prev) => {
    if (prev.includes(assessment)) {
      return prev.filter(
        (item) => item !== assessment
      );
    }

    return [...prev, assessment];
  });
};

  const validateStep1 = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      nextErrors.title = "Başlık zorunlu.";
    } else if (formData.title.trim().length < 5) {
      nextErrors.title = "Başlık en az 5 karakter olmalı.";
    }

    if (mode !== "edit" && !isCompanyContext) {
      const hasCompany =
        !!formData.company_id ||
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

    if (mode !== "edit" && !roleSearch.trim()) {
      nextErrors.role = "Pozisyon seçimi zorunlu.";
    }

    if (formData.workCity === null) {
      nextErrors.workCity = workCityInvalid
        ? "Lütfen geçerli bir şehir giriniz."
        : "Şehir seçimi zorunlu.";
    }

    if (formData.seniority === null) {
      nextErrors.seniority = "Seviye seçimi zorunlu.";
    }

    if (formData.process_length === null) {
      nextErrors.process_length =
        "Süreç uzunluğu seçimi zorunlu.";
    }

    if (formData.difficulty === null) {
      nextErrors.difficulty = "Zorluk seviyesi seçimi zorunlu.";
    }

    if (formData.interview_format === null) {
      nextErrors.interview_format =
        "Görüşme formatı seçimi zorunlu.";
    }

    if (formData.salary_range === null) {
      nextErrors.salary_range = "Maaş aralığı seçimi zorunlu.";
    }

    if (formData.application_year === null) {
      nextErrors.application_year =
        "Başvuru yılı seçimi zorunlu.";
    }

    return nextErrors;
  };

  const validateStep2 = () => {
    const nextErrors: Record<string, string> = {};

    if (formData.experience.trim().length < 20) {
      nextErrors.experience =
        "Deneyim en az 20 karakter olmalı.";
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

    let finalCompanyId =
    formData.company_id ||
    selectedCompany?.id;

 let roleId = formData.role_id;

const pendingRoleName =
  !roleId && roleSearch.trim()
    ? roleSearch.trim()
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
    await supabase
      .from("pending_roles")
      .update({
        submission_count:
          (existingPending.submission_count ?? 0) + 1,
      })
      .eq("id", existingPending.id);

  } else {

    const { error } =
      await supabase
        .from("pending_roles")
        .insert({
          suggested_name:
            pendingRoleName,
          user_id: user.id,
          source_type: "interview",
          submission_count: 1,
        });

    if (error) {
      console.error(
        "pending role insert failed",
        error
      );
    }
  }
}

   
if (
  mode === "create" &&
  isNewCompany
) {

  const {
    data: existingPending,
  } = await supabase
    .from("pending_companies")
    .select(
      "id, submission_count"
    )
    .eq(
      "suggested_name",
      formData.companyName.trim()
    )
    .maybeSingle();

  if (existingPending) {

    await supabase
      .from("pending_companies")
      .update({
        submission_count:
          (existingPending.submission_count ?? 0) + 1,
      })
      .eq("id", existingPending.id);

  } else {

    await supabase
      .from("pending_companies")
      .insert({
        suggested_name:
          formData.companyName.trim(),

        user_id: user.id,

        source_type: "interview",

        submission_count: 1,

        website:
          formData.companyWebsite?.trim() || null,

        hq_city: formData.hqCity,
      });
  }
}



 const payload = {
  company_id: finalCompanyId,

  user_id: user.id,

  role_id: roleId,

  pending_company_name:
  isNewCompany
    ? toTitleCaseTR(formData.companyName)
    : null,

pending_role_name:
  pendingRoleName
    ? toTitleCaseTR(pendingRoleName)
    : null,

  moderation_status: "pending",

  role_status: roleStatus,

  company_status: companyStatus,

  work_city:
  formData.workCity,

  seniority:
    formData.seniority,

  process_length:
    formData.process_length,

  difficulty:
    formData.difficulty,

  salary_range:
    formData.salary_range,

  interview_format:
    formData.interview_format,

  application_year:
    formData.application_year,

  interview_stages:
    selectedStages.length > 0
      ? selectedStages
      : null,

  assessment_types:
    selectedAssessments.length > 0
      ? selectedAssessments
      : null,

  title:
    formData.title.trim() || null,

  experience:
    formData.experience.trim(),

  is_anonymous:
    formData.is_anonymous,
};


    const { error } =
  mode === "edit"
    ? await supabase
        .from("interview_experiences")
        .update(payload)
        .eq("id", initialData?.id)
        .eq("user_id", user.id)
    : await supabase
        .from("interview_experiences")
        .insert([payload]);

    if (error) {
      // Expected/handled failure — console.warn instead of console.error
      // so Next's dev overlay doesn't treat an already-user-facing
      // message as an unhandled bug.
      console.warn(error);

      setSubmitError(translateSubmissionError(error.message));

      return;
    }

   localStorage.removeItem(
  draftKey
);

setFormData({
  ...INITIAL_FORM_DATA,

  company_id: companyId ?? null,
});

fetchDefaultAnonymity().then((defaultAnonymous) => {
  if (defaultAnonymous !== null) {
    setFormData((prev) => ({
      ...prev,
      is_anonymous: defaultAnonymous,
    }));
  }
});

setSelectedStages([]);
setSelectedAssessments([]);
setRoleSearch("");

if (mode === "edit") {

  setSaveSuccess(true);

  setTimeout(() => {

    router.push(
      "/my-posts?tab=Mülakat Süreci"
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
            title="Teşekkürler!"
            message="      
              Mülakat Süreci paylaşımın başarıyla alındı.
              Yayınlanması biraz zaman alabilir.
            "
            icon={
              <CheckCircle2
                size={42}
                strokeWidth={1.8}
                className="form-success-icon"
              />
            }
             buttonText="Paylaşımlarıma Git"
              onButtonClick={() =>
              router.push("/my-posts?tab=Mülakat Süreci")
            }
          />
        ) : (
    <form
      onSubmit={handleSubmit}
      className="form-shell space-y-6 text-dark"
    >

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
                Mülakat Süreci 
              </span>

               <span className="text-black/50">
                Paylaş
              </span>
         </>
       ) : (
         <span className="text-black/50">
           Şirketine Anonim Mülakat Deneyimi Ekle
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
            Mülakat Bilgileri
          </p>

          <p className="form-helper">
            Süreç detaylarını paylaş
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
            Deneyim
          </p>

          <p className="form-helper">
            Mülakat deneyimini anlat
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

    {step === 1 && (
      <div className="space-y-5">

        <div>
      <label className="form-label block mb-2">
        Başlık
      </label>

      <input
        type="text"
        maxLength={150}
        value={formData.title ?? ""}
        onChange={(e) => {
          setFormData({
            ...formData,
            title: e.target.value,
          });

          if (e.target.value.trim()) {
            clearError("title");
          }
        }}
        placeholder="Örn: 3 aşamalı Senior Yazılım Geliştirici mülakatı"
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
      <div className="grid gap-5">
        {
          
              (!isCompanyContext || mode === "edit") && (
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

                      )
                    }
     {/* Role autocomplete */}
 <div className="grid md:grid-cols-2 gap-5">
      {/* Role  auto complete*/}

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
      {roleSearch || "-"}
    </div>

    <p className="text-xs text-[red] mt-1">
      Pozisyon bilgisi düzenlenemez.
    </p>
  </div>
) : (
  <>
    <RoleAutocomplete
      roleSearch={roleSearch}
      placeholder="Pozisyon ara ya da öner..."
      setRoleSearch={(value) => {
        setRoleSearch(value);

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
       </div>

      <div className="grid md:grid-cols-3 gap-5">

       

        {/* Seniority */}
        <div>
          <label className="form-label block mb-2">
            Seviye
          </label>

          <SelectDropdown
            value={formData.seniority}
            onChange={(value) =>
              handleSelectChange(
                "seniority",
                value === null ? "" : String(value)
              )
            }
            options={[
              { value: 1, label: "Stajyer" },
              { value: 2, label: "Başlangıç Seviyesi" },
              { value: 3, label: "Orta Seviye" },
              { value: 4, label: "Kıdemli" },
              { value: 5, label: "Takım Lideri+" },
            ]}
            className={
              errors.seniority ? "!border-red-500" : ""
            }
          />

          {errors.seniority && (
            <p className="text-xs text-[red] mt-1">
              {errors.seniority}
            </p>
          )}
        </div>

        {/* Process Length */}
        <div>
          <label className="form-label block mb-2">
            Süreç Uzunluğu
          </label>

          <SelectDropdown
            value={formData.process_length}
            onChange={(value) =>
              handleSelectChange(
                "process_length",
                value === null ? "" : String(value)
              )
            }
            options={[
              { value: 1, label: "1-2 hafta" },
              { value: 2, label: "2-4 hafta" },
              { value: 3, label: "1-2 ay" },
              { value: 4, label: "2 ay+" },
            ]}
            className={
              errors.process_length ? "!border-red-500" : ""
            }
          />

          {errors.process_length && (
            <p className="text-xs text-[red] mt-1">
              {errors.process_length}
            </p>
          )}
        </div>

        {/* Difficulty */}
        <div>
          <label className="form-label block mb-2">
            Zorluk Seviyesi
          </label>

          <SelectDropdown
            value={formData.difficulty}
            onChange={(value) =>
              handleSelectChange(
                "difficulty",
                value === null ? "" : String(value)
              )
            }
            options={[
              { value: 1, label: "Çok Kolay" },
              { value: 2, label: "Kolay" },
              { value: 3, label: "Orta" },
              { value: 4, label: "Zor" },
              { value: 5, label: "Çok Zor" },
            ]}
            className={
              errors.difficulty ? "!border-red-500" : ""
            }
          />

          {errors.difficulty && (
            <p className="text-xs text-[red] mt-1">
              {errors.difficulty}
            </p>
          )}
        </div>


        {/* Görüşme Şekli */}
        <div>
          <label className="form-label block mb-2">
             Görüşme Formatı 
          </label>

          <SelectDropdown
            value={formData.interview_format}
            onChange={(value) =>
              handleSelectChange(
                "interview_format",
                value === null ? "" : String(value)
              )
            }
            options={[
              { value: 1, label: "Yüz Yüze" },
              { value: 2, label: "Video" },
              { value: 3, label: "Hibrit" },
            ]}
            className={
              errors.interview_format ? "!border-red-500" : ""
            }
          />

          {errors.interview_format && (
            <p className="text-xs text-[red] mt-1">
              {errors.interview_format}
            </p>
          )}
        </div>

         {/* Maaş Aralığı */}
        <div>
          <label className="form-label block mb-2">
             Maaş Aralığı (Bin TL)
          </label>

          <SelectDropdown
            value={formData.salary_range}
            onChange={(value) =>
              handleSelectChange(
                "salary_range",
                value === null ? "" : String(value)
              )
            }
            options={[
              { value: 1, label: "Asgari Ücret" },
              { value: 2, label: "25+" },
              { value: 3, label: "50+" },
              { value: 4, label: "75+" },
              { value: 5, label: "100+" },
              { value: 6, label: "150+" },
              { value: 7, label: "200+" },
            ]}
            className={
              errors.salary_range ? "!border-red-500" : ""
            }
          />

          {errors.salary_range && (
            <p className="text-xs text-[red] mt-1">
              {errors.salary_range}
            </p>
          )}
        </div>

        {/* Application Year */}
        <div>
          <label className="form-label block mb-2">
            Başvuru Yılı
          </label>

          <SelectDropdown
            value={formData.application_year}
            onChange={(value) =>
              handleSelectChange(
                "application_year",
                value === null ? "" : String(value)
              )
            }
            options={[
              { value: 2026, label: "2026" },
              { value: 2025, label: "2025" },
              { value: 2024, label: "2024" },
              { value: 2023, label: "2023" },
              { value: 2022, label: "2022" },
              { value: 2021, label: "2021" },
              { value: 2020, label: "2020" },
              { value: 2019, label: "2019" },
              { value: 2018, label: "2018" },
              { value: 2017, label: "2017" },
            ]}
            className={
              errors.application_year ? "!border-red-500" : ""
            }
          />

          {errors.application_year && (
            <p className="text-xs text-[red] mt-1">
              {errors.application_year}
            </p>
          )}
        </div>
      </div>
      </div>
)}

{step === 2 && (
  <div className="space-y-5">
    

      {/* Interview Stages */}
      
      <div>
        <label className="form-label block mb-3">
          Mülakat Aşamaları (Opsiyonel)
        </label>

        <div className="flex flex-wrap gap-2">
          {[
            "İK",
            "Teknik",
            "Örnek Olay",
            "Canlı Kodlama",
            "Yönetici Görüşmesi",
            "Mini Proje (Take Home)",
            "Final Görüşmesi",
          ].map((stage) => {
            const isSelected =
              selectedStages.includes(stage);

            return (
              <button
                key={stage}
                type="button"
                onClick={() =>
                  toggleStage(stage)
                }
                 className={`
                    px-2 py-1 rounded-md border text-sm transition
                    ${
                      isSelected
                        ? "bg-black text-white border-black"
                        : "bg-white border-black/10 hover:border-black/30"
                    }
                  `}
              >
                {stage}
              </button>
            );
          })}
        </div>
    
 </div>

      {/* Interview Assessment */}
      <div>
        <label className="form-label block mb-3">
          Mülakat Değerlendirmesi (Opsiyonel)
        </label>

        <div className="flex flex-wrap gap-2">
          {[
            "Kişilik Envanteri",
            "Teknik Test",
            "İngilizce Testi",
            "Genel Yetenek",
            "Kodlama",
           ].map((assessment) => {
            const isSelected =
              selectedAssessments.includes(assessment);

            return (
              <button
                key={assessment}
                type="button"
                onClick={() =>
                  toggleAssessment(assessment)
                }
                className={`
                  px-2 py-1 rounded-md border text-sm transition
                  ${
                    isSelected
                      ? "bg-black text-white border-black"
                      : "bg-white border-black/10 hover:border-black/30"
                  }
                `}
              >
                {assessment}
              </button>
            );
          })}
        </div>
      </div>

      {/* Experience */}
      <div>
        <label className="form-label block mb-2">
          Deneyimini paylaş
        </label>

        <textarea
          maxLength={1200}
          value={formData.experience}
          onChange={(e) => {
            setFormData({
              ...formData,

              experience:
                e.target.value,
            });

            if (e.target.value.trim().length >= 20) {
              clearError("experience");
            }
          }}
          placeholder="Süreç nasıl geçti? Ne tür sorular soruldu? Genel deneyimin nasıldı?"
          className={`form-field min-h-[180px] ${
            errors.experience ? "!border-red-500" : ""
          }`}
        />

        <div className="flex justify-end mt-1">
          <span className="text-[11px] text-[var(--muted-dark)]">
            {
              formData.experience.length
            }
            /1200
          </span>
        </div>

        {errors.experience && (
          <p className="text-xs text-[red] mt-1">
            {errors.experience}
          </p>
        )}
      </div>

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
        )}

{submitError && (
  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-600 mt-6">
    {submitError}
  </div>
)}

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
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="form-btn form-btn-secondary"
            onClick={() => setShowExitConfirm(true)}
          >
            Vazgeç
          </button>

          {showExitConfirm && (
            <ExitConfirmPopup
              onCancel={() =>
                setShowExitConfirm(false)
              }
              onConfirm={() => {
                
                 localStorage.removeItem(
                  draftKey
                );

                setFormData({
                  ...INITIAL_FORM_DATA,
                  company_id: companyId ?? null,
                });

                setRoleSearch("");

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
                  router.push("/my-posts?tab=Mülakat Süreci");
                } else {
                  router.push("/");
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
                        setStep(2);
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
  
               <h1 className="text-3xl font-bold mb-2 text-center">
                Kaydol
                </h1>
  
              <div className="text-center mb-8">
  
                <span className="text-white">
                  insider
                </span>
  
                <span className="text-[var(--accent)]">
                  ol
                </span>
  
                {"'a katıl"}
  
              </div>
                <AuthGoogleButton />
                <AuthDivider />
              <RegisterForm />
        </div>
            
  
                )}
  
              </div>
  
            </div>
          </div>
        )}
  
      </>
      );
      }