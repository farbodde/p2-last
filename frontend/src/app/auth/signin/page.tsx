import { createMetadata } from "@/config/metadata.config";
import SignInView from "@/components/features/Auth/SignIn";

export const metadata = createMetadata({
  title: "Sign In",
  description:
    "Sign in to your Player2 account to access your profile, chats, and LFG activity.",
  path: "/auth/signin",
  noIndex: true,
  keywords: ["sign in", "login", "account"],
});

const SignInPage = () => {
  return <SignInView />;
};

export default SignInPage;
