import Link from "next/link";

type Props = {
  basePath: string;
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
};

export default function Pagination({
  basePath,
  currentPage,
  totalPages,
  searchParams,
}: Props) {
  if (totalPages <= 1) return null;

  const buildHref = (page: number) => {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    if (page > 1) {
      params.set("page", String(page));
    } else {
      params.delete("page");
    }

    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;

  return (
    <div className="flex items-center justify-center gap-3 mt-8">
      {isFirst ? (
        <span className="form-btn form-btn-secondary opacity-40 pointer-events-none">
          Önceki
        </span>
      ) : (
        <Link
          href={buildHref(currentPage - 1)}
          className="form-btn form-btn-secondary"
        >
          Önceki
        </Link>
      )}

      <span className="text-sm text-[var(--muted-dark)] px-2">
        Sayfa {currentPage} / {totalPages}
      </span>

      {isLast ? (
        <span className="form-btn form-btn-secondary opacity-40 pointer-events-none">
          Sonraki
        </span>
      ) : (
        <Link
          href={buildHref(currentPage + 1)}
          className="form-btn form-btn-secondary"
        >
          Sonraki
        </Link>
      )}
    </div>
  );
}
