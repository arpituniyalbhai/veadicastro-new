import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/context/I18nContext";
import { Copy } from "lucide-react";

const Refer = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const uniqueId = useMemo(() => {
    if (user?.uid) return user.uid;
    if (user?.email) return btoa(user.email);
    return "guest";
  }, [user]);

  const referralLink = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://www.ourwebsite.com";
    return `${origin}/referal?user_id=${encodeURIComponent(uniqueId)}`;
  }, [uniqueId]);

  const copyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(referralLink);
      } else {
        const ta = document.createElement("textarea");
        ta.value = referralLink;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // noop
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 lg:px-6 py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">{t("referralTitle")}</h1>
        <Card className="p-6 bg-card/40 backdrop-blur-sm border-border/60 rounded-2xl space-y-4">
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/30">
              <h3 className="font-semibold text-lg mb-2">🎁 Referral Reward</h3>
              <p className="text-sm text-muted-foreground">
                Earn <span className="font-bold text-secondary">2 free questions</span> when someone signs up using your referral link!
              </p>
            </div>
            
            <div>
              <Label className="text-sm text-muted-foreground">{t("yourLink")}</Label>
              <div className="mt-2 flex gap-2">
                <Input readOnly value={referralLink} className="h-12" />
                <Button onClick={copyLink} variant="cosmic" className="h-12 px-4">
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? t("copied") : t("copyLink")}
                </Button>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("referralInfo")}
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Refer;
