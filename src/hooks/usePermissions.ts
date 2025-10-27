import { useAuthStore } from "../store/authStore";

export const usePermissions = () => {
  const role = useAuthStore((state:any) => state.user?.role);

  const permissions = {
    canApproveReject: role === 'manager',
    canEdit: role === 'manager',
    canComment: role === 'manager' || role === 'sales_rep',
    canReply: role === 'manager',
    isViewer: role === 'viewer',
  };

  return { role, ...permissions };
};