import { notFound } from "next/navigation";
import { ExpiredReviewBoard } from "@/components/reviews/expired-review-board";
import { PublicReviewBoard } from "@/components/reviews/public-review-board";
import { getPublicClientBySlug } from "@/lib/services/client-service";

export const dynamic = "force-dynamic";

type PublicReviewPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PublicReviewPage({
  params,
}: PublicReviewPageProps) {
  const { slug } = await params;
  const payload = await getPublicClientBySlug(slug);

  if (!payload) {
    notFound();
  }

  if (payload.status === "expired") {
    return (
      <ExpiredReviewBoard
        businessName={payload.client.businessName}
        city={payload.client.city}
        sector={payload.client.sector}
        reason={payload.reason}
        expiredAt={payload.expiredAt}
      />
    );
  }

  return <PublicReviewBoard client={payload.client} />;
}
