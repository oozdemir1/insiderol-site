export function getEmploymentStatusLabel(status: number | null) {
  switch (status) {
    case 1:
      return "Halen Çalışıyor";
    case 2:
      return "Eski Çalışan";
    default:
      return "-";
  }
}

export function renderStars(rating: number) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}
