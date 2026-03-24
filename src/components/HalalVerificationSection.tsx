import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BadgeCheck, Upload, Image, Trash2, Loader2, CheckCircle2 } from "lucide-react";

const HalalVerificationSection = () => {
  const { user, session, updateProfile } = useAuth();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (!user || !session) return null;

  const certUrl = user.halalCertUrl;
  const isVerified = user.halalVerified ?? false;

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

      await updateProfile({ halalCertUrl: publicUrl, halalVerified: true });
      setPreviewUrl(null);
      toast.success(t("halalEnabled"));
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
      // Extract file path from URL
      if (certUrl) {
        const parts = certUrl.split("/halal-certificates/");
        if (parts[1]) {
          await supabase.storage.from("halal-certificates").remove([decodeURIComponent(parts[1])]);
        }
      }
      await updateProfile({ halalCertUrl: undefined, halalVerified: false });
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
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${isVerified ? "bg-green-100" : "bg-secondary"}`}>
            {isVerified ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <BadgeCheck className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">
              {isVerified ? t("halalCertified") : t("halalNotVerified")}
            </p>
            <p className="text-xs text-muted-foreground">{t("halalCertDesc")}</p>
          </div>
        </div>

        {/* Certificate preview */}
        {certUrl && (
          <div className="relative rounded-xl overflow-hidden border border-border">
            <img
              src={certUrl}
              alt="Halal Certificate"
              className="w-full h-40 object-cover"
            />
            <div className="absolute top-2 right-2">
              <button
                onClick={handleRemove}
                disabled={uploading}
                className="p-1.5 rounded-lg bg-background/80 backdrop-blur hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            </div>
          </div>
        )}

        {/* Upload button */}
        {!certUrl && (
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
                <p className="text-sm font-medium text-foreground">{t("uploadCert")}</p>
                <p className="text-xs text-muted-foreground">{t("uploadCertHint")}</p>
              </>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />

        {/* Replace certificate */}
        {certUrl && !uploading && (
          <Button
            variant="outline"
            className="w-full h-10"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image className="h-4 w-4 mr-2" />
            {t("replaceCert")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default HalalVerificationSection;
