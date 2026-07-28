"use client";

import Link from "next/link";
import { experienceLevels } from "@/app/constants/experienceLevels";
import DeleteConfirmPopup from "@/components/ui/DeleteConfirmPopup";
import { turkishCities } from "@/app/constants/turkishCities";

import {
  Pencil,
  Trash2,
  Ghost,
} from "lucide-react";

import IconActionButton from "@/components/ui/IconActionButton";
import PostStatusBadge from "./PostStatusBadge";

import {
  useEffect,
  useState,
} from "react";

type Props = {
  salary: any;
};

export default function MySalaryCard({
  salary,
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
        `/api/salaries/${salary.id}`,
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
        salary.created_at
      ).getTime();

    const now = Date.now();


    const diffMinutes =
      (now - createdAt) / 1000 / 60;

    setCanEdit(
      diffMinutes <= 15
    );

  }, [salary.created_at]);

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
            {!salary.is_anonymous && salary.authorAvatarUrl ? (
              <img
                src={salary.authorAvatarUrl}
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
            {salary.companies?.name}
          </h2>

          <p
            className="
           text-sm
          text-[var(--muted-dark)]
          mt-1
            "
          >
            {salary.roles?.name}
          </p>

          <p className="text-xs text-[var(--muted-dark)] mt-0.5 mb-3">
            {!salary.is_anonymous && salary.authorUsername
              ? `@${salary.authorUsername}`
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
    moderationStatus={salary.moderation_status}
    roleStatus={salary.role_status}
    companyStatus={salary.company_status}
  />

  <div
    className="
      shrink-0

      rounded-md

      bg-[rgba(123,189,0,0.10)]

      px-2.5
      py-1

      text-xs
      font-medium

      text-[var(--text-dark)]
    "
  >
    {Number(
        salary.salary
        ).toLocaleString("tr-TR")} ₺
  </div>
</div>


    </div>



     {salary.comment && (
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
        {salary.comment}
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
                {getCityName(salary.work_city)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Deneyim</span>
              <span>
                {
                  experienceLevels.find(
                    (level) =>
                      level.id === salary.experience_years
                  )?.name || "-"
                }
              </span>
            </div>

            <div className="flex justify-between">
              <span>Maaş Memnuniyeti</span>
              <span>
                ⭐ {salary.salary_satisfaction}/5
              </span>
            </div>
          </div>

          
        )}
{salary.comment && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="
            
            mt-3
            mb-2
            text-sm
            font-medium
            text-[var(--primary)]
            hover:opacity-80"
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
            salary.created_at
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
              href={`/my-posts/salaries/${salary.id}/edit`}
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