import { useState, useRef } from "react";
import { useAuth, HalalStatus } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BadgeCheck, Upload, Image, Trash2, Loader2, CheckCircle2, Clock, XCircle } from "lucide-react";

const statusConfig: Record<HalalStatus, { icon: typeof Clock; colorClass: string; labelKey: string }> = {
  none: { icon: BadgeCheck, colorClass: "bg-secondary", labelKey: "halalNotVerified" },
  pending: { icon: Clock, colorClass: "bg-amber-100", labelKey: "halalPending" },
  approved: { icon: CheckCircle2, colorClass: "bg-green-100", labelKey: "halalApproved" },
  rejected: { icon: XCircle, colorClass: "bg-destructive/10", labelKey: "halalRejected" },
};

const HalalVerificationSection = () => {
  const { user, session, updateProfile } = useAuth();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  if (!user || !session) return null;

  const certUrl = user.halalCertUrl;
  const status: HalalStatus = user.halalStatus ?? "none";
  const cfg = statusConfig[status];
  const StatusIcon = cfg.icon;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("uploadImageOnly"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("fileTooLarge"));
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${session.user.id}/halal-cert-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("halal-certificates")
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("halal-certificates")
        .getPublicUrl(filePath);

      await updateProfile({ halalCertUrl: publicUrl, halalStatus: "pending", halalVerified: false });
      toast.success(t("halalSubmitted"));
    } catch (err) {
      console.error(err);
      toast.error(t("uploadFailed"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    setUploading(true);
    try {
      if (certUrl) {
        const parts = certUrl.split("/halal-certificates/");
        if (parts[1]) {
          await supabase.storage.from("halal-certificates").remove([decodeURIComponent(parts[1])]);
        }
      }
      await updateProfile({ halalCertUrl: undefined, halalVerified: false, halalStatus: "none" });
      toast.success(t("halalDisabled"));
    } catch (err) {
      console.error(err);
      toast.error(t("removeFailed"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-4 mt-8">
      <h3 className="text-sm font-display font-bold text-foreground mb-3">{t("halalVerification")}</h3>
      <div className="rounded-2xl border border-border bg-card shadow-card p-4 space-y-4">
        {/* Status header */}
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.colorClass}`}>
            <StatusIcon className={`h-5 w-5 ${status === "approved" ? "text-green-600" : status === "pending" ? "text-amber-600" : status === "rejected" ? "text-destructive" : "text-muted-foreground"}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">{t(cfg.labelKey as any)}</p>
            <p className="text-xs text-muted-foreground">
              {status === "pending" ? t("halalPendingDesc") : status === "rejected" ? t("halalRejectedDesc") : t("halalCertDesc")}
            </p>
          </div>
        </div>

        {/* Certificate preview */}
        {certUrl && (
          <div className="relative rounded-xl overflow-hidden border border-border">
            <img src={certUrl} alt="Halal Certificate" className="w-full h-40 object-cover" />
            {status !== "approved" && (
              <div className="absolute top-2 right-2">
                <button
                  onClick={handleRemove}
                  disabled={uploading}
                  className="p-1.5 rounded-lg bg-background/80 backdrop-blur hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              </div>
            )}
            {status === "pending" && (
              <div className="absolute bottom-0 inset-x-0 bg-amber-500/90 text-white text-xs font-medium text-center py-1.5">
                {t("halalPendingBadge")}
              </div>
            )}
            {status === "approved" && (
              <div className="absolute bottom-0 inset-x-0 bg-green-600/90 text-white text-xs font-medium text-center py-1.5">
                {t("halalApprovedBadge")}
              </div>
            )}
          </div>
        )}

        {/* Upload area */}
        {(!certUrl || status === "rejected") && (
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-border hover:border-primary/40 cursor-pointer transition-colors"
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
            ) : (
              <>
                <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  {status === "rejected" ? t("reuploadCert") : t("uploadCert")}
                </p>
                <p className="text-xs text-muted-foreground">{t("uploadCertHint")}</p>
              </>
            )}
          </div>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

        {/* Replace certificate (only when pending) */}
        {certUrl && status === "pending" && !uploading && (
          <Button variant="outline" className="w-full h-10" onClick={() => fileInputRef.current?.click()}>
            <Image className="h-4 w-4 mr-2" />
            {t("replaceCert")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default HalalVerificationSection;
