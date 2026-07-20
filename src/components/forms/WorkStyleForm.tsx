"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import RoleAutocomplete from "./RoleAutocomplete";
import CompanyAutocomplete from "./CompanyAutocomplete";
import TurkishCitySelect from "./TurkishCitySelect";
import SelectDropdown from "./SelectDropdown";
import AuthGoogleButton from "../auth/AuthGoogleButton";
import AuthDivider from "../auth/AuthDivider";
import LoginForm from "../auth/LoginForm";
import RegisterForm from "../auth/RegisterForm";
import FormSuccessMessage from "../ui/FormSuccessMessage";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import ExitConfirmPopup from "@/components/ui/ExitConfirmPopup";
import { useRouter } from "next/navigation";
import { toTitleCaseTR } from "@/app/constants/toTitleCaseTR";
import { fetchDefaultAnonymity } from "@/lib/fetchDefaultAnonymity";
import { translateSubmissionError } from "@/lib/translateSubmissionError";


 type WorkStyleFormData = {
  id?: number;

  company_id: number | null;
  companyName: string;
  hqCity: number | null;
  workCity: number | null;
  companyWebsite: string;
  role_id: number | null;
  overtime_policy: number | null;
  working_hours: number | null;
  saturday_policy: number | null;
  remote_policy: number | null;
  comment: string | null;

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
  initialData?: any;

  onCancel?: () => void;
};


const INITIAL_FORM_DATA: WorkStyleFormData = {
  company_id: null,

  companyName: "",
  hqCity: null,
  workCity: null,
  companyWebsite: "",

  role_id: null,

  overtime_policy: null,
  working_hours: null,
  saturday_policy: null,
  remote_policy: null,

  comment: "",

  is_anonymous: true,
};
 

export default function WorkStyleForm({
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
};

const [formData, setFormData] =
  useState<WorkStyleFormData>({
    ...resolvedInitialData,

    company_id:
      companyId ??
      resolvedInitialData.company_id,
  });

const [roleSearch, setRoleSearch] =
  useState(
    initialData?.roleName || ""
  );
  useEffect(() => {
  if (mode === "edit") {
    setRoleSearch(
      initialData?.roles?.name ||
      initialData?.pending_role_name ||
      initialData?.roleName ||
      ""
    );
  }
}, [mode, initialData]);


const isCompanyContext = 
  !!formData.company_id;

  const draftKey = companyId
  ? `workStyleFormDraft_company_${companyId}`
  : "workStyleFormDraft_general";

  const handleSelectChange = (
  field: keyof WorkStyleFormData,
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

  if (mode === "edit") return;

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

  }, []);

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

    if (formData.overtime_policy === null) {
      nextErrors.overtime_policy = "Fazla mesai sıklığı seçimi zorunlu.";
    }

    if (formData.working_hours === null) {
      nextErrors.working_hours = "Çalışma saatleri seçimi zorunlu.";
    }

    if (formData.saturday_policy === null) {
      nextErrors.saturday_policy = "Çumartesi çalışması seçimi zorunlu.";
    }

    if (formData.remote_policy === null) {
      nextErrors.remote_policy = "Çalışma şekli seçimi zorunlu.";
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
          source_type: "work_style",
          submission_count: 1,
        });

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

        source_type: "work_style",

        submission_count: 1,
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

        overtime_policy:
          formData.overtime_policy,

        working_hours:
          formData.working_hours,

        saturday_policy:
          formData.saturday_policy,

        remote_policy:
          formData.remote_policy,

        comment:
          formData.comment,

        work_city:
          formData.workCity,

        is_anonymous:
          formData.is_anonymous,
      };

     const { error } =
  mode === "edit"
    ? await supabase
        .from("company_work_style")
        .update(payload)
        .eq("id", initialData?.id)
        .eq("user_id", user.id)
    : await supabase
        .from("company_work_style")
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

setRoleSearch("");

if (mode === "edit") {

  setSaveSuccess(true);

  setTimeout(() => {

    router.push(
      "/my-posts?tab=Çalışma Biçimi"
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
      Çalışma Biçimi paylaşımın başarıyla alındı.
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
        router.push("/my-posts?tab=Çalışma Biçimi")
      }
  />
) : (
  <form
    onSubmit={handleSubmit}
    className="form-shell text-dark space-y-6 "
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
                Çalışma Biçimi 
              </span>

               <span className="text-black/50">
                Paylaş
              </span>
        </>
      ) : (
        <span className="text-black/50">
          Şirketine Anonim Çalışma Biçimi Ekle
        </span>
      )}

    </div>
  )}

<div className="grid gap-5">
{
    (mode === "edit" || !isCompanyContext) && (
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

      <div className="grid md:grid-cols-3 gap-5">
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

               {/* Çalışma Saatleri */}
      <div>
        <label className="form-label block mb-2">
          Çalışma Saatleri
        </label>

        <SelectDropdown
          value={formData.working_hours}
          onChange={(value) =>
            handleSelectChange(
              "working_hours",
              value === null ? "" : String(value)
            )
          }
          options={[
            { value: 1, label: "08:00 - 17:00" },
            { value: 2, label: "08:30 - 17:30" },
            { value: 3, label: "09:00 - 18:00" },
            { value: 4, label: "Esnek" },
            { value: 5, label: "Vardiyalı" },
          ]}
          className={
            errors.working_hours ? "!border-red-500" : ""
          }
        />

        {errors.working_hours && (
          <p className="text-xs text-[red] mt-1">
            {errors.working_hours}
          </p>
        )}
      </div>
</div>

</div>
      


    <div className="grid md:grid-cols-4 gap-5">
      {/* Fazla Mesai */}
      <div>
        <label className="form-label block mb-2">
          Fazla Mesai Sıklığı
        </label>

        <SelectDropdown
          value={formData.overtime_policy}
          onChange={(value) =>
            handleSelectChange(
              "overtime_policy",
              value === null ? "" : String(value)
            )
          }
          options={[
            { value: 1, label: "Mesai yok" },
            { value: 2, label: "Ara sıra mesai" },
            { value: 3, label: "Sık mesai" },
            { value: 4, label: "Hafta sonu bile mesai" },
          ]}
          className={
            errors.overtime_policy ? "!border-red-500" : ""
          }
        />

        {errors.overtime_policy && (
          <p className="text-xs text-[red] mt-1">
            {errors.overtime_policy}
          </p>
        )}
      </div>

     

      {/* Cumartesi */}
      <div>
        <label className="form-label block mb-2">
          Cumartesi Çalışması
        </label>

        <SelectDropdown
          value={formData.saturday_policy}
          onChange={(value) =>
            handleSelectChange(
              "saturday_policy",
              value === null ? "" : String(value)
            )
          }
          options={[
            { value: 1, label: "Çalışılmıyor" },
            { value: 2, label: "Ayda 1 kez" },
            { value: 3, label: "Ayda 2 kez" },
            { value: 4, label: "Her hafta" },
          ]}
          className={
            errors.saturday_policy ? "!border-red-500" : ""
          }
        />

        {errors.saturday_policy && (
          <p className="text-xs text-[red] mt-1">
            {errors.saturday_policy}
          </p>
        )}
      </div>

      {/* Çalışma Düzeni */}
      <div>
        <label className="form-label block mb-2">
          Çalışma Şekli
        </label>

        <SelectDropdown
          value={formData.remote_policy}
          onChange={(value) =>
            handleSelectChange(
              "remote_policy",
              value === null ? "" : String(value)
            )
          }
          options={[
            { value: 1, label: "Tam Uzaktan" },
            { value: 2, label: "Uzaktan Ağırlıklı Hibrit" },
            { value: 3, label: "Dengeli Hibrit" },
            { value: 4, label: "Ofis Ağırlıklı Hibrit" },
            { value: 5, label: "Tam İş Yerinde" },
          ]}
          className={
            errors.remote_policy ? "!border-red-500" : ""
          }
        />

        {errors.remote_policy && (
          <p className="text-xs text-[red] mt-1">
            {errors.remote_policy}
          </p>
        )}
      </div>

 {/* Anonimlik */}
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



    {/* Comment */}
<div>
  <label className="form-label block mb-2">
    Çalışma düzeniyle ilgili eklemek istediğiniz bir şey var mı? (Opsiyonel)
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
                  router.push("/my-posts?tab=Çalışma Biçimi");
                } else {
                  router.push("/");
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