import { ReactNode } from "react";
import { PlanProvider } from "@/context/PlanContext";
import ProtectedRoute from "@/components/ProtectedRoute";

type ProtectedPlanRouteProps = {
  children: ReactNode;
};

export default function ProtectedPlanRoute({ children }: ProtectedPlanRouteProps) {
  return (
    <ProtectedRoute>
      <PlanProvider>{children}</PlanProvider>
    </ProtectedRoute>
  );
}
