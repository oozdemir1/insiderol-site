import { createClient } from "@/lib/server";
import { markContactMessageRead, deleteContactMessage } from "./actions";

export default async function ContactMessagesTab({
  status,
}: {
  status: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (status === "unread") {
    query = query.is("read_at", null);
  } else if (status === "read") {
    query = query.not("read_at", "is", null);
  }

  const { data: messages } = await query;

  const { count: unreadCount } = await supabase
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .is("read_at", null);

  const { count: readCount } = await supabase
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .not("read_at", "is", null);

  return (
    <>
      <hr className="border-t-2 border border-green-500 mb-6" />

      <div className="flex justify-center gap-3 mb-6">
        <a
          href="/admin/moderation?tab=messages&status=unread"
          className={
            status === "unread" ? "form-btn" : "form-btn form-btn-secondary"
          }
        >
          Okunmamış ({unreadCount ?? 0})
        </a>

        <a
          href="/admin/moderation?tab=messages&status=read"
          className={
            status === "read" ? "form-btn" : "form-btn form-btn-secondary"
          }
        >
          Okunmuş ({readCount ?? 0})
        </a>

        <a
          href="/admin/moderation?tab=messages&status=all"
          className={
            status === "all" ? "form-btn" : "form-btn form-btn-secondary"
          }
        >
          Tümü ({(unreadCount ?? 0) + (readCount ?? 0)})
        </a>
      </div>

      <div className="flex flex-col gap-4 max-w-3xl mx-auto">
        {(messages || []).map((msg) => (
          <div
            key={msg.id}
            className={`p-4 border border-black/20 rounded-xl ${
              msg.read_at ? "bg-white" : "bg-yellow-50"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-[var(--text-dark)]">
                {msg.subject}
              </span>
              <span className="text-xs text-[var(--muted-dark)] shrink-0">
                {new Date(msg.created_at).toLocaleString("tr-TR")}
              </span>
            </div>

            <div className="text-sm text-[var(--muted-dark)] mt-1">
              {msg.name ? `${msg.name} · ` : ""}
              {msg.email}
            </div>

            <p className="text-sm text-[var(--text-dark)] mt-3 whitespace-pre-wrap">
              {msg.message}
            </p>

            <div className="flex gap-2 mt-3">
              {!msg.read_at && (
                <form
                  action={async () => {
                    "use server";
                    await markContactMessageRead(msg.id);
                  }}
                >
                  <button type="submit" className="form-btn">
                    Okundu işaretle
                  </button>
                </form>
              )}

              <form
                action={async () => {
                  "use server";
                  await deleteContactMessage(msg.id);
                }}
              >
                <button type="submit" className="form-btn form-btn-secondary">
                  Sil
                </button>
              </form>
            </div>
          </div>
        ))}

        {(messages || []).length === 0 && (
          <p className="text-center text-[var(--muted-dark)]">
            {status === "unread"
              ? "Okunmamış mesaj yok."
              : status === "read"
              ? "Okunmuş mesaj yok."
              : "Henüz mesaj yok."}
          </p>
        )}
      </div>
    </>
  );
}
