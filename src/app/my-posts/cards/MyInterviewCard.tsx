import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import IconActionButton from "@/components/ui/IconActionButton";
import { Trash2 } from "lucide-react";
import DeleteConfirmPopup from "@/components/ui/DeleteConfirmPopup";
import {
  DIFFICULTY_LABELS,
  INTERVIEW_FORMAT_LABELS,
  SALARY_RANGE_LABELS,
} from "@/app/constants/interviewLabels";

type Props = {
  interview: any;
};

export default function MyInterviewCard({
  interview,
}: Props) {

const [
  showDeleteConfirm,
  setShowDeleteConfirm,
] = useState(false);

const [expanded, setExpanded] =
  useState(false);

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
        `/api/interviews/${interview.id}`,
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

const [
  showEditTooltip,
  setShowEditTooltip,
] = useState(false);

useEffect(() => {

  const createdAt =
    new Date(
      interview.created_at
    ).getTime();

  const now = Date.now();

  const diffMinutes =
    (now - createdAt) / 1000 / 60;

  setCanEdit(
    diffMinutes <= 15
  );

}, [interview.created_at]);

const difficultyLabel =
  DIFFICULTY_LABELS[
    interview.difficulty
  ] || "-";
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
      {interview.companies?.name}
    </h2>

    <p
      className="
        text-sm
        text-[var(--muted-dark)]
        mb-3
      "
    >
      {interview.roles?.name}
    </p>

  </div>

  <div className="flex items-center gap-2 shrink-0">

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
    {interview.is_anonymous
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
    {difficultyLabel}
  </div>

  </div>

</div>

  {interview.experience && (

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
    {interview.experience}
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
  <span>Mülakat Formatı</span>
  <span>
    {INTERVIEW_FORMAT_LABELS[
      interview.interview_format
    ] || "-"}
  </span>
</div>

<div className="flex justify-between">
  <span>Maaş Aralığı</span>
  <span>
    {SALARY_RANGE_LABELS[
      interview.salary_range
    ] || "-"}
  </span>
</div>

<div className="flex justify-between">
  <span>Başvuru Yılı</span>
  <span>
    {interview.application_year || "-"}
  </span>
</div>

<div className="flex justify-between">
  <span>Değerlendirme Türleri</span>

  <span className="text-right">
   {interview.assessment_types?.length
  ? interview.assessment_types.join(", ")
  : "-"}
  </span>
</div>

<div className="flex justify-between">
  <span>Mülakat Aşamaları</span>

  <span className="text-right">
    {interview.interview_stages?.length
      ? interview.interview_stages.join(", ")
      : "-"}
  </span>
</div>

  </div>
)}

{interview.experience && (
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
      interview.created_at
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
    href={`/my-posts/interviews/${interview.id}/edit`}
  >

    <IconActionButton
      icon={Pencil}
      label="Düzenle"
    />

  </Link>

) : (

  <div className="relative">

    <div
      onClick={() => {

        setShowEditTooltip(true);

        setTimeout(() => {

          setShowEditTooltip(false);

        }, 1000);

      }}
    >

      <IconActionButton
        icon={Pencil}
        label="Düzenle"
        disabled
      />

    </div>

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