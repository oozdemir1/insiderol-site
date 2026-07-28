"use client";

import Link from "next/link";
import DeleteConfirmPopup from "@/components/ui/DeleteConfirmPopup";
import { turkishCities } from "@/app/constants/turkishCities";

import {
  Ghost,
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
  workStyle: any;
};

export default function MyWorkStyleCard({
  workStyle,
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

  const getCityName = (
  cityId: number | null
) => {
  return (
    turkishCities.find(
      (city) => city.id === cityId
    )?.name || "-"
  );
};

  const handleDelete = async () => {

  if (deleting) return;

  try {

    setDeleting(true);

    const response =
      await fetch(
        `/api/work-styles/${workStyle.id}`,
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

const getRemotePolicy = (
  value: number | null
) => {
  switch (value) {
    case 1:
      return "Tam Uzaktan";
    case 2:
      return "Uzaktan Ağırlıklı Hibrit";
    case 3:
      return "Dengeli Hibrit";
    case 4:
      return "Ofis Ağırlıklı Hibrit";
    case 5:
      return "Tam İş Yerinde";
    default:
      return "-";
  }
};

const getWorkingHours = (
  value: number | null
) => {
  switch (value) {
    case 1:
      return "08:00 - 17:00";
    case 2:
      return "08:30 - 17:30";
    case 3:
      return "09:00 - 18:00";
    case 4:
      return "Esnek";
    case 5:
      return "Vardiyalı";
    default:
      return "-";
  }
};

const getOvertimePolicy = (
  value: number | null
) => {
  switch (value) {
    case 1:
      return "Mesai yok";
    case 2:
      return "Ara sıra mesai";
    case 3:
      return "Sık mesai";
    case 4:
      return "Hafta sonu bile mesai";
    default:
      return "-";
  }
};

const getSaturdayPolicy = (
  value: number | null
) => {
  switch (value) {
    case 1:
      return "Çalışılmıyor";
    case 2:
      return "Ayda 1 kez";
    case 3:
      return "Ayda 2 kez";
    case 4:
      return "Her hafta";
    default:
      return "-";
  }
};

  const [
    canEdit,
    setCanEdit,
  ] = useState(false);

  useEffect(() => {

    const createdAt =
      new Date(
        workStyle.created_at
      ).getTime();

    const now = Date.now();

    const diffMinutes =
      (now - createdAt) / 1000 / 60;

    setCanEdit(
      diffMinutes <= 15
    );

  }, [workStyle.created_at]);

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

  <div className="flex items-start gap-2.5 min-w-0">

    <div className="w-9 h-9 rounded-full bg-[var(--surface-2)] flex items-center justify-center shrink-0 overflow-hidden">
      {!workStyle.is_anonymous && workStyle.authorAvatarUrl ? (
        <img
          src={workStyle.authorAvatarUrl}
          alt=""
          className="w-full h-full object-cover"
        />
      ) : (
        <Ghost size={16} className="text-[var(--accent)]" />
      )}
    </div>

    <div className="min-w-0">

    <h2
      className="
        text-xl
        font-semibold
        text-[var(--text-dark)]
        truncate
      "
    >
      {workStyle.companies?.name}
    </h2>

    <p
      className="
       text-sm
        text-[var(--muted-dark)]
        mt-1
      "
    >
      {workStyle.roles?.name}
    </p>

    <p className="text-xs text-[var(--muted-dark)] mt-0.5 mb-3">
      {!workStyle.is_anonymous && workStyle.authorUsername
        ? `@${workStyle.authorUsername}`
        : "anonim"}
    </p>

    </div>

  </div>

  <div
    className="
      ml-auto

      flex
      items-center
      gap-2
    "
  >

    <PostStatusBadge
      moderationStatus={workStyle.moderation_status}
      roleStatus={workStyle.role_status}
      companyStatus={workStyle.company_status}
    />

    <div
      className="
        rounded-md

        bg-[rgba(123,189,0,0.10)]

        px-3
        py-1

        text-sm
        font-medium

        text-[var(--text-dark)]
      "
    >
      {getRemotePolicy(
        workStyle.remote_policy
      )}
    </div>

  </div>

</div>

   {workStyle.comment && (
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
        {workStyle.comment}
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
            {getCityName(workStyle.work_city)}
          </span>
        </div>



        <div className="flex justify-between">
          <span>Çalışma Saatleri</span>
          <span>
            {getWorkingHours(
              workStyle.working_hours
            )}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Fazla Mesai</span>
          <span>
            {getOvertimePolicy(
              workStyle.overtime_policy
            )}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Cumartesi Çalışması</span>
          <span>
            {getSaturdayPolicy(
              workStyle.saturday_policy
            )}
          </span>
        </div>

      </div>
    )}

    {workStyle.comment && (
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
      workStyle.created_at
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
    href={`/my-posts/work-styles/${workStyle.id}/edit`}
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