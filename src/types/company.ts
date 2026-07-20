export type Company = {
  name: string;
  slug: string;
  logo_url: string | null;
  industry: string | null;
  hq_city: string | null;
  is_verified: boolean;

  review_count: number;
  average_rating: number;

  salary_count: number;
  average_salary: number;
};