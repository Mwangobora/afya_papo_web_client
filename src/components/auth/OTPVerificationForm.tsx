import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeftIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";

export default function OTPVerificationForm() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    
    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleResend = async () => {
    setIsResending(true);
    // TODO: Replace with real API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setTimeLeft(60);
    setIsResending(false);
  };

  const handleVerify = () => {
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      // TODO: Replace with real API call
      console.log('Verifying OTP:', otpCode);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Verify Phone Number
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter the 6-digit code sent to +255 700 000 000
            </p>
          </div>
          <div>
            <form>
              <div className="space-y-6">
                <div>
                  <Label>
                    Verification Code <span className="text-error-500">*</span>
                  </Label>
                  <div className="flex gap-3 justify-center">
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        className="w-12 h-12 text-center text-lg font-semibold"
                        maxLength={1}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  {timeLeft > 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Resend code in {timeLeft}s
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isResending}
                      className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 disabled:opacity-50"
                    >
                      {isResending ? 'Sending...' : 'Resend Code'}
                    </button>
                  )}
                </div>

                <div>
                  <Button 
                    className="w-full" 
                    size="sm"
                    onClick={handleVerify}
                    disabled={otp.join('').length !== 6}
                  >
                    Verify Phone Number
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Didn't receive the code? {""}
                <Link
                  to="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Try again
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

