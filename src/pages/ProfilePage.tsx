import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePaymentMethods, type PaymentMethodType } from "@/hooks/usePaymentMethods";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BottomNav from "@/components/BottomNav";
import HalalVerificationSection from "@/components/HalalVerificationSection";
import LanguageToggle from "@/components/LanguageToggle";
import { toast } from "sonner";
import {
  ArrowLeft, Mail, Phone, Store, User, Recycle, LogOut, Shield,
  Pencil, X, CreditCard, Landmark, Wallet, Plus, Trash2,
} from "lucide-react";

const roleConfig = {
  vendor: { icon: Store, color: "bg-primary" },
  user: { icon: User, color: "bg-accent" },
  composter: { icon: Recycle, color: "bg-muted-foreground" },
};

type PaymentType = PaymentMethodType;

const ProfilePage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { methods: payments, add: addPaymentToDB, remove: removePaymentFromDB } = usePaymentMethods();

  // Edit profile state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editBiz, setEditBiz] = useState("");

  // Payment state
  const [addingPayment, setAddingPayment] = useState<PaymentType | null>(null);

  // Payment form state
  const [tngPhone, setTngPhone] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  if (!user) return null;

  const { icon: RoleIcon, color } = roleConfig[user.role];
  const needsBiz = user.role === "vendor" || user.role === "composter";

  const initials = user.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const startEdit = () => {
    setEditName(user.fullName);
    setEditEmail(user.email);
    setEditPhone(user.phone);
    setEditBiz(user.businessName || "");
    setEditing(true);
  };

  const saveEdit = async () => {
    await updateProfile({
      fullName: editName,
      email: editEmail,
      phone: editPhone,
      ...(needsBiz ? { businessName: editBiz } : {}),
    });
    setEditing(false);
    toast.success(t("profileUpdated"));
  };

  const addPaymentMethod = async () => {
    let nickname = "";
    let detail = "";
    let type: PaymentMethodType | null = null;

    if (addingPayment === "tng" && tngPhone) {
      type = "tng"; nickname = t("tngWallet"); detail = tngPhone;
    } else if (addingPayment === "card" && cardNumber) {
      type = "card"; nickname = t("creditDebit"); detail = `•••• ${cardNumber.slice(-4)}`;
    } else if (addingPayment === "fpx" && bankName && accountNumber) {
      type = "fpx"; nickname = t("bankTransfer"); detail = `${bankName} — •••${accountNumber.slice(-4)}`;
    }

    if (type) {
      const error = await addPaymentToDB(type, nickname, detail);
      if (!error) {
        toast.success(t("paymentAdded"));
        resetPaymentForm();
      } else {
        toast.error(error.message);
      }
    }
  };

  const removePayment = async (id: string) => {
    await removePaymentFromDB(id);
    toast.success(t("paymentRemoved"));
  };

  const resetPaymentForm = () => {
    setAddingPayment(null);
    setTngPhone("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setBankName("");
    setAccountNumber("");
  };

  const infoRows = [
    { icon: Mail, label: t("emailLabel"), value: user.email },
    { icon: Phone, label: t("phoneLabel"), value: user.phone },
    ...(user.businessName
      ? [{ icon: Store, label: t("businessNameLabel"), value: user.businessName }]
      : []),
    { icon: Shield, label: t("selectRole"), value: t(user.role === "vendor" ? "roleVendor" : user.role === "composter" ? "roleComposter" : "roleUser") },
  ];

  const paymentTypeConfig: { type: PaymentType; icon: typeof Wallet; label: string }[] = [
    { type: "tng", icon: Wallet, label: t("tngWallet") },
    { type: "card", icon: CreditCard, label: t("creditDebit") },
    { type: "bank", icon: Landmark, label: t("bankTransfer") },
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

      {/* Avatar & Name */}
      <div className="px-6 pt-6 flex flex-col items-center">
        <div className={`h-20 w-20 rounded-2xl ${color} flex items-center justify-center mb-3`}>
          <span className="text-2xl font-display font-bold text-primary-foreground">{initials}</span>
        </div>
        <h2 className="text-xl font-display font-bold text-foreground">{user.fullName}</h2>
        <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          <RoleIcon className="h-3 w-3" />
          {t(user.role === "vendor" ? "roleVendor" : user.role === "composter" ? "roleComposter" : "roleUser")}
        </span>
      </div>

      {/* Info card or edit form */}
      {!editing ? (
        <div className="mx-4 mt-8">
          <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
            {infoRows.map((row, i) => (
              <div
                key={row.label}
                className={`flex items-center gap-3 px-4 py-3.5 ${i < infoRows.length - 1 ? "border-b border-border" : ""}`}
              >
                <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <row.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-muted-foreground font-body">{row.label}</p>
                  <p className="text-sm font-medium text-foreground truncate">{row.value}</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full h-11 mt-3" onClick={startEdit}>
            <Pencil className="h-4 w-4 mr-2" />
            {t("editProfile")}
          </Button>
        </div>
      ) : (
        <div className="mx-4 mt-8 rounded-2xl border border-border bg-card shadow-card p-4 space-y-4">
          <div className="space-y-2">
            <Label>{t("fullNameLabel")}</Label>
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("emailLabel")}</Label>
            <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("phoneLabel")}</Label>
            <Input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
          </div>
          {needsBiz && (
            <div className="space-y-2">
              <Label>{t("businessNameLabel")}</Label>
              <Input value={editBiz} onChange={(e) => setEditBiz(e.target.value)} />
            </div>
          )}
          <div className="flex gap-2">
            <Button className="flex-1 h-10" onClick={saveEdit}>{t("saveChanges")}</Button>
            <Button variant="outline" className="h-10" onClick={() => setEditing(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Payment Methods */}
      <div className="mx-4 mt-8">
        <h3 className="text-sm font-display font-bold text-foreground mb-3">{t("paymentMethods")}</h3>

        {/* Existing payments */}
        {payments.length > 0 && (
          <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden mb-3">
            {payments.map((pm, i) => {
              const cfg = paymentTypeConfig.find((c) => c.type === pm.type);
              const Icon = cfg?.icon || Wallet;
              return (
                <div
                  key={pm.id}
                  className={`flex items-center gap-3 px-4 py-3 ${i < payments.length - 1 ? "border-b border-border" : ""}`}
                >
                  <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-muted-foreground font-body">{pm.label}</p>
                    <p className="text-sm font-medium text-foreground">{pm.detail}</p>
                  </div>
                  <button onClick={() => removePayment(pm.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {payments.length === 0 && !addingPayment && (
          <p className="text-sm text-muted-foreground mb-3">{t("noPayments")}</p>
        )}

        {/* Add payment type selector */}
        {!addingPayment ? (
          <div className="grid grid-cols-3 gap-2">
            {paymentTypeConfig.map((cfg) => (
              <button
                key={cfg.type}
                onClick={() => setAddingPayment(cfg.type)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-border bg-card hover:border-primary/40 transition-all"
              >
                <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                  <cfg.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-[10px] font-medium text-foreground text-center leading-tight">{cfg.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card shadow-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground">
                {paymentTypeConfig.find((c) => c.type === addingPayment)?.label}
              </h4>
              <button onClick={resetPaymentForm} className="p-1">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {addingPayment === "tng" && (
              <div className="space-y-2">
                <Label>{t("tngPhone")}</Label>
                <Input type="tel" value={tngPhone} onChange={(e) => setTngPhone(e.target.value)} placeholder="+60 12-345 6789" />
              </div>
            )}

            {addingPayment === "card" && (
              <>
                <div className="space-y-2">
                  <Label>{t("cardNumber")}</Label>
                  <Input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="4242 4242 4242 4242" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>{t("cardExpiry")}</Label>
                    <Input value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} placeholder="12/28" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("cardCvv")}</Label>
                    <Input type="password" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} placeholder="•••" />
                  </div>
                </div>
              </>
            )}

            {addingPayment === "bank" && (
              <>
                <div className="space-y-2">
                  <Label>{t("bankName")}</Label>
                  <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. Maybank" />
                </div>
                <div className="space-y-2">
                  <Label>{t("accountNumber")}</Label>
                  <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="1234567890" />
                </div>
              </>
            )}

            <Button className="w-full h-10" onClick={addPaymentMethod}>
              <Plus className="h-4 w-4 mr-2" />
              {t("addPayment")}
            </Button>
          </div>
        )}
      </div>

      {/* Halal Verification (Vendors only) */}
      {user.role === "vendor" && (
        <HalalVerificationSection />
      )}

      {/* Logout */}
      <div className="mx-4 mt-8">
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
