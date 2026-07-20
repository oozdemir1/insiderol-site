export function translateSubmissionError(message?: string | null): string {
  if (message?.includes("PENDING_SUBMISSION_LIMIT_REACHED")) {
    return "Çok fazla bekleyen paylaşımın var. Yeni bir paylaşım yapabilmen için önce mevcutlarının incelenmesini bekle.";
  }

  return "Bir hata oluştu, lütfen tekrar dene.";
}
