import Link from "next/link";
import {
  Pencil,
  Trash2,
  Info,
} from "lucide-react";
import IconActionButton from "@/components/ui/IconActionButton";
import { useState } from "react";
import DeleteConfirmPopup from "@/components/ui/DeleteConfirmPopup";
import { turkishCities } from "@/app/constants/turkishCities";
import { experienceLevels } from "@/app/constants/experienceLevels";
import {
  getEmploymentStatusLabel,
  renderStars,
} from "@/app/constants/reviewLabels";

type MyReviewCardProps = {
  review: any;
};

export default function MyReviewCard({
  review,
}: MyReviewCardProps) {
    

    const createdAt =
    new Date(review.created_at);

    const now = new Date();

    const diffInMinutes =
    (now.getTime() -
        createdAt.getTime()) /
    1000 /
    60;

    const canEdit =
    diffInMinutes <= 15;
    const [showEditTooltip, setShowEditTooltip] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [
      showDeleteConfirm,
      setShowDeleteConfirm,
    ] = useState(false);

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
        `/api/reviews/${review.id}`,
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


const getExperienceYears = (
  value: number | null
) => {
  return (
    experienceLevels.find(
      (level) => level.id === value
    )?.name || "-"
  );
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

  return (

    <div
      className="
        card-light

        w-full

        rounded-[2rem]

        p-6 md:p-7

        "
    >

      

        <div
          className="
            flex
            items-start
            gap-4
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
              {review.title}
            </h2>

            <p
              className="
         text-sm
        text-[var(--muted-dark)]
        mb-3
              "
            >
              {review.companies?.name}
              {" • "}
              {review.roles?.name}
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
            {review.is_anonymous
              ? "Anonim"
              : "Kullanıcı adı"}
          </div>

          <div
            className="
              relative

              shrink-0

              rounded-md

              bg-[rgba(123,189,0,0.12)]

              px-2.5 py-1

              text-sm
              font-medium

              text-[var(--text-dark)]
            "
          >
            <div className="flex items-center gap-1">

            <span>
              ⭐ {review.overall_rating}/5
            </span>

           <div className="group relative">

            <Info
              size={14}
              strokeWidth={2}
              className="cursor-help"
            />

            <div
              className="
                invisible

                absolute
                bottom-full
                right-0

                mb-2

                whitespace-nowrap

                rounded-md

                bg-black

                px-2 py-1

                text-xs
                text-white

                opacity-0

                shadow-lg

                transition-all

                group-hover:visible
                group-hover:opacity-100
              "
            >
              Genel şirket puanınız.
            </div>

          </div>

          </div>
          </div>

          </div>

        </div>

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
          {review.review}
        </p>


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
                    <span>Deneyim</span>
                    <span>
                      {getExperienceYears(
                        review.experience_years
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Çalışılan Şehir</span>
                    <span> {getCityName(review.work_city)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Çalışma Durumu</span>
                    <span>
                      {getEmploymentStatusLabel(
                        review.employment_status
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Tavsiye Durumu</span>
                    <span>
                      {review.would_recommend === true
                        ? "Evet"
                        : review.would_recommend === false
                          ? "Hayır"
                          : "-"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>İş-Yaşam Dengesi</span>
                    <span>
                    {renderStars(
                      review.work_life_balance
                    )}
                  </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Yönetim</span>
                    <span>
                      {renderStars(
                        review.management
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Kariyer Gelişimi</span>
                    <span>
                      {renderStars(
                        review.career_growth
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Çalışma Ortamı</span>
                    <span>
                      {renderStars(
                        review.work_environment
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Şeffaflık</span>
                    <span>
                      {renderStars(
                        review.transparency
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Çalışana Değer</span>
                    <span>
                      {renderStars(
                        review.employee_value
                      )}
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
                review.created_at
                ).toLocaleDateString("tr-TR", {
                day: "2-digit",
                month: "long",
                year: "2-digit",
                })}
            </p>

          <div className="flex items-center gap-0.5">

                {canEdit ? (

            <Link
                href={`/my-posts/reviews/${review.id}/edit`}
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