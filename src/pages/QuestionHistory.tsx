import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/context/I18nContext";

const QuestionHistory = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background px-4 lg:px-6 py-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">{t("questionsHistory")}</h1>
        <Card className="p-8 bg-card/40 backdrop-blur-sm border-border/60 rounded-2xl text-center space-y-4">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-xl font-semibold">Coming Soon</h2>
          <p className="text-sm text-muted-foreground">
            We're working on bringing you a comprehensive questions history feature. Stay tuned!
          </p>
          <Button variant="cosmic" onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        </Card>
      </div>
    </div>
  );
};

export default QuestionHistory;
