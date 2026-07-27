type PostStatusBadgeProps = {
  moderationStatus?: string | null;
  roleStatus?: string | null;
  companyStatus?: string | null;
};

// A post only shows up on its company page once moderation_status,
// role_status, and company_status (the latter two only matter when the
// post suggested a new role/company) are all "approved" — see the
// .eq(...) chains on the public company page query. Editing resets
// moderation_status to "pending" regardless of what changed, so this
// badge doubles as an implicit "under review again" signal without a
// separate "edited" label that could misleadingly suggest content was
// altered by us.
export default function PostStatusBadge({
  moderationStatus,
  roleStatus,
  companyStatus,
}: PostStatusBadgeProps) {
  const statuses = [moderationStatus, roleStatus, companyStatus];

  const isRejected = statuses.includes("rejected");
  const isApproved =
    !isRejected &&
    statuses.every((status) => !status || status === "approved");

  const label = isRejected
    ? "Reddedildi"
    : isApproved
      ? "Yayında"
      : "Moderasyonda";

  const className = isRejected
    ? "bg-red-500/10 text-red-600"
    : isApproved
      ? "bg-[rgba(123,189,0,0.12)] text-[var(--text-dark)]"
      : "bg-amber-500/10 text-amber-700";

  return (
    <span
      className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
