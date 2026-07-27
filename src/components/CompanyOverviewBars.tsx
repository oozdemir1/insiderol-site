import RatingBar from "./RatingBar";

type SubRatings = {
  work_life_balance: number;
  management: number;
  career_growth: number;
  work_environment: number;
  transparency: number;
  employee_value: number;
};

const SUB_RATING_LABELS: Record<keyof SubRatings, string> = {
  work_life_balance: "İş-Yaşam Dengesi",
  management: "Yönetim Kalitesi",
  career_growth: "Kariyer Gelişimi",
  work_environment: "Çalışma Ortamı",
  transparency: "İletişim Şeffaflığı",
  employee_value: "Çalışana Değer",
};

const SUB_RATING_FIELDS = Object.keys(
  SUB_RATING_LABELS
) as (keyof SubRatings)[];

// Lives inside the "Yorum" tab (not above the tabs) so it only takes up
// space when reviews are actually what's being looked at, and computes
// from whatever review set is passed in — the caller decides whether
// that's all reviews or the role-filtered subset.
export default function ReviewRatingBars({ reviews }: { reviews: any[] }) {
  if (reviews.length === 0) return null;

  const averages = Object.fromEntries(
    SUB_RATING_FIELDS.map((field) => {
      const average =
        reviews.reduce((acc, r) => acc + (r[field] || 0), 0) /
        reviews.length;

      return [field, average];
    })
  ) as SubRatings;

  return (
    <div className="card-light rounded-2xl p-5 md:p-6 mb-4">
      <div className="grid md:grid-cols-2 gap-x-10 gap-y-5">
        {SUB_RATING_FIELDS.map((field) => (
          <RatingBar
            key={field}
            label={SUB_RATING_LABELS[field]}
            value={averages[field] || 0}
          />
        ))}
      </div>
    </div>
  );
}
