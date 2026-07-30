"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import TurkishCitySelect from "./TurkishCitySelect";
import SelectDropdown from "./SelectDropdown";
import CompanyAutocomplete from "./CompanyAutocomplete";
import RoleAutocomplete from "./RoleAutocomplete";
import LoginForm from "../auth/LoginForm";
import RegisterPanel from "../auth/RegisterPanel";
import AuthGoogleButton from "../auth/AuthGoogleButton";
import AuthDivider from "../auth/AuthDivider";
import FormSuccessMessage from "../ui/FormSuccessMessage";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import ExitConfirmPopup from "@/components/ui/ExitConfirmPopup";
import { toTitleCaseTR } from "@/app/constants/toTitleCaseTR";
import { fetchDefaultAnonymity } from "@/lib/fetchDefaultAnonymity";
import { translateSubmissionError } from "@/lib/translateSubmissionError";

type CompensationFormData = {
  id?: number;

  company_id: number | null;
  role_id: number | null;
  roleName?: string;
  pending_role_name?: string;
  companyName: string;
  hqCity: number | null;
  workCity: number | null;
  companyWebsite: string;
  salary_structure: number | null;
  salary_raise_policy: number | null;
  raise_frequency: number | null;
  bonus_policy: number | null;
  payment_regular: number | null;
  extra_support: string[];
  comment: string | null;

  is_anonymous: boolean;
}


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
  initialData?: CompensationFormData;

  onCancel?: () => void;
};

 const INITIAL_FORM_DATA: CompensationFormData = {
  company_id: null,
  role_id: null,
  salary_raise_policy: null,
  raise_frequency: null,
  bonus_policy: null,
  payment_regular: null,
  extra_support: [],
  salary_structure: null,
  comment: "",

  is_anonymous: true,

  companyName: "",
  hqCity: null,
  workCity: null,
  companyWebsite: "",
};

export default function CompensationForm({
  companyId,
  companyName,
  showHeader = true,
  mode = "create",
  initialData,
  onCancel,
}: Props){


  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
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


  const [formData, setFormData] =
    useState<CompensationFormData>(
      {
        ...INITIAL_FORM_DATA,
        ...initialData,

        company_id: companyId ?? initialData?.company_id ?? null,
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

  const isCompanyContext = !!companyId;
  const draftKey = companyId
  ? `compensationFormDraft_company_${companyId}`
  : "compensationFormDraft_general";

const handleSelectChange = (
  field: keyof CompensationFormData,
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

  }, [companyId, mode]);

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

const toggleExtraSupport = (
  support: string
) => {
  const current =
    formData.extra_support || [];

  // "Yok" and any real support type are mutually exclusive — same
  // rule as equipment_support in BenefitsForm.
  const updated = current.includes(support)
    ? current.filter(
        (item) => item !== support
      )
    : support === "Yok"
      ? ["Yok"]
      : [
          ...current.filter(
            (item) => item !== "Yok"
          ),
          support,
        ];

  setFormData((prev) => ({
    ...prev,
    extra_support: updated,
  }));

  if (updated.length > 0) {
    clearError("extra_support");
  }
};

const validate = () => {
  const nextErrors: Record<string, string> = {};

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

  if (formData.salary_structure === null) {
    nextErrors.salary_structure =
      "Yıllık maaş sayısı seçimi zorunlu.";
  }

  if (formData.salary_raise_policy === null) {
    nextErrors.salary_raise_policy =
      "Maaş artış düzeni seçimi zorunlu.";
  }

  if (formData.raise_frequency === null) {
    nextErrors.raise_frequency =
      "Maaş artış sıklığı seçimi zorunlu.";
  }

  if (formData.bonus_policy === null) {
    nextErrors.bonus_policy = "Prim sistemi seçimi zorunlu.";
  }

  if (formData.payment_regular === null) {
    nextErrors.payment_regular =
      "Maaş ödeme düzeni seçimi zorunlu.";
  }

  if (
    !formData.extra_support ||
    formData.extra_support.length === 0
  ) {
    nextErrors.extra_support =
      "Ek finansal destek seçimi zorunlu.";
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
          source_type: "compensation",
          submission_count: 1,
        });

    // An orphaned suggestion here (no matching pending_roles row) can
    // never be approved by an admin — fail the whole submission.
    if (error) {
      console.warn(error);
      setSubmitError(translateSubmissionError(error.message));
      return;
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

        source_type: "compensation",

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






      const payload = {
  company_id: finalCompanyId,

  user_id: user.id,

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
      
  work_city:
  formData.workCity,

  salary_structure:
    formData.salary_structure,

  salary_raise_policy:
    formData.salary_raise_policy,

  raise_frequency:
    formData.raise_frequency,

  bonus_policy:
    formData.bonus_policy,

  payment_regular:
    formData.payment_regular,

  extra_support:
    formData.extra_support,

  comment:
    formData.comment,

  is_anonymous:
    formData.is_anonymous,
};
    
   const { data, error } =
  mode === "edit"
    ? await supabase
        .from("company_compensation")
        .update(payload)
        .eq("id", initialData?.id)
        .eq("user_id", user.id)
        .select()
    : await supabase
        .from("company_compensation")
        .insert([payload]);

    if (error) {
      // Expected/handled failure — console.warn instead of console.error
      // so Next's dev overlay doesn't treat an already-user-facing
      // message as an unhandled bug.
      console.warn(error);
      setSubmitError(translateSubmissionError(error.message));
      return;
    }

    // RLS can silently match 0 rows instead of erroring — without this,
    // the user sees "saved" while nothing actually changed.
    if (mode === "edit" && (!data || data.length === 0)) {
      console.warn(
        "company_compensation: 0 rows updated (muhtemelen RLS engelledi)"
      );
      setSubmitError(translateSubmissionError());
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

    setRoleSearch("");

    if (mode === "edit") {

      setSaveSuccess(true);

      setTimeout(() => {

        router.push(
          "/my-posts?tab=Ücret Politikası"
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
              Ücret Politikası paylaşımın başarıyla alındı.
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
              router.push("/my-posts?tab=Ücret Politikası")
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
                Ücret Politikası 
              </span>

               <span className="text-black/50">
                Paylaş
              </span>
        </>
      ) : (
        <span className="text-black/50">
          Şirketine Anonim Ücret Politikası Ekle
        </span>
      )}

    </div>
  )}
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
    
    

    {/* Salary structure - yıllık maaş sayısı*/}
      <div>
        <label className="form-label block mb-2">
          Yıllık Maaş Sayısı
        </label>

        <SelectDropdown
          value={formData.salary_structure}
          onChange={(value) =>
            handleSelectChange(
              "salary_structure",
              value === null ? "" : String(value)
            )
          }
          options={[
            { value: 1, label: "12" },
            { value: 2, label: "13" },
            { value: 3, label: "14" },
            { value: 4, label: "15" },
            { value: 5, label: "16" },
            { value: 6, label: "17+" },
          ]}
          className={
            errors.salary_structure ? "!border-red-500" : ""
          }
        />

        {errors.salary_structure && (
          <p className="text-xs text-[red] mt-1">
            {errors.salary_structure}
          </p>
        )}
      </div>

      {/* Salary raise policy */}
      <div>
        <label className="form-label block mb-2">
          Maaş Artış Düzeni
        </label>

        <SelectDropdown
          value={formData.salary_raise_policy}
          onChange={(value) =>
            handleSelectChange(
              "salary_raise_policy",
              value === null ? "" : String(value)
            )
          }
          options={[
            { value: 1, label: "Enflasyon farkı oranında" },
            { value: 2, label: "Asgari ücret artış oranında" },
            { value: 3, label: "Performansa bağlı" },
            { value: 4, label: "Düzenli değil" },
          ]}
          className={
            errors.salary_raise_policy ? "!border-red-500" : ""
          }
        />

        {errors.salary_raise_policy && (
          <p className="text-xs text-[red] mt-1">
            {errors.salary_raise_policy}
          </p>
        )}
      </div>


      {/* Maaş Artış sıklığı - raise frequency */}
      <div>
        <label className="form-label block mb-2">
          Maaş Artış Sıklığı
        </label>

        <SelectDropdown
          value={formData.raise_frequency}
          onChange={(value) =>
            handleSelectChange(
              "raise_frequency",
              value === null ? "" : String(value)
            )
          }
          options={[
            { value: 1, label: "Yılda 1 kez" },
            { value: 2, label: "Yılda 2 kez" },
            { value: 3, label: "Düzenli değil" },
          ]}
          className={
            errors.raise_frequency ? "!border-red-500" : ""
          }
        />

        {errors.raise_frequency && (
          <p className="text-xs text-[red] mt-1">
            {errors.raise_frequency}
          </p>
        )}
      </div>
    
  </div>





   <div className="grid md:grid-cols-3 gap-5">
    
 {/* Prim bonus */}
      <div>
        <label className="form-label block mb-2">
          Prim Sistemi
        </label>

        <SelectDropdown
          value={formData.bonus_policy}
          onChange={(value) =>
            handleSelectChange(
              "bonus_policy",
              value === null ? "" : String(value)
            )
          }
          options={[
            { value: 1, label: "Yok" },
            { value: 2, label: "Satış ve Performans Bazlı Prim" },
            { value: 3, label: "Başarı ve Verimlilik Primi" },
            { value: 4, label: "Sadakat ve Devamlılık Primi" },
            { value: 5, label: "İş Güvenliği Primi" },
            { value: 6, label: "Diğer" },
          ]}
          className={
            errors.bonus_policy ? "!border-red-500" : ""
          }
        />

        {errors.bonus_policy && (
          <p className="text-xs text-[red] mt-1">
            {errors.bonus_policy}
          </p>
        )}
      </div>

      {/* Maaş Gecikmesi payment regular*/}
      <div>
        <label className="form-label block mb-2">
          Maaş Ödeme Düzeni
        </label>

        <SelectDropdown
          value={formData.payment_regular}
          onChange={(value) =>
            handleSelectChange(
              "payment_regular",
              value === null ? "" : String(value)
            )
          }
          options={[
            { value: 1, label: "Her zaman zamanında" },
            { value: 2, label: "Bazen gecikiyor" },
            { value: 3, label: "Sık gecikiyor" },
          ]}
          className={
            errors.payment_regular ? "!border-red-500" : ""
          }
        />

        {errors.payment_regular && (
          <p className="text-xs text-[red] mt-1">
            {errors.payment_regular}
          </p>
        )}
      </div>

      <div>
        <label className="form-label block mb-2">
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


    {/* Ek finansal destek extra support -  */}

    <div className="grid gap-5">

<div>
  <label className="form-label block mb-3">
    Ek Finansal Destek
  </label>

  <div className="flex flex-wrap gap-2">
    {[
      "Yok",
      "Eğitim Bütçesi",
      "Mesleki Gelişim Bütçesi",
      "Yakacak / Giyim / Erzak Yardımı",
      "Hediye Çeki (bayram, yılbaşı vb.)",
      "Sosyal Yardım (evlenme, doğum vb.)",
    ].map((support) => {
      const isSelected =
        formData.extra_support?.includes(
          support
        );

      return (
        <button
          key={support}
          type="button"
          onClick={() =>
            toggleExtraSupport(support)
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
          {support}
        </button>
      );
    })}
  </div>

  {errors.extra_support && (
    <p className="text-xs text-[red] mt-1">
      {errors.extra_support}
    </p>
  )}
</div>

</div>

   

{/* Comment */}
<div>
  <label className="form-label block mb-2">
    Ücret Politikasıyla ilgili eklemek istediğiniz bir şey var mı? (Opsiyonel)
  </label>

  <textarea
    maxLength={1200}
    value={formData.comment ?? ""}
        onChange={(e) =>
       setFormData((prev) => ({
       ...prev,
          comment: e.target.value,
        }))
      }
    className="form-field"
  />

      <div className="flex justify-end mt-1">
      <span className="text-[11px] text-[var(--muted-dark)]">
        {formData.comment?.length ?? 0}/1200
      </span>
    </div>
</div>

    {submitError && (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-600 mb-4">
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
                  router.push("/my-posts?tab=Ücret Politikası");
                } else {
                  router.push("/share?tab=Ücret Politikası");
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