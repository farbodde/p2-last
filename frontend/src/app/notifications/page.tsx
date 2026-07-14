import AuthGuard from "@/components/common/Auth/AuthGuard";
import Notifications from "@/components/features/Notifications";

const NotificationsPage = () => {
  return (
    <AuthGuard mode="protected" redirectTo="/auth">
      <Notifications />
    </AuthGuard>
  );
};

export default NotificationsPage;
