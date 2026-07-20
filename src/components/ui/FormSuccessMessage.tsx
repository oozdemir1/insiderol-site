type Props = {
  title: string;
  message: string;
  buttonText?: string;
  onButtonClick?: () => void;
  icon?: React.ReactNode;
};

export default function FormSuccessMessage({
  title,
  message,
  buttonText,
  onButtonClick,
  icon,
}: Props) {
  return (
<div className="form-success-card flex items-start gap-4">

  {icon && (
    <div className="shrink-0 pt-2.5">
      {icon}
    </div>
  )}

  <div>
    <h2 className="form-success-title">
      {title}
    </h2>

    <p className="form-success-message">
      {message}
    </p>

    {buttonText && onButtonClick && (
      <button
        onClick={onButtonClick}
        className="form-btn mt-5"
      >
        {buttonText}
      </button>
    )}
  </div>

</div>
  );
}