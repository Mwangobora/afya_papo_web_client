import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Sign Up | AFYA PAPO"
        description="Join AFYA PAPO emergency response management system"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
