import { createMetadata } from "@/config/metadata.config";
import SignUpView from "@/components/features/Auth/Signup";

export const metadata = createMetadata({
  title: "Sign Up",
  description:
    "Create your Player2 account to build your gaming profile and publish LFG posts.",
  path: "/auth/signup",
  noIndex: true,
  keywords: ["sign up", "register", "account"],
});

const SignUpPage = () => {
  return <SignUpView />;
};

export default SignUpPage;
