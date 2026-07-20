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
        className="
            fixed
            inset-0

            z-50

            flex
            items-center
            justify-center

            bg-black/40

            rounded-3xl

        "
        >

<div
  className="
    w-[320px]

    rounded-2xl

    bg-white

    p-5

    shadow-[0_8px_30px_rgba(0,0,0,0.12)]
  "
>

  <p
    className="
      text-sm
      font-semibold

      text-[var(--text-dark)]
    "
  >
    Paylaşmaktan vazgeçmek istiyor musunuz?
  </p>

  <p
    className="
      mt-1

      text-xs

      text-black/50
    "
  >
    Yaptığınız değişiklikler kaydedilmeyecek.
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
    type="button"
      onClick={onCancel}
      className="
        rounded-xl

        border
        border-black/10

        px-3 py-1 pt-1.5

        text-sm

        text-[var(--text-dark)]
      "
    >
      İptal
    </button>

    <button
     type="button"
      onClick={onConfirm}
      className="
        rounded-xl

        px-3 py-1 pt-1.5

        text-sm
        font-medium

        text-white
      "
      style={{
        backgroundColor: "#dc2626",
      }}
    >
      Evet
    </button>

  </div>

</div>
        

    </div>

  );
}