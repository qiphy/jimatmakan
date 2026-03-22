import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import LanguageToggle from "@/components/LanguageToggle";
import { Leaf, ArrowLeft, Store, User, Recycle } from "lucide-react";

type AuthStep = "choose" | "login" | "signup";

const AuthPage = () => {
  const { t } = useLanguage();
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<AuthStep>("choose");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [businessName, setBusinessName] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error: err } = await login(loginEmail, loginPassword);
    setSubmitting(false);
    if (err) {
      setError(err);
    } else {
      navigate("/");
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!fullName || !email || !phone || !password) {
      setError(t("fillAllFields"));
      return;
    }
    if ((role === "vendor" || role === "composter") && !businessName) {
      setError(t("businessNameRequired"));
      return;
    }
    setSubmitting(true);
    const { error: err } = await signup(email, password, {
      fullName,
      phone,
      role,
      businessName: role !== "user" ? businessName : undefined,
    });
    setSubmitting(false);
    if (err) {
      setError(err);
    } else {
      navigate("/");
    }
  };

  const needsBusinessName = role === "vendor" || role === "composter";

  const roleOptions: { value: UserRole; label: string; desc: string; icon: React.ReactNode }[] = [
    { value: "vendor", label: t("roleVendor"), desc: t("roleVendorDesc"), icon: <Store className="h-4 w-4" /> },
    { value: "user", label: t("roleUser"), desc: t("roleUserDesc"), icon: <User className="h-4 w-4" /> },
    { value: "composter", label: t("roleComposter"), desc: t("roleComposterDesc"), icon: <Recycle className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-[env(safe-area-inset-top,12px)] pb-2">
        {step !== "choose" ? (
          <button onClick={() => setStep("choose")} className="p-2 -ml-2">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
        ) : (
          <div />
        )}
        <LanguageToggle />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-2">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-display font-bold text-foreground">
            {t("appName")}
          </span>
        </div>
        <p className="text-sm text-muted-foreground font-body mb-8">{t("tagline")}</p>

        {/* Choose */}
        {step === "choose" && (
          <div className="w-full max-w-sm space-y-3">
            <Button className="w-full h-12 text-base font-display" onClick={() => setStep("login")}>
              {t("loginBtn")}
            </Button>
            <Button variant="outline" className="w-full h-12 text-base font-display" onClick={() => setStep("signup")}>
              {t("signupBtn")}
            </Button>

            <div className="pt-4 border-t border-border mt-6">
              <p className="text-xs text-muted-foreground text-center mb-3">{t("demoAccounts")}</p>
              <div className="space-y-1.5">
                {[
                  { email: "vendor@demo.com", label: t("roleVendor") },
                  { email: "student@demo.com", label: t("roleUser") },
                  { email: "compost@demo.com", label: t("roleComposter") },
                ].map((acc) => (
                  <button
                    key={acc.email}
                    onClick={async () => {
                      const { error: err } = await login(acc.email, "demo123456");
                      if (!err) navigate("/");
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    <span className="text-xs font-medium text-foreground">{acc.label}</span>
                    <span className="text-[11px] text-muted-foreground ml-2">{acc.email}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Login */}
        {step === "login" && (
          <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
            <h2 className="text-xl font-display font-bold text-foreground">{t("loginTitle")}</h2>
            <div className="space-y-2">
              <Label htmlFor="login-email">{t("emailLabel")}</Label>
              <Input id="login-email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">{t("passwordLabel")}</Label>
              <Input id="login-password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full h-11" disabled={submitting}>
              {submitting ? "..." : t("loginBtn")}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {t("noAccount")}{" "}
              <button type="button" onClick={() => { setStep("signup"); setError(""); }} className="text-primary font-medium">
                {t("signupBtn")}
              </button>
            </p>
          </form>
        )}

        {/* Signup */}
        {step === "signup" && (
          <form onSubmit={handleSignupSubmit} className="w-full max-w-sm space-y-4">
            <h2 className="text-xl font-display font-bold text-foreground">{t("signupTitle")}</h2>

            <div className="space-y-2">
              <Label>{t("selectRole")}</Label>
              <RadioGroup value={role} onValueChange={(v) => setRole(v as UserRole)} className="grid grid-cols-3 gap-2">
                {roleOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      role === opt.value
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-muted-foreground/30"
                    }`}
                  >
                    <RadioGroupItem value={opt.value} className="sr-only" />
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      role === opt.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {opt.icon}
                    </div>
                    <span className="text-xs font-medium text-foreground text-center">{opt.label}</span>
                  </label>
                ))}
              </RadioGroup>
              <p className="text-[11px] text-muted-foreground">{roleOptions.find(r => r.value === role)?.desc}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full-name">{t("fullNameLabel")}</Label>
              <Input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t("fullNamePlaceholder")} />
            </div>

            {needsBusinessName && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <Label htmlFor="biz-name">{t("businessNameLabel")}</Label>
                <Input id="biz-name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder={t("businessNamePlaceholder")} />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="signup-email">{t("emailLabel")}</Label>
              <Input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-phone">{t("phoneLabel")}</Label>
              <Input id="signup-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+60 12-345 6789" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password">{t("passwordLabel")}</Label>
              <Input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full h-11" disabled={submitting}>
              {submitting ? "..." : t("signupBtn")}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {t("haveAccount")}{" "}
              <button type="button" onClick={() => { setStep("login"); setError(""); }} className="text-primary font-medium">
                {t("loginBtn")}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
