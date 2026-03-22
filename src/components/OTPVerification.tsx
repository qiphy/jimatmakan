import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ShieldCheck, RotateCw } from "lucide-react";

interface OTPVerificationProps {
  phone: string;
  onVerified: () => void;
  onBack: () => void;
}

const MOCK_OTP = "123456";
const RESEND_COOLDOWN = 30;

const OTPVerification = ({ phone, onVerified, onBack }: OTPVerificationProps) => {
  const { t } = useLanguage();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [sent, setSent] = useState(true);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = useCallback(() => {
    if (otp === MOCK_OTP) {
      onVerified();
    } else {
      setError(t("otpInvalid"));
    }
  }, [otp, onVerified, t]);

  const handleResend = () => {
    setOtp("");
    setError("");
    setCooldown(RESEND_COOLDOWN);
    setSent(true);
  };

  // Auto-verify when all digits entered
  useEffect(() => {
    if (otp.length === 6) {
      handleVerify();
    }
  }, [otp, handleVerify]);

  const maskedPhone = phone.slice(0, -4).replace(/./g, "•") + phone.slice(-4);

  return (
    <div className="w-full max-w-sm text-center space-y-6">
      <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
        <ShieldCheck className="h-7 w-7 text-primary" />
      </div>

      <div>
        <h2 className="text-xl font-display font-bold text-foreground">{t("otpTitle")}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("otpSentTo")} <span className="font-medium text-foreground">{maskedPhone}</span>
        </p>
      </div>

      <div className="flex justify-center">
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <span className="mx-2 text-muted-foreground">—</span>
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="space-y-2 text-sm text-muted-foreground">
        <p>{t("otpDemo")}: <span className="font-mono font-medium text-foreground">123456</span></p>
      </div>

      <Button onClick={handleVerify} className="w-full h-11" disabled={otp.length < 6}>
        {t("verifyBtn")}
      </Button>

      <button
        onClick={handleResend}
        disabled={cooldown > 0}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary disabled:opacity-50 transition-colors"
      >
        <RotateCw className="h-3.5 w-3.5" />
        {cooldown > 0 ? `${t("resendIn")} ${cooldown}s` : t("resendOtp")}
      </button>
    </div>
  );
};

export default OTPVerification;
