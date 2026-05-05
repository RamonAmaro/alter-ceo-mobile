import type { StrategyKey } from "@/components/strategies/strategy-catalog";

export interface StrategyIntroObjective {
  readonly title: string;
  readonly description: string;
}

export interface StrategyIntroContent {
  readonly eyebrow: string;
  readonly title: string;
  readonly whatIs: readonly string[];
  readonly objectives: readonly StrategyIntroObjective[];
  readonly continueLabel: string;
  readonly hasInstructionsScreen?: boolean;
}

export const STRATEGY_INTROS: Partial<Record<StrategyKey, StrategyIntroContent>> = {
  captacion_5_fases: {
    eyebrow: "Estrategia personalizada",
    title: "Crear nueva Estrategia de Captación de Clientes",
    whatIs: [
      "Si no dispones de una estrategia clara sobre cómo atraer de forma consistente clientes nuevos cada mes a tu negocio, entonces simplemente dependes de la suerte. Esperar a que lleguen clientes por sí solos es un error, incluso aunque en la actualidad te esté funcionando: en algún momento dejarán de venir y el negocio caerá.",
      "Captar clientes significa generar clientes nuevos de forma constante, controlada y predecible. No se trata solo de vender hoy, sino de construir relaciones para el futuro. Primero atraes, luego conviertes y después fidelizas.",
      "Si no haces esto, otros lo harán por ti y se llevarán tus clientes. Tener una estrategia de captación clara te da control, estabilidad y crecimiento real en el tiempo.",
    ],
    objectives: [
      {
        title: "Crecimiento sostenible",
        description:
          "Permite atraer clientes constantemente, compensar pérdidas naturales y hacer crecer el negocio de forma estable.",
      },
      {
        title: "Control del negocio",
        description:
          "Dejas de depender del azar o recomendaciones y pasas a generar clientes cuando tú decides.",
      },
      {
        title: "Mayor rentabilidad a largo plazo",
        description:
          "Construyes relaciones que generan ventas repetidas y aumentan el valor de cada cliente captado.",
      },
    ],
    continueLabel: "INICIAR PROCESO",
  },
  guion_ventas: {
    eyebrow: "Estrategia personalizada",
    title: "Crear Guion de Ventas",
    whatIs: [
      "Esta estrategia consiste en estructurar de forma intencionada cómo presentas tu producto o servicio para que tu cliente lo entienda mejor, lo perciba con más valor y le resulte más fácil tomar la decisión de compra.",
      "No se trata solo de explicar lo que vendes, sino de ordenar tu mensaje para conectar con el problema, despertar interés, generar deseo, reforzar la confianza y facilitar el cierre. También te permite adaptar tu comunicación al tipo de cliente, al momento de venta y a la percepción que tiene sobre el precio.",
      "Su objetivo es ayudarte a vender con más claridad, intención y eficacia con el objetivo de elevar la tasa de conversión.",
    ],
    objectives: [
      {
        title: "Mejorar cómo tu cliente entiende tu propuesta",
        description:
          "Te permite organizar tu mensaje para que tu cliente comprenda mejor qué le ofreces, por qué le interesa y por qué elegirte a ti por encima del resto.",
      },
      {
        title: "Aumentar la percepción de valor antes de la compra",
        description:
          "Te ayuda a elevar expectativas, conectar con el problema y activar el núcleo emocional donde tu cliente toma la decisión de comprar.",
      },
      {
        title: "Facilitar la decisión y mejorar tu conversión",
        description:
          "Te permite reducir dudas, reforzar la confianza y guiar a tu cliente hacia el consumo con una comunicación de alto nivel optimizada hacia el cierre.",
      },
    ],
    continueLabel: "INICIAR PROCESO",
  },
  test_mentalidad: {
    eyebrow: "Diagnóstico personalizado",
    title: "Test de Mentalidad Empresarial",
    whatIs: [
      "Un test de mentalidad empresarial consiste en analizar de forma estructurada cómo piensa una persona cuando se enfrenta al reto de construir mejores resultados en su negocio. No mide únicamente conocimientos técnicos ni resultados actuales, sino la forma en la que interpreta el mercado, el dinero, el cliente, la responsabilidad, el cambio, el riesgo y sus propias limitaciones.",
      "Implica revisar patrones de pensamiento, creencias heredadas, influencia del entorno, resistencia al cambio y nivel de orientación a la acción. También permite detectar si la persona piensa más desde la excusa, el miedo o la limitación, o si está preparada para asumir responsabilidad, aprender, cambiar hábitos y tomar decisiones que puedan transformar su negocio.",
      "Su objetivo es ayudar al empresario a comprender qué parte de su mentalidad está impulsando su crecimiento y qué parte puede estar frenando su evolución.",
    ],
    objectives: [
      {
        title: "Detectar creencias limitantes",
        description:
          "Permite identificar pensamientos, miedos o patrones heredados que pueden estar frenando la toma de decisiones y el crecimiento empresarial.",
      },
      {
        title: "Medir la orientación al cambio",
        description:
          "Ayuda a valorar si la persona está preparada para aprender, actuar, asumir responsabilidad y salir de su forma habitual de pensar.",
      },
      {
        title: "Activar una mentalidad de crecimiento",
        description:
          "Permite señalar qué debe trabajar la persona para elevar su claridad, disciplina, ambición y capacidad de construir mejores resultados.",
      },
    ],
    continueLabel: "CONTINUAR",
    hasInstructionsScreen: true,
  },
  analisis_competencia: {
    eyebrow: "Análisis estratégico",
    title: "Análisis de Competidores",
    whatIs: [
      "Una estrategia de análisis de la competencia consiste en estudiar de forma estructurada cómo otros negocios del mismo mercado atraen, convencen y retienen a sus clientes. No se trata de copiar lo que hacen, sino de entender cómo comunican, qué valor percibe el cliente, cómo es su proceso de venta y qué experiencia ofrecen.",
      "También permite identificar a qué tipo de cliente se dirigen y qué factores influyen en la decisión de compra. Su objetivo es detectar oportunidades de mejora, diferenciarse y tomar decisiones más acertadas, basadas en cómo el cliente compara y elige entre distintas opciones.",
    ],
    objectives: [
      {
        title: "Entender cómo decide el cliente",
        description:
          "Permite identificar qué factores influyen en la elección y cómo compara distintas opciones antes de comprar.",
      },
      {
        title: "Detectar oportunidades de diferenciación",
        description:
          "Ayuda a encontrar huecos en el mercado donde destacar y evitar competir únicamente por precio.",
      },
      {
        title: "Mejorar la propuesta y la experiencia",
        description:
          "Permite ajustar comunicación, oferta y proceso para aumentar valor percibido y conversión del negocio.",
      },
    ],
    continueLabel: "INICIAR PROCESO",
  },
  value_ideas: {
    eyebrow: "Estrategia personalizada",
    title: "Crear Ideas de Valor",
    whatIs: [
      "Una estrategia de creación de ideas de valor consiste en analizar de forma estructurada cómo mejorar lo que el cliente experimenta antes, durante y después de consumir un producto o servicio. No se centra únicamente en lo que se vende, sino en cómo se percibe, cómo se vive y qué sensaciones genera en el cliente.",
      "Implica revisar la experiencia actual, identificar puntos de mejora y diseñar acciones concretas que aumenten el valor percibido, generen diferenciación y provoquen un impacto positivo en el cliente. Esto incluye aspectos como la comunicación, los detalles, los procesos, los elementos sorpresa y todo aquello que influye en cómo el cliente interpreta lo que recibe.",
      "Su objetivo es conseguir que el cliente perciba que recibe más de lo que esperaba, generando satisfacción, fidelización y recomendación.",
    ],
    objectives: [
      {
        title: "Aumentar el valor percibido",
        description:
          "Permite diseñar mejoras para que el cliente sienta que recibe más de lo que paga, elevando su satisfacción tras la compra.",
      },
      {
        title: "Mejorar la experiencia del cliente",
        description:
          "Ayuda a optimizar cada punto de contacto para generar una experiencia más completa, cuidada y coherente desde el primer impacto hasta el consumo.",
      },
      {
        title: "Generar diferenciación y efecto WOW",
        description:
          "Permite incorporar elementos que destaquen frente a la competencia y superen las expectativas del cliente, favoreciendo la fidelización y la recomendación.",
      },
    ],
    continueLabel: "INICIAR PROCESO",
  },
};

export interface MentalidadInstructionTip {
  readonly title: string;
  readonly description: string;
}

export interface MentalidadInstructionsContent {
  readonly title: string;
  readonly intro: readonly string[];
  readonly tips: readonly MentalidadInstructionTip[];
  readonly continueLabel: string;
}

export const MENTALIDAD_INSTRUCTIONS: MentalidadInstructionsContent = {
  title: "¿Cómo contestar el test?",
  intro: [
    "A continuación encontrarás una serie de afirmaciones sobre el día a día, el entorno socio-económico y los negocios. Lee cada una de ellas y evalúa hasta qué punto estás de acuerdo o en desacuerdo con lo que dice.",
    "Debes responder usando una escala del 1 al 10: 1 significa que estás totalmente en desacuerdo. 10 significa que estás totalmente de acuerdo.",
    "Elige la puntuación que mejor refleje lo que piensas o sientes en este momento. Algunos aspectos que debes tener en cuenta:",
  ],
  tips: [
    {
      title: "Responde desde la honestidad, no desde lo que «debería ser»",
      description:
        "No evalúes si lo que dices está bien o mal. Es clave que respondas en función de lo que realmente piensas y sientes hoy según tu percepción o comportamientos más habituales, no en base a lo que crees que sería correcto responder. Cuanto más honesto seas, más útil será el resultado.",
    },
    {
      title: "No analices en exceso cada afirmación",
      description:
        "Lee cada afirmación y responde de forma ágil, casi instintiva. Si te paras a racionalizar o buscar la «respuesta perfecta», vas a distorsionar el resultado.",
    },
    {
      title: "Utiliza toda la escala de forma consciente",
      description:
        "1 → Totalmente en desacuerdo. 5 → Punto intermedio o duda. 10 → Totalmente de acuerdo. No uses solo extremos o el punto medio. Aprovecha 7-8 si estás más bien de acuerdo y 2-4 si estás más bien en desacuerdo, para conseguir un análisis más preciso.",
    },
  ],
  continueLabel: "INICIAR TEST",
};
