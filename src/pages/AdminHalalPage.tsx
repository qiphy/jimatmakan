import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, XCircle, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface PendingVendor {
  id: string;
  full_name: string;
  business_name: string | null;
  email: string;
  halal_cert_url: string | null;
  halal_status: string;
}

const AdminHalalPage = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<PendingVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
      return;
    }
    fetchVendors();
  }, [authLoading, isAuthenticated]);

  const fetchVendors = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, business_name, email, halal_cert_url, halal_status")
      .eq("role", "vendor")
      .in("halal_status", ["pending", "approved", "rejected"]);

    if (data && !error) {
      setVendors(data as PendingVendor[]);
    }
    setLoading(false);
  };

  const updateStatus = async (vendorId: string, status: "approved" | "rejected") => {
    setProcessing(vendorId);
    const updates: Record<string, unknown> = {
      halal_status: status,
      halal_verified: status === "approved",
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", vendorId);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(status === "approved" ? "Certificate approved" : "Certificate rejected");
      fetchVendors();
    }
    setProcessing(null);
  };

  const pendingVendors = vendors.filter((v) => v.halal_status === "pending");
  const reviewedVendors = vendors.filter((v) => v.halal_status !== "pending");

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-3 px-4 pt-[env(safe-area-inset-top,12px)] pb-3 border-b border-border">
        <button onClick={() => navigate("/")} className="p-2 -ml-2">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h1 className="text-base font-display font-bold text-foreground">Halal Certificate Admin</h1>
      </header>

      <div className="p-4 space-y-6">
        {/* Pending */}
        <section>
          <h2 className="text-sm font-display font-bold text-foreground mb-3">
            Pending Review ({pendingVendors.length})
          </h2>
          {pendingVendors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending certificates</p>
          ) : (
            <div className="space-y-3">
              {pendingVendors.map((vendor) => (
                <VendorCard
                  key={vendor.id}
                  vendor={vendor}
                  processing={processing === vendor.id}
                  onApprove={() => updateStatus(vendor.id, "approved")}
                  onReject={() => updateStatus(vendor.id, "rejected")}
                />
              ))}
            </div>
          )}
        </section>

        {/* Previously reviewed */}
        {reviewedVendors.length > 0 && (
          <section>
            <h2 className="text-sm font-display font-bold text-foreground mb-3">
              Previously Reviewed ({reviewedVendors.length})
            </h2>
            <div className="space-y-3">
              {reviewedVendors.map((vendor) => (
                <VendorCard
                  key={vendor.id}
                  vendor={vendor}
                  processing={processing === vendor.id}
                  onApprove={() => updateStatus(vendor.id, "approved")}
                  onReject={() => updateStatus(vendor.id, "rejected")}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

const VendorCard = ({
  vendor,
  processing,
  onApprove,
  onReject,
}: {
  vendor: PendingVendor;
  processing: boolean;
  onApprove: () => void;
  onReject: () => void;
}) => {
  const isApproved = vendor.halal_status === "approved";
  const isRejected = vendor.halal_status === "rejected";

  return (
    <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
      {/* Certificate image */}
      {vendor.halal_cert_url && (
        <a href={vendor.halal_cert_url} target="_blank" rel="noopener noreferrer">
          <img
            src={vendor.halal_cert_url}
            alt="Halal Certificate"
            className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
          />
        </a>
      )}

      <div className="p-4 space-y-3">
        <div>
          <p className="text-sm font-medium text-foreground">{vendor.full_name}</p>
          {vendor.business_name && (
            <p className="text-xs text-muted-foreground">{vendor.business_name}</p>
          )}
          <p className="text-xs text-muted-foreground">{vendor.email}</p>
        </div>

        {/* Status badge */}
        {(isApproved || isRejected) && (
          <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
            isApproved ? "bg-green-100 text-green-700" : "bg-destructive/10 text-destructive"
          }`}>
            {isApproved ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
            {isApproved ? "Approved" : "Rejected"}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 h-9"
            disabled={processing || isApproved}
            onClick={onApprove}
          >
            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1.5" />}
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-9 text-destructive border-destructive/20 hover:bg-destructive/5"
            disabled={processing || isRejected}
            onClick={onReject}
          >
            <XCircle className="h-4 w-4 mr-1.5" />
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminHalalPage;
