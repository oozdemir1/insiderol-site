import { createClient } from "@/lib/server";
import { type FeedItem } from "./FeedCard";
import ExploreClient from "./ExploreClient";

const PAGE_SIZE = 10;

// A merged feed across two tables can't be paginated at the DB level with
// a single range() — each table is fetched up to this cap, merged, sorted
// by recency, then paginated in memory. Bounds the feed to recent activity
// rather than supporting infinite-deep pagination across both tables.
const FETCH_CAP = 200;

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    page?: string;
    mode?: string;
  }>;
}) {
  const supabase = await createClient();
  const { type, page, mode } = await searchParams;

  const compareMode = mode === "compare";

  const typeFilter =
    type === "salary" || type === "review" || type === "interview"
      ? type
      : "";

  const currentPage = Math.max(1, Number(page) || 1);

  const items: FeedItem[] = [];

  // Author lookups are batched after both fetches so we only hit
  // `profiles` once for the whole page instead of once per item.
  const authoredRows: { user_id: string; isAnonymous: boolean }[] = [];

  if (!compareMode && (typeFilter === "" || typeFilter === "salary")) {
    const { data: salaries } = await supabase
      .from("salaries")
      .select(
        "id, salary, created_at, user_id, is_anonymous, experience_years, work_city, salary_satisfaction, tech_stack, comment, companies(name, slug), roles(name)"
      )
      .eq("moderation_status", "approved")
      .eq("role_status", "approved")
      .eq("company_status", "approved")
      .order("created_at", { ascending: false })
      .limit(FETCH_CAP);

    (salaries || []).forEach((salary: any) => {
      if (!salary.companies || !salary.roles) return;

      authoredRows.push({
        user_id: salary.user_id,
        isAnonymous: salary.is_anonymous,
      });

      items.push({
        kind: "salary",
        id: salary.id,
        createdAt: salary.created_at,
        companySlug: salary.companies.slug,
        companyName: salary.companies.name,
        roleName: salary.roles.name,
        salary: Number(salary.salary) || 0,
        userId: salary.user_id,
        isAnonymous: salary.is_anonymous,
        experienceYears: salary.experience_years,
        workCity: salary.work_city,
        salarySatisfaction: salary.salary_satisfaction,
        techStack: salary.tech_stack,
        comment: salary.comment,
      });
    });
  }

  if (!compareMode && (typeFilter === "" || typeFilter === "review")) {
    const { data: reviews } = await supabase
      .from("company_reviews")
      .select(
        "id, title, review, overall_rating, created_at, user_id, is_anonymous, experience_years, work_city, employment_status, would_recommend, work_life_balance, management, career_growth, work_environment, transparency, employee_value, companies(name, slug), roles(name)"
      )
      .eq("moderation_status", "approved")
      .order("created_at", { ascending: false })
      .limit(FETCH_CAP);

    (reviews || []).forEach((review: any) => {
      if (!review.companies || !review.roles) return;

      authoredRows.push({
        user_id: review.user_id,
        isAnonymous: review.is_anonymous,
      });

      items.push({
        kind: "review",
        id: review.id,
        createdAt: review.created_at,
        companySlug: review.companies.slug,
        companyName: review.companies.name,
        roleName: review.roles.name,
        title: review.title,
        review: review.review,
        overallRating: review.overall_rating,
        userId: review.user_id,
        isAnonymous: review.is_anonymous,
        experienceYears: review.experience_years,
        workCity: review.work_city,
        employmentStatus: review.employment_status,
        wouldRecommend: review.would_recommend,
        workLifeBalance: review.work_life_balance,
        management: review.management,
        careerGrowth: review.career_growth,
        workEnvironment: review.work_environment,
        transparency: review.transparency,
        employeeValue: review.employee_value,
      });
    });
  }

  if (!compareMode && (typeFilter === "" || typeFilter === "interview")) {
    const { data: interviews } = await supabase
      .from("interview_experiences")
      .select(
        "id, title, experience, created_at, user_id, is_anonymous, work_city, seniority, process_length, difficulty, interview_format, salary_range, application_year, interview_stages, assessment_types, companies(name, slug), roles(name)"
      )
      .eq("moderation_status", "approved")
      .eq("role_status", "approved")
      .eq("company_status", "approved")
      .order("created_at", { ascending: false })
      .limit(FETCH_CAP);

    (interviews || []).forEach((interview: any) => {
      if (!interview.companies || !interview.roles) return;

      authoredRows.push({
        user_id: interview.user_id,
        isAnonymous: interview.is_anonymous,
      });

      items.push({
        kind: "interview",
        id: interview.id,
        createdAt: interview.created_at,
        companySlug: interview.companies.slug,
        companyName: interview.companies.name,
        roleName: interview.roles.name,
        title: interview.title,
        experience: interview.experience,
        userId: interview.user_id,
        isAnonymous: interview.is_anonymous,
        workCity: interview.work_city,
        seniority: interview.seniority,
        processLength: interview.process_length,
        difficulty: interview.difficulty,
        interviewFormat: interview.interview_format,
        salaryRange: interview.salary_range,
        applicationYear: interview.application_year,
        interviewStages: interview.interview_stages,
        assessmentTypes: interview.assessment_types,
      });
    });
  }

  // Only look up profiles for non-anonymous posts — an anonymous post's
  // author shouldn't even reach the client, not just stay unrendered.
  const identifiableUserIds = Array.from(
    new Set(
      authoredRows
        .filter((row) => !row.isAnonymous && row.user_id)
        .map((row) => row.user_id)
    )
  );

  const profileByUserId = new Map<
    string,
    { username: string | null; avatar_url: string | null }
  >();

  if (identifiableUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .in("id", identifiableUserIds);

    (profiles || []).forEach((profile: any) => {
      profileByUserId.set(profile.id, {
        username: profile.username,
        avatar_url: profile.avatar_url,
      });
    });
  }

  items.forEach((item) => {
    if (item.isAnonymous || !item.userId) return;

    const profile = profileByUserId.get(item.userId);
    item.authorUsername = profile?.username ?? null;
    item.authorAvatarUrl = profile?.avatar_url ?? null;
  });

  items.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );

  const totalPages = Math.max(
    1,
    Math.ceil(items.length / PAGE_SIZE)
  );

  // A stale/hand-edited ?page= beyond the real last page would otherwise
  // return an empty slice with no way back except repeatedly clicking
  // "Önceki" — clamp to the real last page instead.
  const clampedPage = Math.min(currentPage, totalPages);

  // userId only exists on these objects for the author-profile lookup
  // above — strip it here, right at the server/client boundary, so a raw
  // user_id (anonymous posts included) never reaches the browser.
  const pagedItems = items
    .slice(
      (clampedPage - 1) * PAGE_SIZE,
      clampedPage * PAGE_SIZE
    )
    .map(({ userId, ...rest }) => rest);

  return (
    <ExploreClient
      compareMode={compareMode}
      typeFilter={typeFilter}
      pagedItems={pagedItems}
      itemCount={items.length}
      currentPage={clampedPage}
      totalPages={totalPages}
    />
  );
}
