type Props = {
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteConfirmPopup({
  onCancel,
  onConfirm,
}: Props) {

  return (

    <div
      style={{
        right: "-25px",
      }}
      className="
        absolute

        bottom-full

        mb-3

        w-[280px]

        rounded-2xl

        border
        border-black/5

        bg-white

        p-4

        shadow-[0_8px_30px_rgba(0,0,0,0.12)]

        z-50
      "
    >

      <p
        className="
          text-sm
          font-semibold

          text-[var(--text-dark)]
        "
      >
        Emin misin?
      </p>

      <p
        className="
          mt-1

          text-xs

          text-black/50
        "
      >
        Bu işlem geri alınamaz.
      </p>

      <div
        className="
          mt-4

          flex
          justify-end
          gap-2
        "
      >

        <button
          onClick={onCancel}
          className="
            rounded-xl

            border
            border-black/10

            px-3 py-1

            text-sm

            text-[var(--text-dark)]
          "
        >
          İptal
        </button>

        <button
          onClick={onConfirm}
          className="
            rounded-xl

            px-3 py-1

            text-sm
            font-medium

            text-white
          "
          style={{
            backgroundColor: "#dc2626",
          }}
        >
          Sil
        </button>

      </div>

    </div>

  );
}