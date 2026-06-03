import { GuideApprovalList } from "@/components/admin/GuideApprovalList";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminGuidesPage() {
  const guides = await prisma.guideProfile.findMany({
    include: {
      user: { select: { name: true, email: true, image: true } },
      city: true,
    },
    orderBy: { status: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Guide Approvals</h1>
        <p className="text-gray-500">Review and verify local guide applications.</p>
      </div>

      <GuideApprovalList initialGuides={guides} />
    </div>
  );
}
