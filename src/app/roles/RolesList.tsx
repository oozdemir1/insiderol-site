import RoleCard from "./RoleCard";

export default function RolesList({
  roles,
}: {
  roles: any[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 justify-center">
      {roles?.map((role) => (
        <RoleCard
          key={role.id}
          role={role}
          averageSatisfaction={role.averageSatisfaction}
          averageSalary={role.averageSalary}
          salaryCount={role.salaryCount}
          reviewCount={role.reviewCount}
        />
      ))}
    </div>
  );
}
