type LoadMoreButtonProps = {
  onClick: () => void;
};

export default function LoadMoreButton({
  onClick,
}: LoadMoreButtonProps) {

  return (

    <div className="flex justify-center mt-2">

      <button
        onClick={onClick}
        className="
        w-full
        
        rounded-md

          bg-[var(--accent)]

          px-5 py-2.5

          text-sm
          font-medium

          text-white

          transition

          hover:bg-[var(--accent-hover)]
        "
      >
        Daha Fazla Göster
      </button>

    </div>

  );
}