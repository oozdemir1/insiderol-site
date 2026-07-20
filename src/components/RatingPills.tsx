type Props = {
  value: number;
  onChange: (value: number) => void;
};

export default function RatingPills({
  value,
  onChange,
}: Props) {
    return (
      <div className="flex gap-2 flex-wrap">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
              className={`
                rating-pill
                ${value === n ? "rating-pill-active" : ""}
              `}
          >
            {n}
          </button>
        ))}
      </div>
    );
}