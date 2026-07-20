type SalaryFiltersProps = {
  cityFilter: string;
  setCityFilter: (value: string) => void;

  typeFilter: string;
  setTypeFilter: (value: string) => void;

  experienceFilter: string;
  setExperienceFilter: (
    value: string
  ) => void;

  sortBy: string;
  setSortBy: (value: string) => void;
};

export default function SalaryFilters({
  cityFilter,
  setCityFilter,

  typeFilter,
  setTypeFilter,

  experienceFilter,
  setExperienceFilter,

  sortBy,
  setSortBy,
}: SalaryFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-10">

      <select
        value={cityFilter}
        onChange={(e) =>
          setCityFilter(e.target.value)
        }
        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3"
      >
        <option value="">Tüm Şehirler</option>

        <option>İstanbul Avrupa</option>
        <option>İstanbul Anadolu</option>
        <option>Ankara</option>
        <option>İzmir</option>
        <option>Remote</option>

      </select>

      <select
        value={typeFilter}
        onChange={(e) =>
          setTypeFilter(e.target.value)
        }
        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3"
      >
        <option value="">
          Tüm Modeller
        </option>

        <option>Remote</option>
        <option>Hybrid</option>
        <option>On-site</option>

      </select>

      <select
        value={experienceFilter}
        onChange={(e) =>
          setExperienceFilter(
            e.target.value
          )
        }
        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3"
      >
        <option value="">
          Tüm Deneyimler
        </option>

        <option>0-1 yıl</option>
        <option>1-3 yıl</option>
        <option>3-5 yıl</option>
        <option>5-7 yıl</option>
        <option>7-10 yıl</option>
        <option>10+ yıl</option>

      </select>

      <select
        value={sortBy}
        onChange={(e) =>
          setSortBy(e.target.value)
        }
        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3"
      >

        <option value="newest">
          En Yeni
        </option>

        <option value="highest_salary">
          En Yüksek Maaş
        </option>

        <option value="highest_rating">
          En Yüksek Rating
        </option>

      </select>

    </div>
  );
}