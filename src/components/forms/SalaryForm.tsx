"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import RatingPills from "../RatingPills";
import LoginForm from "../auth/LoginForm";
import RegisterForm from "../auth/RegisterForm";
import AuthGoogleButton from "../auth/AuthGoogleButton";
import AuthDivider from "../auth/AuthDivider";
import RoleAutocomplete from "./RoleAutocomplete";
import CompanyAutocomplete from "./CompanyAutocomplete";
import TurkishCitySelect from "./TurkishCitySelect";
import SelectDropdown from "./SelectDropdown";
import FormSuccessMessage from "../ui/FormSuccessMessage";
import { CheckCircle2 } from "lucide-react";
import { experienceLevels } from "@/app/constants/experienceLevels";
import ExitConfirmPopup from "@/components/ui/ExitConfirmPopup";
import { useRouter } from "next/navigation";
import { toTitleCaseTR } from "@/app/constants/toTitleCaseTR";
import { fetchDefaultAnonymity } from "@/lib/fetchDefaultAnonymity";
import { translateSubmissionError } from "@/lib/translateSubmissionError";
import { ShieldCheck } from "lucide-react";



type SalaryFormProps = {
  companyId?: number;
  companyName?: string;
  hqCity?: number;
  showHeader?: boolean;
  mode?: "create" | "edit";
  initialData?: any;

  onCancel?: () => void;
};

type Company = {
  id: number;
  name: string;
  hq_city: number | null;
};    

    type SalaryFormData = {
      companyId: number | null;
      companyName: string;
      companyWebsite: string;
      hqCity: number | null;

      roleName: string;
      
      
      workCity: number | null;
     

      role_id: number | null;

      experienceYears: number | null;

      salary: string;
      salarySatisfaction: number | null;

      techStack: string;
      comment: string;

      is_anonymous: boolean;
    };


const INITIAL_FORM_DATA: SalaryFormData = {
   companyId: null,
    role_id: null,

    roleName: "",
    companyName: "",
    hqCity: null,
    workCity: null,
    companyWebsite: "",
    salary: "",
    salarySatisfaction: null,
    experienceYears: null,
    techStack: "",
    comment: "",

    is_anonymous: true,
  }

export default function SalaryForm({
  companyId,
  companyName,
  hqCity,
  showHeader = true,
  mode = "create",
  initialData,
  onCancel,
}: SalaryFormProps) {

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [isNewCompany, setIsNewCompany] =  useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authTab, setAuthTab] = useState<"login" | "signup">("login");
    const [draftLoaded, setDraftLoaded] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState("");
    const [workCityInvalid, setWorkCityInvalid] = useState(false);
    const [hqCityInvalid, setHqCityInvalid] = useState(false);
    const router = useRouter();


   const resolvedInitialData = {

  ...INITIAL_FORM_DATA,

  ...initialData,

  companyId:
    initialData?.company_id ??
    companyId ??
    null,

  experienceYears:
    initialData?.experience_years ??
    null,

  salarySatisfaction:
    initialData?.salary_satisfaction ??
    null,

  techStack:
    initialData?.tech_stack ??
    "",

  roleName:
  initialData?.roles?.name ??
  initialData?.pending_role_name ??
  "",

  // `salaries.salary` is a plain integer in the DB, but the input
  // (and every handler that touches formData.salary) works with the
  // dot-formatted string shown on screen ("82.000"), same as onChange
  // produces while typing.
  salary:
    initialData?.salary != null
      ? String(initialData.salary).replace(
          /\B(?=(\d{3})+(?!\d))/g,
          "."
        )
      : "",

};
    
  const [formData, setFormData] =
  useState<SalaryFormData>(resolvedInitialData);

  const isCompanyContext = !!companyId;

  const draftKey = companyId
  ? `salaryFormDraft_company_${companyId}`
  : "salaryFormDraft_general";

  // Roles table ids for software/data/tech-adjacent positions — matched
  // by id (language-independent) once a real role is selected, instead
  // of guessing from the display name. Includes both the "Developer"
  // and "Engineer" naming variants in case only one survived a merge.
  const TECH_ROLE_IDS = new Set([
    250, 83, 84, 248, 85, 249, 162, 163, 164, 165, 166, 193, 110, 119, 175,
  ]);

  // Fallback for roles that don't have a resolved id yet (brand-new,
  // still-pending suggestions) — a best-effort guess from the typed
  // name until it's an actual `roles` row.
  const TECH_ROLE_KEYWORDS = [
    "developer",
    "engineer",
    "frontend",
    "backend",
    "fullstack",
    "mobile",
    "ios",
    "android",
    "devops",
    "data",
    "technologist",
    "big data",
    "data analyst",
    "yazılım",
    "geliştirici",
  ];

const normalizedRole =
  (formData.roleName || "")
    .toLowerCase();

const shouldShowTechStack = formData.role_id
  ? TECH_ROLE_IDS.has(formData.role_id)
  : TECH_ROLE_KEYWORDS.some((keyword) =>
      normalizedRole.includes(keyword)
    );


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

      companyName:
        companyName ??
        parsedDraft.companyName,

      hqCity:
        hqCity ??
        parsedDraft.hqCity,
    });
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

  if (!draftLoaded) return;

  localStorage.setItem(
  draftKey,
    JSON.stringify(formData)
  );

}, [formData, draftLoaded]);


const validate = () => {
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

  if (mode !== "edit" && !formData.roleName.trim()) {
    nextErrors.role = "Pozisyon seçimi zorunlu.";
  }

  if (formData.workCity === null) {
    nextErrors.workCity = workCityInvalid
      ? "Lütfen geçerli bir şehir giriniz."
      : "Şehir seçimi zorunlu.";
  }

  if (formData.experienceYears === null) {
    nextErrors.experienceYears = "Deneyim seçimi zorunlu.";
  }

  if (!formData.salarySatisfaction) {
    nextErrors.salarySatisfaction =
      "Maaş memnuniyeti zorunlu.";
  }

  const normalizedSalary = Number(
    formData.salary.replace(/\./g, "")
  );

  if (
    !formData.salary ||
    normalizedSalary < 10000 ||
    normalizedSalary > 1000000
  ) {
    nextErrors.salary =
      "Lütfen maaşı aylık TL tutarı olarak giriniz. Örn: 70.000";
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

  const validationErrors = validate();

  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
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
  formData.companyId ||
  selectedCompany?.id;

 const roleId = formData.role_id;

const isPendingRole =
  !roleId &&
  formData.roleName?.trim();

  if (isPendingRole) {

  const normalizedName =
    formData.roleName
      .toLowerCase()
      .trim();

    const {
      data: existingPending,
    } = await supabase
      .from("pending_roles")
      .select(
        "id, submission_count"
      )
    .eq(
      "suggested_name",
      formData.roleName.trim()
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
          formData.roleName.trim(),
        user_id: user.id,
        source_type: "salary",
        submission_count: 1,
      });

  // If this insert silently fails, the salary row below still gets
  // submitted with pending_role_name set — but with no matching
  // pending_roles row, an admin has nothing to approve and it's
  // orphaned forever. Fail the whole submission instead.
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

        source_type: "salary",

        submission_count: 1,

        website:
          formData.companyWebsite?.trim() || null,

        hq_city: formData.hqCity,
      });

    // Same reasoning as the pending_roles insert above — an orphaned
    // suggestion here can never be approved by an admin.
    if (pendingCompanyError) {
      console.warn(pendingCompanyError);
      setSubmitError(translateSubmissionError(pendingCompanyError.message));
      return;
    }
  }
}

const normalizedSalary = Number(
  formData.salary.replace(/\./g, "")
);

    const roleStatus =
  !roleId
    ? "pending"
    : "approved";

    const companyStatus =
  isNewCompany
    ? "pending"
    : "approved";

const salaryPayload = {
  company_id: finalCompanyId,

  role_id: roleId,

  pending_role_name:
  !roleId
    ? toTitleCaseTR(formData.roleName)
    : null,

    moderation_status: "pending",

    role_status: roleStatus,

    company_status: companyStatus,
    
    pending_company_name:
  isNewCompany
    ? toTitleCaseTR(formData.companyName)
    : null,
  user_id: user.id,

  salary: normalizedSalary,

  salary_satisfaction:
    formData.salarySatisfaction,

  work_city:
    formData.workCity,

  experience_years:
    formData.experienceYears,

  tech_stack:
    formData.techStack,

  comment:
    formData.comment,

  is_anonymous:
    formData.is_anonymous,
};

let error = null;

if (mode === "edit") {

  const response = await supabase
    .from("salaries")
    .update(salaryPayload)
    .eq("id", initialData.id)
    .eq("user_id", user.id)
    .select();

  error = response.error;

  // RLS can silently match 0 rows instead of erroring — without this,
  // the user sees "saved" while nothing actually changed.
  if (!error && (!response.data || response.data.length === 0)) {
    error = {
      message: "salaries: 0 rows updated (muhtemelen RLS engelledi)",
    };
  }

} else {

  const response = await supabase
    .from("salaries")
    .insert([salaryPayload]);

  error = response.error;
}

if (error) {

  // Expected/handled failure (e.g. the pending-submission-limit trigger) —
  // console.warn instead of console.error so Next's dev overlay doesn't
  // treat an already-user-facing message as an unhandled bug.
  console.warn(error);

  setSubmitError(translateSubmissionError(error.message));

  return;
}

if (mode === "edit") {

  setSaveSuccess(true);

  setTimeout(() => {

  router.push(
    "/my-posts?tab=Maaş"
  );

}, 500);

  return;
}



  setSubmitted(true);
    localStorage.removeItem(
    draftKey
  );


  setFormData({
    ...INITIAL_FORM_DATA,

    companyId: companyId ?? null,

    companyName: companyName ?? "",

    hqCity: hqCity ?? null,
  });

  fetchDefaultAnonymity().then((defaultAnonymous) => {
    if (defaultAnonymous !== null) {
      setFormData((prev) => ({
        ...prev,
        is_anonymous: defaultAnonymous,
      }));
    }
  });

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
      Maaş paylaşımın başarıyla alındı.
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
        router.push("/my-posts?tab=Maaş")
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
                px-4 pb-2
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
                Maaş 
              </span>

               <span className="text-black/50">
                Paylaş
              </span>
                </>
              ) : (
                <span className="text-black/50">
                  Şirketine Anonim Maaş Ekle
                </span>
              )}
              

            </div>
          )}

          <div className="space-y-5">
            {
              !isCompanyContext && (
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
                               setFormData((prev: any) => ({
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

  <div className="grid md:grid-cols-3 gap-5">
          {/* Role autocomplete */}
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
                {formData.roleName || "-"}
              </div>

              <p className="text-xs text-[red] mt-1">
                Pozisyon bilgisi düzenlenemez.
              </p>
            </div>
          ) : (
            <>
              <RoleAutocomplete
                roleSearch={
                  formData.roleName
                }
                placeholder="Pozisyon ara ya da öner..."
                setRoleSearch={(value) => {
                  setFormData((prev) => ({
                    ...prev,
                    roleName: value,
                    role_id: null,
                  }));

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
        value={formData.experienceYears}
        onChange={(value) => {
          setFormData({
            ...formData,
            experienceYears: value,
          });

          if (value !== null) {
            clearError("experienceYears");
          }
        }}
        options={experienceLevels.map((level) => ({
          value: level.id,
          label: level.name,
        }))}
        className={
          errors.experienceYears ? "!border-red-500" : ""
        }
      />

      {errors.experienceYears && (
        <p className="text-xs text-[red] mt-1">
          {errors.experienceYears}
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
                setFormData((prev: any) => ({
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

  <div>
    <label className="form-label block mb-2">
      Aylık Net Maaş (₺){" "}
      <span className="font-normal text-[11px] text-[var(--muted-dark)]">
        (prim vb. hariç)
      </span>
    </label>

    <input
      type="text"
      placeholder="Örn: 70.000"
      maxLength={9}
      value={formData.salary}
      onChange={(e) => {
        const rawValue =
          e.target.value.replace(/\D/g, "");

        const limitedValue =
          rawValue.slice(0, 7);

        const formattedValue =
          limitedValue.replace(
            /\B(?=(\d{3})+(?!\d))/g,
            "."
          );

        setFormData((prev) => ({
        ...prev,
        salary: formattedValue,
      }));

        const numericValue = Number(limitedValue);

        if (
          numericValue >= 10000 &&
          numericValue <= 1000000
        ) {
          clearError("salary");
        }
      }}
      onBlur={() => {
        const numericValue = Number(
          formData.salary.replace(/\./g, "")
        );

        if (!numericValue) return;

        // Salary comparisons across users are noisier at odd values
        // ("₺72.536") than they are useful, so nudge submissions to
        // round ₺1.000 steps ("₺73.000") once the user is done typing
        // rather than fighting them mid-keystroke.
        const rounded =
          Math.round(numericValue / 1000) * 1000;

        const clamped = Math.min(
          Math.max(rounded, 10000),
          1000000
        );

        const formattedValue = String(
          clamped
        ).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        setFormData((prev) => ({
          ...prev,
          salary: formattedValue,
        }));

        clearError("salary");
      }}
      className={`form-field ${
        errors.salary ? "!border-red-500" : ""
      }`}
    />

    {errors.salary && (
      <p className="text-xs text-[red] mt-1">
        {errors.salary}
      </p>
    )}
  </div>

  <div>
    <label className="form-label block mb-3">
      Maaş Memnuniyeti{" "}
      <span className="font-normal text-[11px] text-[var(--muted-dark)]">
        (5 mükemmel)
      </span>
    </label>

    <RatingPills
            value={
              formData.salarySatisfaction ??
              0
            }
            onChange={(value) => {
              setFormData((prev) => ({
                ...prev,
                salarySatisfaction: value,
              }));

              clearError("salarySatisfaction");
            }}
          />

    {errors.salarySatisfaction && (
      <p className="text-xs text-[red] mt-1">
        {errors.salarySatisfaction}
      </p>
    )}
  </div>

 
        <div>
          <label className="form-label block mb-3">
            Anonimlik
          </label>
<div className="
  p-2.5
  rounded-lg
  border border-black/6
  bg-white

">
  <label className="flex items-center gap-3 cursor-pointer">
    <input
      type="checkbox"
      checked={formData.is_anonymous}
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          is_anonymous: e.target.checked,
        }))
      }
      className="w-4 h-4"
    />

    <span className="text-sm text-gray-600">
      Anonim paylaş
    </span>
  </label>
</div>
      </div>
</div>

      {shouldShowTechStack && (
        <div>
          <label className="form-label block mb-2">
            Tech Stack (Opsiyonel)
          </label>

          <input
            maxLength={100}
            type="text"
            value={formData.techStack}
            onChange={(e) =>
              setFormData({
                ...formData,
                techStack: e.target.value,
              })
            }
            className="form-field"
          />
        </div>
      )}

      

          <div>
            <label className="form-label block mb-2">
              Maaş deneyiminizle ilgili eklemek istediğiniz bir şey var mı? (Opsiyonel)
            </label>

            <textarea
              maxLength={1200}
              value={formData.comment}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  comment: e.target.value,
                })
              }
              className="form-field"
            />
              <div className="flex justify-end mt-1">
                <span className="text-[11px] text-[var(--muted-dark)]">
                  {formData.comment.length}/1200
                </span>
              </div>
          </div>

          {submitError && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-600">
              {submitError}
            </div>
          )}

          <div className="flex justify-end pt-6 border-t border-black/5">

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

                    setShowExitConfirm(false);
                    setErrors({});
                    setSubmitError("");

                    localStorage.removeItem(
                      draftKey
                    );

                    setFormData({
                      ...INITIAL_FORM_DATA,

                      companyId: companyId ?? null,

                      companyName: companyName ?? "",

                      hqCity: hqCity ?? null,
                    });

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
                      router.push("/my-posts?tab=Maaş");
                    } else {
                      router.push("/share?tab=Maaş");
                    }
                  }}
                />
              )}

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