import CompanyCard from "./CompanyCard";

export default function CompaniesList({
  companies,
}: {
  companies: any[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 justify-center">
      {companies?.map((company) => (
        <CompanyCard
          key={company.slug}
          company={company}
          reviewCount={company.review_count || 0}
          salaryCount={company.salary_count || 0}
          reviews={company.company_reviews || []}
        />
      ))}
    </div>
  );
}