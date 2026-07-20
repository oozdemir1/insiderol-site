import { approveContent, rejectContent,} from "./actions";

export default function ContentModerationCard({
  item,
  companyName,
  roleName,
  status,
}: any) {
  return (

      <div
        key={`${item.content_type}-${item.id}`}
        className="company-card p-4 text-center w-100 border border-black/20"
      >
        <div className="font-semibold text-[var(--text-dark)]">
      {item.content_type === "review"
        ? "Şirket Yorumu"
        : item.content_type === "salary"
        ? "Maaş"
        : item.content_type === "interview"
        ? "Mülakat"
        : item.content_type === "benefit"
        ? "Yan Hak"
        : item.content_type === "compensation"
        ? "Ücret Politikası"
        : "Çalışma Şekli"}
    </div>
    
          <div className="text-sm text-[var(--text-dark)]">
            Şirket: {companyName}
            </div>
    
            <div className="text-sm text-[var(--text-dark)]">
           Rol: {roleName}
            </div>
    
          <div className="mt-2 text-sm text-[var(--text-dark)]">
            {item.content_type === "review" ? (
              <div className="space-y-2">
                <div className="font-semibold">
                  {item.title || "-"}
                </div>
    
                <div>
                  {item.review || "-"}
                </div>
              </div>
            ) : (
              item.title ??
              item.review ??
              item.comment ??
              item.description ??
              "-"
            )}
          </div>
    
            <div className="text-sm text-[var(--text-dark)]">
            ID: {item.id}
            </div>
    
        <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium
        ${
          item.moderation_status === "approved"
            ? "bg-green-100 text-green-800"
            : item.moderation_status === "rejected"
            ? "bg-red-100 text-red-800"
            : "bg-yellow-100 text-yellow-800"
        }
      `}
    >
      {item.moderation_status === "approved"
        ? "Onaylandı"
        : item.moderation_status === "rejected"
        ? "Reddedildi"
        : "Beklemede"}
    </span>
    
    
    {status === "pending" && (
      <div className="mt-3 flex items-center justify-center gap-2">
      
      <a
        href={`/admin/moderation/content/${item.table_name}/${item.id}`}
        className="form-btn form-btn-secondary"
      >
        Düzenle
      </a>
    
        <form
          action={async () => {
            "use server";
    
            await approveContent(
              item.table_name,
              item.id
            );
          }}
        >
          <button
            type="submit"
            className="form-btn"
          >
            Onayla
          </button>
        </form>
    
        <form
          action={async () => {
            "use server";
    
            await rejectContent(
              item.table_name,
              item.id
            );
          }}
        >
          <button
            type="submit"
            className="form-btn form-btn-secondary"
          >
            Reddet
          </button>
        </form>
      </div>
    
    )}
    
      </div>

  );
}