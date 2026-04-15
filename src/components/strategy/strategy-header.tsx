import { ScreenHeader } from "@/components/screen-header";

interface StrategyHeaderProps {
  topInset: number;
  onBack?: () => void;
  showBack?: boolean;
}

export function StrategyHeader({ topInset, onBack, showBack }: StrategyHeaderProps) {
  return (
    <ScreenHeader
      topInset={topInset}
      icon="bar-chart"
      titlePrefix="Crear"
      titleAccent="Estrategia"
      onBack={onBack}
      showBack={showBack}
    />
  );
}
