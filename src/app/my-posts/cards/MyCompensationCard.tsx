import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import IconActionButton from "@/components/ui/IconActionButton";
import { Trash2 } from "lucide-react";
import DeleteConfirmPopup from "@/components/ui/DeleteConfirmPopup";
import { turkishCities } from "@/app/constants/turkishCities";

type Props = {
  compensation: any;
};
const salaryStructureMap: Record<number, string> = {
  1: "12",
  2: "13",
  3: "14",
  4: "15",
  5: "16",
  6: "17+",
};

const raiseFrequencyMap: Record<number, string> = {
  1: "Yılda 1 kez",
  2: "Yılda 2 kez",
  3: "Düzenli değil",
};

const salaryRaisePolicyMap: Record<number, string> = {
  1: "Enflasyon farkı oranında",
  2: "Asgari ücret artış oranında",
  3: "Performansa bağlı",
  4: "Düzenli değil",
};

const bonusPolicyMap: Record<number, string> = {
  1: "Yok",
  2: "Satış ve Performans Bazlı Prim",
  3: "Başarı ve Verimlilik Primi",
  4: "Sadakat ve Devamlılık Primi",
  5: "İş Güvenliği Primi",
  6: "Diğer",
};

const paymentRegularMap: Record<number, string> = {
  1: "Her zaman zamanında",
  2: "Bazen gecikiyor",
  3: "Sık gecikiyor",
};


export default function MyCompensationCard({
  compensation,
}: Props) {

    const [
  showDeleteConfirm,
  setShowDeleteConfirm,
] = useState(false);

  const salaryStructureLabel =
  salaryStructureMap[
    compensation.salary_structure
  ] || "-";


    const [
    deleting,
    setDeleting,
    ] = useState(false);
    const handleDelete = async () => {

    if (deleting) return;

    try {

        setDeleting(true);

        const response =
        await fetch(
            `/api/compensations/${compensation.id}`,
            {
            method: "DELETE",
            }
        );

        if (!response.ok) {

        alert(
            "Paylaşım silinemedi"
        );

        return;
        }

        window.location.reload();

    } catch (error) {

        console.error(error);

        alert(
        "Paylaşım silinemedi"
        );

    } finally {

        setDeleting(false);

    }

    };

const [
  canEdit,
  setCanEdit,
] = useState(false);

const [expanded, setExpanded] =
  useState(false);

  const getCityName = (
  cityId: number | null
) => {
  return (
    turkishCities.find(
      (city) => city.id === cityId
    )?.name || "-"
  );
};

const [
  showEditTooltip,
  setShowEditTooltip,
] = useState(false);

useEffect(() => {

  const createdAt =
    new Date(
      compensation.created_at
    ).getTime();

  const now = Date.now();


  

  const diffMinutes =
    (now - createdAt) / 1000 / 60;

  setCanEdit(
    diffMinutes <= 15
  );

}, [compensation.created_at]);

  return (

  <div
    className="
      card-light
      rounded-[2rem]
      p-5 md:p-6
    "
  >

   <div
  className="
    flex
    items-start
    justify-between
    gap-3
  "
>

  <div>

    <h2
      className="
        text-xl
        font-semibold
        text-[var(--text-dark)]
      "
    >
      {compensation.companies?.name}
    </h2>

    <p
      className="
        text-sm
        text-[var(--muted-dark)]
        mb-3
      "
    >
      {compensation.roles?.name}
    </p>

  </div>

  <div className="ml-auto flex items-center gap-2">

  <div
  className="
    shrink-0

    rounded-md

    bg-black/5

    px-2.5
    py-1.5

    text-xs
    font-medium

    text-[var(--muted-dark)]
  "
>
  {compensation.is_anonymous
    ? "Anonim"
    : "Kullanıcı adı"}
</div>

  <div
  className="
    shrink-0

    rounded-md

    bg-[rgba(123,189,0,0.10)]

    px-3
    py-1

    text-sm
    font-medium

    text-[var(--text-dark)]
  "
>
   {salaryStructureLabel} Maaş
</div>

  </div>

</div>
    

   
  
    {compensation.comment && (

      <p
        className={`
          break-words
          whitespace-pre-wrap

          text-[15px]
          leading-7

          text-[var(--text-dark)]

          ${
            !expanded
              ? "line-clamp-2"
              : ""
          }
        `}
      >
        {compensation.comment}
      </p>

    )}

    {expanded && (
  <div
    className="
      mt-5
      space-y-2

      rounded-xl

      bg-black/[0.04]
      border border-black/5

      text-[var(--text-dark)]
      text-xs

      p-4
    "
  >
      <div className="flex justify-between">
        <span>Çalışılan Şehir</span>
        <span>
          {getCityName(
            compensation.work_city
          )}
        </span>
    </div>

  

        <div className="flex justify-between">
        <span>Zam Politikası</span>
        <span>
          {salaryRaisePolicyMap[
            compensation.salary_raise_policy
          ] || "-"}
        </span>
      </div>

      <div className="flex justify-between">
        <span>Zam Sıklığı</span>
        <span>
          {raiseFrequencyMap[
            compensation.raise_frequency
          ] || "-"}
        </span>
      </div>

      <div className="flex justify-between">
      <span>Prim Politikası</span>
      <span>
        {bonusPolicyMap[
          compensation.bonus_policy
        ] || "-"}
      </span>
    </div>

    <div className="flex justify-between">
      <span>Ödeme Düzeni</span>
      <span>
        {paymentRegularMap[
          compensation.payment_regular
        ] || "-"}
      </span>
    </div>

    <div className="flex justify-between">
      <span>Ek Destekler</span>
      <span className="text-right">
        {compensation.extra_support?.length
          ? compensation.extra_support.join(", ")
          : "-"}
      </span>
    </div>

  </div>
)}

    {compensation.comment &&
      (
        <button
          type="button"
          onClick={() =>
            setExpanded(!expanded)
          }
          className="
            mt-3
            mb-2
            text-sm
            font-medium

            text-[var(--primary)]

            hover:opacity-80
          "
        >
          {expanded
            ? "↑ Detayları Gizle"
            : "↓ Detayları Göster"}
        </button>
    )}

<div className="flex items-center justify-between">

  <p
    className="
      text-sm
      text-black/40
    "
  >
    {new Date(
      compensation.created_at
    ).toLocaleDateString(
      "tr-TR",
      {
        day: "2-digit",
        month: "long",
        year: "2-digit",
      }
    )}
  </p>
  <div className="flex items-center gap-0.5">

  {canEdit ? (

  <Link
    href={`/my-posts/compensations/${compensation.id}/edit`}
  >

    <IconActionButton
      icon={Pencil}
      label="Düzenle"
    />

  </Link>

) : (

  <div className="relative">

    <IconActionButton
      icon={Pencil}
      label="Düzenle"
      disabled={false}
      tooltip=""
      onClick={() => {

        setShowEditTooltip(true);

        setTimeout(() => {
          setShowEditTooltip(false);
        }, 1000);

      }}
    />
    

    {showEditTooltip && (

      <div
        className="
          absolute
          bottom-full
          left-1/2
          -translate-x-1/2
          mb-1

          whitespace-nowrap

          rounded-md

          bg-black
          px-2 py-1

          text-xs
          text-white

          shadow-md
        "
      >
        Süre doldu!
      </div>
      

    )}

  </div>

)}
   <div className="relative">

        <IconActionButton
          icon={Trash2}
          label="Sil"
          variant="danger"
          onClick={() =>
            setShowDeleteConfirm(true)
          }
        />

          {showDeleteConfirm && (

            <DeleteConfirmPopup
              onCancel={() =>
                setShowDeleteConfirm(false)
              }
              onConfirm={handleDelete}
            />

          )}

      </div>

</div>

  </div></div>

);
}