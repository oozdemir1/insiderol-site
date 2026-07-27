// Shared between actions.ts (a "use server" file, which can only export
// async functions — this can't just live there) and any page that needs
// to validate a tableName param before querying it directly.
export const MODERATED_TABLES = [
  "salaries",
  "company_reviews",
  "company_work_style",
  "interview_experiences",
  "company_benefits",
  "company_compensation",
];
