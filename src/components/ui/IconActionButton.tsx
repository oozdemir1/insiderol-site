import { LucideIcon } from "lucide-react";

type IconActionButtonProps = {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
  tooltip?: string;
};

export default function IconActionButton({
  icon: Icon,

  label,

  onClick,

  variant = "default",
  disabled = false,
  tooltip,
}: IconActionButtonProps) {

  return (

    <button
      onClick={() => {

        if (disabled) {
          return;
        }

        onClick?.();
      }}
      aria-label={label}
      title={tooltip || label}
         
      className={`
        flex items-center justify-center

        rounded-lg

        p-1

        transition

        $${
          disabled
            ? `
              cursor-not-allowed

              text-black/20
            `
            : variant === "danger"
            ? `
              text-red-500/70

              hover:bg-red-500/8
              hover:text-red-600
            `
            : `
              text-black/45

              hover:bg-black/5
              hover:text-[var(--text-dark)]
            `
        }
      `}
    >

      <Icon size={16} />

    </button>

  );
}