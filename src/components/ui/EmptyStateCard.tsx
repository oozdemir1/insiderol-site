
import { LucideIcon } from "lucide-react";

type EmptyStateCardProps = {
  title: string;
  description: string;
  buttonText: string;
  onClick?: () => void;
  icon?: LucideIcon;
};

export default function EmptyStateCard({
  title,
  description,
  buttonText,
  onClick,
  icon,
}: EmptyStateCardProps) {

    const Icon = icon;

  return (

    <div
      className="
        card-light
        rounded-[2rem]
        p-8
        text-center
      "
    >
            {Icon && (

                <div className="mb-4 flex justify-center">

                    <Icon
                    size={32}
                    strokeWidth={1.75}
                    className="
                        text-[var(--muted-dark)]
                    "
                    />

                </div>

                )}
      <h3
        className="
          text-lg
          font-semibold
          text-[var(--text-dark)]
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-2

          text-sm

          text-[var(--muted-dark)]
        "
      >
        {description}
      </p>

      <button
        type="button"
        onClick={onClick}
        className="
        form-btn
        mt-6
        mx-auto
        "
      >
        {buttonText}
      </button>

    </div>

  );

}