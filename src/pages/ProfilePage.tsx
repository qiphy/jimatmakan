import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import LanguageToggle from "@/components/LanguageToggle";
import { ArrowLeft, Mail, Phone, Store, User, Recycle, LogOut, Shield } from "lucide-react";

const roleConfig = {
  vendor: { icon: Store, color: "bg-primary" },
  user: { icon: User, color: "bg-accent" },
  composter: { icon: Recycle, color: "bg-muted-foreground" },
};

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (!user) return null;

  const { icon: RoleIcon, color } = roleConfig[user.role];

  const initials = user.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const infoRows = [
    { icon: Mail, label: t("emailLabel"), value: user.email },
    { icon: Phone, label: t("phoneLabel"), value: user.phone },
    ...(user.businessName
      ? [{ icon: Store, label: t("businessNameLabel"), value: user.businessName }]
      : []),
    { icon: Shield, label: t("selectRole"), value: t(user.role === "vendor" ? "roleVendor" : user.role === "composter" ? "roleComposter" : "roleUser") },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="flex items-center justify-between px-4 pt-[env(safe-area-inset-top,12px)] pb-2">
        <button onClick={() => navigate("/")} className="p-2 -ml-2">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-base font-display font-bold text-foreground">{t("profile")}</h1>
        <LanguageToggle />
      </header>

      <div className="px-6 pt-6 flex flex-col items-center">
        {/* Avatar */}
        <div className={`h-20 w-20 rounded-2xl ${color} flex items-center justify-center mb-3`}>
          <span className="text-2xl font-display font-bold text-primary-foreground">{initials}</span>
        </div>

        <h2 className="text-xl font-display font-bold text-foreground">{user.fullName}</h2>

        <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          <RoleIcon className="h-3 w-3" />
          {t(user.role === "vendor" ? "roleVendor" : user.role === "composter" ? "roleComposter" : "roleUser")}
        </span>
      </div>

      {/* Info card */}
      <div className="mx-4 mt-8 rounded-2xl border border-border bg-card shadow-card overflow-hidden">
        {infoRows.map((row, i) => (
          <div
            key={row.label}
            className={`flex items-center gap-3 px-4 py-3.5 ${i < infoRows.length - 1 ? "border-b border-border" : ""}`}
          >
            <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <row.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground font-body">{row.label}</p>
              <p className="text-sm font-medium text-foreground truncate">{row.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="mx-4 mt-6">
        <Button
          variant="outline"
          className="w-full h-11 text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive"
          onClick={() => { logout(); navigate("/auth"); }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {t("logout")}
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
