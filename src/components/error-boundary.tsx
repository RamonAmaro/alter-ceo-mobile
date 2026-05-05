import { Component, type ErrorInfo, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { Button } from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Spacing } from "@/constants/theme";
import { logger } from "@/lib/logger";

interface ErrorBoundaryProps {
  readonly children: ReactNode;
  readonly fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  readonly error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.captureException(error, {
      componentStack: info.componentStack,
      source: "ErrorBoundary",
    });
  }

  handleReset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (!error) return children;

    if (fallback) return fallback(error, this.handleReset);

    return <DefaultFallback onReset={this.handleReset} />;
  }
}

interface DefaultFallbackProps {
  readonly onReset: () => void;
}

function DefaultFallback({ onReset }: DefaultFallbackProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="headingMd" style={styles.title}>
          Algo salió mal
        </ThemedText>
        <ThemedText type="bodyMd" style={styles.message}>
          Hemos detectado un error inesperado. Por favor, inténtalo de nuevo.
        </ThemedText>
        <Button label="Reintentar" onPress={onReset} style={styles.button} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SemanticColors.surfaceDark,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
  },
  content: {
    width: "100%",
    maxWidth: 480,
    alignItems: "center",
  },
  title: {
    color: SemanticColors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.three,
  },
  message: {
    color: SemanticColors.textSubtle,
    textAlign: "center",
    marginBottom: Spacing.five,
  },
  button: {
    minWidth: 200,
  },
});
