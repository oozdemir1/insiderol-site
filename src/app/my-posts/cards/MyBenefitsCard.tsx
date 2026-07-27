"use client";

import Link from "next/link";
import DeleteConfirmPopup from "@/components/ui/DeleteConfirmPopup";
import { turkishCities } from "@/app/constants/turkishCities";

import {
  Pencil,
  Trash2,
} from "lucide-react";

import IconActionButton from "@/components/ui/IconActionButton";
import PostStatusBadge from "./PostStatusBadge";

import {
  useEffect,
  useState,
} from "react";

type Props = {
  benefit: any;
};

const mealPolicyMap: Record<number, string> = {
  1: "Yok",
  2: "Şirket yemeği",
  3: "Yemek kartı",
  4: "Nakit yemek desteği",
};

const transportationPolicyMap: Record<number, string> = {
  1: "Yok",
  2: "Servis",
  3: "Toplu taşıma ücreti",
  4: "Yakıt desteği",
  5: "Araç tahsisi",
};

const privateInsuranceMap: Record<number, string> = {
  1: "Yok",
  2: "Var",
};

export default function MyBenefitsCard({
  benefit,
}: Props) {


  const [
    showEditTooltip,
    setShowEditTooltip,
  ] = useState(false);

  const [
    showDeleteConfirm,
    setShowDeleteConfirm,
  ] = useState(false);

  const [expanded, setExpanded] = useState(false);

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
        `/api/benefits/${benefit.id}`,
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

const benefitCount = [
  benefit.meal_policy,
  benefit.transportation_policy,
  benefit.private_insurance,
].filter(
  (value) => value && value !== 1
).length + (
  benefit.equipment_support?.length &&
  !benefit.equipment_support.includes("Yok")
    ? 1
    : 0
);

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
    canEdit,
    setCanEdit,
  ] = useState(false);

  useEffect(() => {

    const createdAt =
      new Date(
        benefit.created_at
      ).getTime();

    const now = Date.now();

    const diffMinutes =
      (now - createdAt) / 1000 / 60;

    setCanEdit(
      diffMinutes <= 15
    );

  }, [benefit.created_at]);

  return (

    <div
      className="
        card-light
        overflow-visible

        w-full

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
      {benefit.companies?.name}
    </h2>

  
<p
  className="
     text-sm
     text-[var(--muted-dark)]
     mb-3
  "
>
  {benefit.roles?.name}
</p>

  </div>

<div className="ml-auto flex items-center gap-2">

<PostStatusBadge
  moderationStatus={benefit.moderation_status}
  roleStatus={benefit.role_status}
  companyStatus={benefit.company_status}
/>

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
  {benefit.is_anonymous
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
  {benefitCount} Yan Hak
</div>

</div>

</div>

    {benefit.comment && (
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
        {benefit.comment}
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
              {getCityName(benefit.work_city)}
            </span>
          </div>

          <div className="flex justify-between">
          <span>Yemek Desteği</span>
          <span>
            {mealPolicyMap[
              benefit.meal_policy
            ] || "-"}
          </span>
        </div>

          <div className="flex justify-between">
            <span>Ulaşım Desteği</span>
            <span>
              {transportationPolicyMap[
                benefit.transportation_policy
              ] || "-"}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Özel Sağlık Sigortası</span>
            <span>
              {privateInsuranceMap[
                benefit.private_insurance
              ] || "-"}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Ekipman Desteği</span>
            <span>
              {benefit.equipment_support?.length
                ? benefit.equipment_support.join(", ")
                : "-"}
            </span>
          </div>

      </div>
    )}

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

<div className="flex items-center justify-between">

  <p
    className="
      text-sm
      text-black/40
    "
  >
    {new Date(
      benefit.created_at
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
    href={`/my-posts/benefits/${benefit.id}/edit`}
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

</div>
      </div>

  

  );

}