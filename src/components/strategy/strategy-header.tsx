import { ScreenHeader } from "@/components/screen-header";

interface StrategyHeaderProps {
  topInset: number;
  onBack?: () => void;
}

export function StrategyHeader({ topInset, onBack }: StrategyHeaderProps) {
  return (
    <ScreenHeader
      topInset={topInset}
      icon="bar-chart"
      titlePrefix="Crear"
      titleAccent="Estrategia"
      onBack={onBack}
    />
  );
}
