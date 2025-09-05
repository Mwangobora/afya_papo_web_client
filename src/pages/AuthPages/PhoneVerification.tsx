import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import OTPVerificationForm from "../../components/auth/OTPVerificationForm";

export default function PhoneVerification() {
  return (
    <>
      <PageMeta
        title="Phone Verification | AFYA PAPO"
        description="Verify your phone number to complete registration"
      />
      <AuthLayout>
        <OTPVerificationForm />
      </AuthLayout>
    </>
  );
}

