import AuthGuard from "@/components/common/Auth/AuthGuard";
import Profile from "@/components/features/Profile";

export default function ProfilePage() {
  return (
    <AuthGuard mode="protected" redirectTo="/auth">
      <Profile />
    </AuthGuard>
  );
}
