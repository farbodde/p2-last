import ForgotPasswordView from "@/components/features/Auth/ForgotPassword";
import { createMetadata } from "@/config/metadata.config";

export const metadata = createMetadata({
  title: "Forgot Password",
  description:
    "Request a password reset email for your Player2 account.",
  path: "/auth/forgot",
  noIndex: true,
  keywords: ["forgot password", "reset password", "account recovery"],
});

const ForgotPage = () => {
  return <ForgotPasswordView />;
};

export default ForgotPage;
