import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useI18n, Lang } from "@/context/I18nContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const LanguageSettings = () => {
  const { lang, setLang, t } = useI18n();
  const [selected, setSelected] = useState<Lang>(lang);

  const save = () => setLang(selected);

  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background px-4 lg:px-6 py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
        <h1 className="text-2xl font-semibold">{t("languageSettings")}</h1>
        <Card className="p-6 bg-card/40 backdrop-blur-sm border-border/60 rounded-2xl space-y-4">
          <RadioGroup value={selected} onValueChange={(v)=>setSelected(v as Lang)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="en" id="en" />
              <Label htmlFor="en">{t("english")}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hi" id="hi" />
              <Label htmlFor="hi">{t("hindi")}</Label>
            </div>
          </RadioGroup>
          <div className="pt-2">
            <Button onClick={save} variant="cosmic">{t("save")}</Button>
          </div>
          <div className="pt-2 text-sm text-muted-foreground">{t("otherLanguages")}: Spanish, French (coming soon)</div>
        </Card>
      </div>
    </div>
  );
};

export default LanguageSettings;
