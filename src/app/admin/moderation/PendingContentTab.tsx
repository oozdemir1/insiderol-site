
import { createClient } from "@/lib/server";
import ContentModerationCard from "./ContentModerationCard";


export default async function PendingContentTab({
  status,
}: {
  status: string;
}) 

{

    const supabase = await createClient();

    const { count: reviewPendingCount } = await supabase
    .from("company_reviews")
    .select("*", { count: "exact", head: true })
    .eq("moderation_status", "pending");

    const { count: reviewApprovedCount } = await supabase
    .from("company_reviews")
    .select("*", { count: "exact", head: true })
    .eq("moderation_status", "approved");

    const { count: reviewRejectedCount } = await supabase
    .from("company_reviews")
    .select("*", { count: "exact", head: true })
    .eq("moderation_status", "rejected");

    const { count: salaryPendingCount } = await supabase
  .from("salaries")
  .select("*", { count: "exact", head: true })
  .eq("moderation_status", "pending");

const { count: salaryApprovedCount } = await supabase
  .from("salaries")
  .select("*", { count: "exact", head: true })
  .eq("moderation_status", "approved");

const { count: salaryRejectedCount } = await supabase
  .from("salaries")
  .select("*", { count: "exact", head: true })
  .eq("moderation_status", "rejected");

const { count: interviewPendingCount } = await supabase
  .from("interview_experiences")
  .select("*", { count: "exact", head: true })
  .eq("moderation_status", "pending");

const { count: interviewApprovedCount } = await supabase
  .from("interview_experiences")
  .select("*", { count: "exact", head: true })
  .eq("moderation_status", "approved");

const { count: interviewRejectedCount } = await supabase
  .from("interview_experiences")
  .select("*", { count: "exact", head: true })
  .eq("moderation_status", "rejected");

const { count: benefitPendingCount } = await supabase
  .from("company_benefits")
  .select("*", { count: "exact", head: true })
  .eq("moderation_status", "pending");

const { count: benefitApprovedCount } = await supabase
  .from("company_benefits")
  .select("*", { count: "exact", head: true })
  .eq("moderation_status", "approved");

const { count: benefitRejectedCount } = await supabase
  .from("company_benefits")
  .select("*", { count: "exact", head: true })
  .eq("moderation_status", "rejected");

const { count: compensationPendingCount } = await supabase
  .from("company_compensation")
  .select("*", { count: "exact", head: true })
  .eq("moderation_status", "pending");

const { count: compensationApprovedCount } = await supabase
  .from("company_compensation")
  .select("*", { count: "exact", head: true })
  .eq("moderation_status", "approved");

const { count: compensationRejectedCount } = await supabase
  .from("company_compensation")
  .select("*", { count: "exact", head: true })
  .eq("moderation_status", "rejected");

const { count: workStylePendingCount } = await supabase
  .from("company_work_style")
  .select("*", { count: "exact", head: true })
  .eq("moderation_status", "pending");

const { count: workStyleApprovedCount } = await supabase
  .from("company_work_style")
  .select("*", { count: "exact", head: true })
  .eq("moderation_status", "approved");

const { count: workStyleRejectedCount } = await supabase
  .from("company_work_style")
  .select("*", { count: "exact", head: true })
  .eq("moderation_status", "rejected");

  const pendingCount =
  (reviewPendingCount ?? 0) +
  (salaryPendingCount ?? 0) +
  (interviewPendingCount ?? 0) +
  (benefitPendingCount ?? 0) +
  (compensationPendingCount ?? 0) +
  (workStylePendingCount ?? 0);

const approvedCount =
  (reviewApprovedCount ?? 0) +
  (salaryApprovedCount ?? 0) +
  (interviewApprovedCount ?? 0) +
  (benefitApprovedCount ?? 0) +
  (compensationApprovedCount ?? 0) +
  (workStyleApprovedCount ?? 0);

const rejectedCount =
  (reviewRejectedCount ?? 0) +
  (salaryRejectedCount ?? 0) +
  (interviewRejectedCount ?? 0) +
  (benefitRejectedCount ?? 0) +
  (compensationRejectedCount ?? 0) +
  (workStyleRejectedCount ?? 0);


    const { data: reviews } = await supabase
    .from("company_reviews")
    .select("*")
    .eq("moderation_status", status);

    const { data: salaries } = await supabase
  .from("salaries")
  .select("*")
  .eq("moderation_status", status);

  const { data: interviews } = await supabase
  .from("interview_experiences")
  .select("*")
  .eq("moderation_status", status);

  const { data: benefits } = await supabase
  .from("company_benefits")
  .select("*")
  .eq("moderation_status", status);

const { data: compensation } = await supabase
  .from("company_compensation")
  .select("*")
  .eq("moderation_status", status);

const { data: workStyle } = await supabase
  .from("company_work_style")
  .select("*")
  .eq("moderation_status", status);

  const { data: companies } = await supabase
  .from("companies")
  .select("id, name");

  const companyMap = Object.fromEntries(
  (companies ?? []).map((company) => [
    company.id,
    company.name,
  ])
);

const { data: roles } = await supabase
  .from("roles")
  .select("id, name");

  const roleMap = Object.fromEntries(
  (roles ?? []).map((role) => [
    role.id,
    role.name,
  ])
);




  const contentItems = [
  ...(reviews ?? []).map((item) => ({
    ...item,
    table_name: "company_reviews",
    content_type: "review",
  })),

  ...(salaries ?? []).map((item) => ({
    ...item,
    table_name: "salaries",
    content_type: "salary",
  })),

  ...(interviews ?? []).map((item) => ({
    ...item,
    table_name: "interview_experiences",
    content_type: "interview",
  })),

  ...(benefits ?? []).map((item) => ({
    ...item,
    table_name: "company_benefits",
    content_type: "benefit",
  })),

  ...(compensation ?? []).map((item) => ({
    ...item,
    table_name: "company_compensation",
    content_type: "compensation",
  })),

  ...(workStyle ?? []).map((item) => ({
    ...item,
    table_name: "company_work_style",
    content_type: "work_style",
  })),
];

return (
  <>
    <hr className="border-t-2 border-purple-500 mb-6" />
   
    
    <div className="flex justify-center gap-3 mb-6">
         
  <a
    href="/admin/moderation?tab=content&status=pending"
    className={
      status === "pending"
        ? "form-btn"
        : "form-btn form-btn-secondary"
    }
  >
    Bekleyenler İçerikler ({pendingCount})
  </a>

  <a
    href="/admin/moderation?tab=content&status=approved"
    className={
      status === "approved"
        ? "form-btn"
        : "form-btn form-btn-secondary"
    }
  >
    Onaylanan İçerikler ({approvedCount})
  </a>

  <a
    href="/admin/moderation?tab=content&status=rejected"
    className={
      status === "rejected"
        ? "form-btn"
        : "form-btn form-btn-secondary"
    }
  >
    Reddedilenler İçerikler ({rejectedCount})
  </a>
  </div>
 
  <div className="flex flex-wrap justify-center gap-20">


{contentItems.map((item) => (
 <ContentModerationCard
  key={`${item.content_type}-${item.id}`}
  item={item}
  companyName={
    companyMap[item.company_id] ?? "-"
  }
  roleName={
    roleMap[item.role_id] ?? "-"
  }
  status={status}
/>
))}
</div>

</>
  );
}