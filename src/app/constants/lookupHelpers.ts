import { experienceLevels } from "./experienceLevels";
import { turkishCities } from "./turkishCities";

export function getExperienceYearsLabel(value?: number | null) {
  return experienceLevels.find((level) => level.id === value)?.name || "-";
}

export function getCityName(cityId?: number | null) {
  return turkishCities.find((city) => city.id === cityId)?.name || "-";
}
