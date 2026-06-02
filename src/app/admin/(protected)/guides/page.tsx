import { GuideApprovalList } from "@/components/admin/GuideApprovalList";

export default function AdminGuidesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Guide Approvals</h1>
        <p className="text-gray-500">Review and verify local guide applications.</p>
      </div>

      <GuideApprovalList />
    </div>
  );
}
