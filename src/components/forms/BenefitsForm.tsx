"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import RoleAutocomplete from "./RoleAutocomplete";
import CompanyAutocomplete from "./CompanyAutocomplete";
import TurkishCitySelect from "./TurkishCitySelect";
import SelectDropdown from "./SelectDropdown";
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

  type BenefitsFormData = {
  id?: number;

  company_id: number | null;
  companyName: string;
  hqCity: number | null;
  workCity: number | null;
  companyWebsite: string;
  role_id: number | null;
  roleName?: string;
  pending_role_name?: string;
  meal_policy: number | null;
  transportation_policy: number | null;
  private_insurance: number | null;
  equipment_support: string[];
  comment: string;

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
  initialData?: BenefitsFormData;

  onCancel?: () => void;
};


const INITIAL_FORM_DATA: BenefitsFormData = {
  company_id: null,
  role_id: null,
  meal_policy: null,
  transportation_policy: null,
  private_insurance: null,
  equipment_support: [],
  comment: "",

  is_anonymous: true,

  companyName: "",
  hqCity: null,
  workCity: null,
  companyWebsite: "",
};

export default function BenefitsForm({
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

  const [formData, setFormData] =
  useState<BenefitsFormData>({
    ...INITIAL_FORM_DATA,
    ...initialData,
    company_id:
      companyId ??
      initialData?.company_id ??
      null,
  });

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


  const isCompanyContext = !!formData.company_id;
  const draftKey = companyId
  ? `benefitsFormDraft_company_${companyId}`
  : "benefitsFormDraft_general";

  const handleSelectChange = (
  field: keyof BenefitsFormData,
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

const toggleEquipmentSupport = (
  equipment: string
) => {
  const current =
    formData.equipment_support || [];

  // "Yok" and any real benefit are mutually exclusive — otherwise a
  // submission could claim both "no equipment support" and "Laptop"
  // at once, which is contradictory data.
  const updated = current.includes(equipment)
    ? current.filter(
        (item) => item !== equipment
      )
    : equipment === "Yok"
      ? ["Yok"]
      : [
          ...current.filter(
            (item) => item !== "Yok"
          ),
          equipment,
        ];

  setFormData((prev) => ({
    ...prev,
    equipment_support: updated,
  }));

  if (updated.length > 0) {
    clearError("equipment_support");
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

    if (formData.meal_policy === null) {
      nextErrors.meal_policy = "Yemek desteği seçimi zorunlu.";
    }

    if (formData.transportation_policy === null) {
      nextErrors.transportation_policy =
        "Ulaşım desteği seçimi zorunlu.";
    }

    if (formData.private_insurance === null) {
      nextErrors.private_insurance =
        "Özel sağlık sigortası seçimi zorunlu.";
    }

    if (
      !formData.equipment_support ||
      formData.equipment_support.length === 0
    ) {
      nextErrors.equipment_support =
        "Ekipman desteği seçimi zorunlu.";
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
          source_type: "benefits",
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

    await supabase
      .from("pending_companies")
      .update({
        submission_count:
          (existingPending.submission_count ?? 0) + 1,
      })
      .eq("id", existingPending.id);

  } else {

    const { error: pendingCompanyError } = await supabase
      .from("pending_companies")
      .insert({
        suggested_name:
          formData.companyName.trim(),

        user_id: user.id,

        source_type: "benefits",

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

      role_id: roleId,

      pending_role_name:
      pendingRoleName
        ? toTitleCaseTR(pendingRoleName)
        : null,

      pending_company_name:
       isNewCompany
        ? toTitleCaseTR(formData.companyName)
        : null,

      moderation_status: "pending",

      role_status: roleStatus,

     company_status: companyStatus,

      user_id: user.id,
        
      work_city:
        formData.workCity,

      meal_policy:
        formData.meal_policy,

      transportation_policy:
        formData.transportation_policy,

      private_insurance:
        formData.private_insurance,

      equipment_support:
        formData.equipment_support,

      comment:
        formData.comment,

      is_anonymous:
        formData.is_anonymous,
    };




    const { error } =
    mode === "edit"
      ? await supabase
          .from("company_benefits")
          .update(payload)
          .eq("id", initialData?.id)
          .eq("user_id", user.id)
      : await supabase
          .from("company_benefits")
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
      "/my-posts?tab=Yan Hak"
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
          Yan Hak paylaşımın başarıyla alındı.
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
        router.push("/my-posts?tab=Yan Hak")
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
                Yan Hak 
              </span>

               <span className="text-black/50">
                Paylaş
              </span>
        </>
      ) : (
        <span className="text-black/50">
          Şirketine Anonim Yan Hak Ekle
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
              Pozisyon girişi düzenlenemez.
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
      {/* Yemek */}
      <div>
        <label className="form-label block mb-2">
          Yemek Desteği
        </label>

        <SelectDropdown
          value={formData.meal_policy}
          onChange={(value) =>
            handleSelectChange(
              "meal_policy",
              value === null ? "" : String(value)
            )
          }
          options={[
            { value: 1, label: "Yok" },
            { value: 2, label: "Şirket yemeği" },
            { value: 3, label: "Yemek kartı" },
            { value: 4, label: "Nakit yemek desteği" },
          ]}
          className={
            errors.meal_policy ? "!border-red-500" : ""
          }
        />

        {errors.meal_policy && (
          <p className="text-xs text-[red] mt-1">
            {errors.meal_policy}
          </p>
        )}
      </div>

      {/* Ulaşım */}
      <div>
        <label className="form-label block mb-2">
          Ulaşım Desteği
        </label>

        <SelectDropdown
          value={formData.transportation_policy}
          onChange={(value) =>
            handleSelectChange(
              "transportation_policy",
              value === null ? "" : String(value)
            )
          }
          options={[
            { value: 1, label: "Yok" },
            { value: 2, label: "Servis" },
            { value: 3, label: "Toplu taşıma ücreti" },
            { value: 4, label: "Yakıt desteği" },
            { value: 5, label: "Araç tahsisi" },
          ]}
          className={
            errors.transportation_policy ? "!border-red-500" : ""
          }
        />

        {errors.transportation_policy && (
          <p className="text-xs text-[red] mt-1">
            {errors.transportation_policy}
          </p>
        )}
      </div>

      {/* Özel Sigorta */}
      <div>
        <label className="form-label block mb-2">
          Özel Sağlık Sigortası
        </label>

        <SelectDropdown
          value={formData.private_insurance}
          onChange={(value) =>
            handleSelectChange(
              "private_insurance",
              value === null ? "" : String(value)
            )
          }
          options={[
            { value: 1, label: "Yok" },
            { value: 2, label: "Var" },
          ]}
          className={
            errors.private_insurance ? "!border-red-500" : ""
          }
        />

        {errors.private_insurance && (
          <p className="text-xs text-[red] mt-1">
            {errors.private_insurance}
          </p>
        )}
      </div>


    </div>


 <div className="grid md:grid-cols-[66%_32%] gap-5">

      {/* Ekipman Desteği */}
<div>
  <label className="form-label block mb-2">
    Ekipman Desteği
  </label>

  <div className="flex flex-wrap gap-2">
    {[
      "Yok",
      "Cep Telefonu",
      "Home Office Desteği (masa vb.)",
      "Laptop",
      "Teknoloji Bütçesi",
    ].map((equipment) => {
      const isSelected =
        formData.equipment_support?.includes(
          equipment
        );

      return (
        <button
          key={equipment}
          type="button"
          onClick={() =>
            toggleEquipmentSupport(
              equipment
            )
          }
          className={`
            px-2 py-2 rounded-md border text-sm transition
            ${
              isSelected
                ? "bg-black text-white border-black"
                : "bg-white border-black/10 hover:border-black/30"
            }
          `}
        >
          {equipment}
        </button>
      );
    })}
  </div>

  {errors.equipment_support && (
    <p className="text-xs text-[red] mt-1">
      {errors.equipment_support}
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


    {/* Comment */}
<div>
  <label className="form-label block mb-2">
    Yan Haklar ile ilgili eklemek istediğiniz bir şey var mı? (Opsiyonel)
  </label>

  <textarea
    maxLength={1200}
    value={formData.comment}
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
          {formData.comment.length}/1200
        </span>
      </div>
</div>



    {submitError && (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-600 mb-4">
        {submitError}
      </div>
    )}

    <div className="flex justify-end gap-3 pt-6 border-t border-black/5">
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
                  router.push("/my-posts?tab=Yan Hak");
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