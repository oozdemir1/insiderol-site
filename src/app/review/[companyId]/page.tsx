import ReviewFormSteps from "@/components/forms/ReviewFormSteps";

export default function ReviewPage({ params }: { params: { companyId: number } }) {
  const { companyId } = params;

  return (
    <main className="bg-black text-white min-h-screen px-8 py-20">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold mb-4">Yorum Paylaş</h1>
        <ReviewFormSteps companyId={companyId} />
      </div>
    </main>
  );
}