import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import AvatarPicker from "./AvatarPicker";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", user.id)
    .single();

  const countTable = async (table: string) => {
    const { count } = await supabase
      .from(table)
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    return count || 0;
  };

  const [
    reviewCount,
    salaryCount,
    workStyleCount,
    benefitCount,
    compensationCount,
    interviewCount,
  ] = await Promise.all([
    countTable("company_reviews"),
    countTable("salaries"),
    countTable("company_work_style"),
    countTable("company_benefits"),
    countTable("company_compensation"),
    countTable("interview_experiences"),
  ]);

  const summary = [
    { label: "Maaş Paylaşımı", count: salaryCount, tab: "Maaş" },
    { label: "Yorum", count: reviewCount, tab: "Yorum" },
    { label: "Çalışma Biçimi", count: workStyleCount, tab: "Çalışma Biçimi" },
    { label: "Yan Hak", count: benefitCount, tab: "Yan Hak" },
    { label: "Ücret Politikası", count: compensationCount, tab: "Ücret Politikası" },
    { label: "Mülakat Deneyimi", count: interviewCount, tab: "Mülakat Süreci" },
  ];

  const totalCount = summary.reduce((acc, item) => acc + item.count, 0);

  return (
    <main className="w-full max-w-3xl mx-auto px-4 py-12">
      <div className="card-light rounded-[1.25rem] p-6 md:p-8 flex flex-col items-center text-center">
        <AvatarPicker
          userId={user.id}
          currentAvatar={profile?.avatar_url || null}
        />

        <h1 className="mt-4 text-xl font-semibold text-[var(--text-dark)]">
          {profile?.username || "Kullanıcı"}
        </h1>

        <p className="text-sm text-[var(--muted-dark)] mt-1">
          {user.email}
        </p>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-[var(--text-dark)] mb-3">
          Paylaşım Özeti
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {summary.map((item) => (
            <Link
              key={item.label}
              href={`/my-posts?tab=${encodeURIComponent(item.tab)}`}
              className="card-light card-compact rounded-[1rem] flex flex-col items-center justify-center gap-1 transition hover:border-black/10"
            >
              <span className="text-xl font-semibold text-[var(--text-dark)]">
                {item.count}
              </span>

              <span className="text-[10px] tracking-[0.14em] text-[var(--muted-dark)]/80 text-center">
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-4 text-center text-sm text-[var(--muted-dark)]">
          Toplam {totalCount} Paylaşım ·{" "}
          <Link
            href="/my-posts"
            className="text-[var(--accent)] hover:underline"
          >
            Tümünü Gör
          </Link>
        </div>
      </div>
    </main>
  );
}
