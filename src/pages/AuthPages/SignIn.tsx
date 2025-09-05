import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Sign In | AFYA PAPO"
        description="Sign in to AFYA PAPO emergency response management system"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
