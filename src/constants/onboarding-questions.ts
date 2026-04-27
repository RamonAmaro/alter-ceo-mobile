export type QuestionType = "single" | "multi" | "text" | "integer" | "audio";
export type QuestionValidationKind = "website" | "instagram";

export interface QuestionOption {
  label: string;
  subtitle?: string;
}

export interface Question {
  type: QuestionType;
  question: string;
  instruction?: string;
  progress: number;
  options?: QuestionOption[];
  placeholder?: string;
  validationKind?: QuestionValidationKind;
  unavailableOptionLabel?: string;
  unavailableOptionValue?: string;
}

export function getExpressQuestions(): Question[] {
  return [
    {
      type: "single",
      progress: 0,
      question: "¿Cuántas horas dedicas a tu negocio al día de media?",
      options: [
        { label: "Menos de 6" },
        { label: "Entre 6 y 8" },
        { label: "Entre 8 y 10" },
        { label: "Más de 10" },
      ],
    },
    {
      type: "single",
      progress: 5,
      question: "¿Cuántos empleados tienes en plantilla?",
      options: [
        { label: "Aún no tengo negocio." },
        { label: "Autónomo" },
        { label: "De 1 a 3" },
        { label: "De 4 a 10" },
        { label: "De 11 a 30" },
        { label: "De 30 a 60" },
        { label: "De 60 a 100" },
        { label: "Más de 100" },
      ],
    },
    {
      type: "integer",
      progress: 10,
      question:
        "Introduce tu facturación MENSUAL aproximada sin puntos ni decimales (ejemplo: 7000, 25000, 400000, etc)",
      placeholder: "7000",
      unavailableOptionLabel: "Aún no tengo negocio.",
      unavailableOptionValue: "__no_business__",
    },
    {
      type: "single",
      progress: 20,
      question: "¿Qué situación describe mejor el estado actual de tu negocio?",
      options: [
        { label: "Negocio estancado pero rentable" },
        { label: "Estancado y poco rentable" },
        { label: "Creciendo con rentabilidad" },
        { label: "Creciendo pero sin rentabilidad" },
        { label: "No tengo o está en sus inicios" },
        { label: "En riesgo de quiebra/cierre" },
      ],
    },
    {
      type: "single",
      progress: 30,
      question:
        "¿Qué emoción describe mejor cómo te sientes al respecto de la actividad empresarial?",
      options: [
        { label: "Ilusionado / entusiasmado" },
        { label: "Animado pero perdido" },
        { label: "Animado pero estresado" },
        { label: "Estresado / agobiado" },
        { label: "Cansado / desilusionado" },
        { label: "Esclavo del negocio" },
      ],
    },
    {
      type: "multi",
      progress: 40,
      question: "¿Cuáles son tus PRINCIPALES dolores de cabeza ahora mismo?",
      instruction: "(puedes seleccionar más de una)",
      options: [
        {
          label: "Crecimiento:",
          subtitle: "No consigo cumplir mis expectativas de crecimiento.",
        },
        {
          label: "Ventas:",
          subtitle: "No consigo clientes nuevos o son inestables.",
        },
        {
          label: "Precio:",
          subtitle: "Tengo que competir por precio para vender.",
        },
        {
          label: "Equipo:",
          subtitle: "No se implican o no rinden como yo.",
        },
        {
          label: "Tiempo:",
          subtitle: "Soy el hombre-orquesta, todo depende de mí.",
        },
        {
          label: "Rentabilidad:",
          subtitle: "Facturo mucho pero me quedan pocos beneficios.",
        },
        {
          label: "Escalabilidad:",
          subtitle: "El negocio funciona y quiero escalarlo significativamente.",
        },
        { label: "Un poco de todo." },
      ],
    },
    {
      type: "single",
      progress: 50,
      question: "¿En qué te basas para priorizar tus tareas diarias?",
      options: [
        { label: "Tengo objetivos, pero el día a día me come." },
        { label: "Planes estratégicos y análisis de datos." },
        { label: "Voy decidiendo sobre la marcha." },
      ],
    },
    {
      type: "single",
      progress: 60,
      question: "¿Cómo llegan clientes nuevos a tu negocio?",
      options: [
        { label: "Principalmente por el boca a boca." },
        { label: "Principalmente por la ubicación física." },
        { label: "Principalmente con fuerza comercial." },
        {
          label: "Campañas de marketing / comunicación / publicidad.",
        },
        {
          label: "Mezcla de boca a boca y alguna acción comercial.",
        },
        { label: "Alianzas / colaboraciones." },
        { label: "Otros." },
      ],
    },
    {
      type: "single",
      progress: 65,
      question: "¿Qué tipo de consumo es más frecuente en tu negocio?",
      options: [
        { label: "El cliente consume una sola vez." },
        { label: "Consumo esporádico." },
        { label: "Consumo frecuente." },
        { label: "Cuota o suscripción mensual." },
      ],
    },
    {
      type: "text",
      progress: 70,
      question:
        "Indica la web de tu negocio (necesario para procesar tu negocio y comprender tu propuesta de valor)",
      placeholder: "tunegocio.com",
      validationKind: "website",
      unavailableOptionLabel: "No tengo web",
      unavailableOptionValue: "__no_website__",
    },
    {
      type: "text",
      progress: 75,
      question:
        "Indica el Instagram de tu negocio (necesario para comprender la esencia de tu negocio)",
      placeholder: "@tunegocio",
      validationKind: "instagram",
      unavailableOptionLabel: "No tengo Instagram",
      unavailableOptionValue: "__no_instagram__",
    },
    {
      type: "audio",
      progress: 80,
      question:
        "¿Cuál es tu producto o servicio principal y cuál es el precio aproximado de venta?",
      instruction:
        "Graba un audio de un máximo de 30 segundos contestando a la siguiente pregunta:",
    },
    {
      type: "audio",
      progress: 90,
      question: "¿Cuál es el mayor obstáculo en el día a día de tu negocio en este momento?",
      instruction:
        "Por último, graba un audio de un máximo de 30 segundos contestando a la siguiente pregunta:",
    },
  ];
}

export function getProfessionalQuestions(): Question[] {
  return [
    {
      type: "single",
      progress: 0,
      question: "¿Cuántas horas dedicas a tu negocio al día de media?",
      options: [
        { label: "Menos de 6" },
        { label: "Entre 6 y 8" },
        { label: "Entre 8 y 10" },
        { label: "Más de 10" },
      ],
    },
    {
      type: "single",
      progress: 5,
      question: "¿Cuántos empleados tienes en plantilla?",
      options: [
        { label: "Aún no tengo negocio." },
        { label: "Autónomo" },
        { label: "De 1 a 3" },
        { label: "De 4 a 10" },
        { label: "De 11 a 30" },
        { label: "De 30 a 60" },
        { label: "De 60 a 100" },
        { label: "Más de 100" },
      ],
    },
    {
      type: "integer",
      progress: 10,
      question:
        "Introduce tu facturación MENSUAL aproximada sin puntos ni decimales (ejemplo: 7000, 25000, 400000, etc)",
      placeholder: "7000",
      unavailableOptionLabel: "Aún no tengo negocio.",
      unavailableOptionValue: "__no_business__",
    },
    {
      type: "single",
      progress: 15,
      question: "¿Qué situación describe mejor el estado actual de tu negocio?",
      options: [
        { label: "Negocio estancado pero rentable" },
        { label: "Estancado y poco rentable" },
        { label: "Creciendo con rentabilidad" },
        { label: "Creciendo pero sin rentabilidad" },
        { label: "No tengo o está en sus inicios" },
        { label: "En riesgo de quiebra/cierre" },
      ],
    },
    {
      type: "single",
      progress: 20,
      question:
        "¿Qué emoción describe mejor cómo te sientes al respecto de la actividad empresarial?",
      options: [
        { label: "Ilusionado / entusiasmado" },
        { label: "Animado pero perdido" },
        { label: "Animado pero estresado" },
        { label: "Estresado / agobiado" },
        { label: "Cansado / desilusionado" },
        { label: "Esclavo del negocio" },
      ],
    },
    {
      type: "multi",
      progress: 25,
      question: "¿Cuáles son tus PRINCIPALES dolores de cabeza ahora mismo?",
      instruction: "(puedes seleccionar más de una)",
      options: [
        {
          label: "Crecimiento:",
          subtitle: "No consigo cumplir mis expectativas de crecimiento.",
        },
        {
          label: "Ventas:",
          subtitle: "No consigo clientes nuevos o son inestables.",
        },
        {
          label: "Precio:",
          subtitle: "Tengo que competir por precio para vender.",
        },
        {
          label: "Equipo:",
          subtitle: "No se implican o no rinden como yo.",
        },
        {
          label: "Tiempo:",
          subtitle: "Soy el hombre-orquesta, todo depende de mí.",
        },
        {
          label: "Rentabilidad:",
          subtitle: "Facturo mucho pero me quedan pocos beneficios.",
        },
        {
          label: "Escalabilidad:",
          subtitle: "El negocio funciona y quiero escalarlo significativamente.",
        },
      ],
    },
    {
      type: "single",
      progress: 30,
      question: "¿En qué te basas para priorizar tus tareas diarias?",
      options: [
        { label: "Tengo objetivos, pero el día a día me come." },
        { label: "Planes estratégicos y análisis de datos." },
        { label: "Voy decidiendo sobre la marcha." },
      ],
    },
    {
      type: "single",
      progress: 35,
      question: "¿Cómo llegan clientes nuevos a tu negocio?",
      options: [
        { label: "Principalmente por el boca a boca." },
        { label: "Principalmente por la ubicación física." },
        { label: "Principalmente con fuerza comercial." },
        {
          label: "Campañas de marketing / comunicación / publicidad.",
        },
        {
          label: "Mezcla de boca a boca y alguna acción comercial.",
        },
        { label: "Alianzas / colaboraciones." },
        { label: "Otros." },
      ],
    },
    {
      type: "single",
      progress: 40,
      question: "¿Qué tipo de consumo es más frecuente en tu negocio?",
      options: [
        { label: "El cliente consume una sola vez." },
        { label: "Consumo esporádico." },
        { label: "Consumo frecuente." },
        { label: "Cuota o suscripción mensual." },
      ],
    },
    {
      type: "single",
      progress: 45,
      question: "¿Conoces el margen bruto real de tus productos o servicios?",
      options: [
        { label: "Sí, al céntimo." },
        { label: "Tengo una idea aproximada." },
        { label: "No lo sé con seguridad." },
        { label: "No lo sé ni tampoco sé cómo obtenerlo." },
      ],
    },
    {
      type: "single",
      progress: 50,
      question: "¿Cuál es tu nivel de liquidez actual?",
      options: [
        {
          label: "Tengo caja suficiente para aguantar más de 6 meses sin ventas.",
        },
        {
          label: "Tengo caja suficiente para aguantar 1-3 meses.",
        },
        {
          label: "No sabría contestar exactamente a la pregunta.",
        },
        {
          label: "Vivo al día, lo que entra es más o menos lo que sale.",
        },
      ],
    },
    {
      type: "single",
      progress: 55,
      question:
        "¿Dispones de guiones y técnicas optimizadas para incrementar tu tasa de conversión en ventas?",
      options: [
        { label: "Vendemos más por experiencia o intuición." },
        {
          label: "Sí, seguimos scripts basados en procesos de decisión del cliente.",
        },
        { label: "No hay protocolos de ventas definidos." },
      ],
    },
    {
      type: "single",
      progress: 60,
      question: "¿Cómo definirías el rendimiento de tu equipo?",
      options: [
        {
          label: "Tengo que estar encima para que las cosas salgan bien.",
        },
        {
          label: "Siento que pasan de todo, estoy frustrado.",
        },
        {
          label: "Tengo un equipo autosuficiente y de alto rendimiento.",
        },
        { label: "No tengo equipo en este momento." },
      ],
    },
    {
      type: "single",
      progress: 65,
      question: "¿Haces reuniones de seguimiento con tu equipo?",
      options: [
        { label: "Sí, sagradas y productivas." },
        {
          label: "Hacemos reuniones, pero son una pérdida de tiempo.",
        },
        { label: "Hacemos reuniones si hace falta." },
        { label: "No solemos hacer." },
      ],
    },
    {
      type: "single",
      progress: 70,
      question: "¿Qué pasaría si desaparecieses 3 meses de tu negocio?",
      options: [
        { label: "Funcionaría perfectamente sin mí." },
        { label: "Sobreviviría, pero con dificultades." },
        {
          label: "Los resultados se verían drásticamente afectados.",
        },
        { label: "Se hundiría, sin duda." },
      ],
    },
    {
      type: "single",
      progress: 75,
      question: "¿Dispones de indicadores para medir los resultados de tu negocio regularmente?",
      options: [
        { label: "Sí, tengo un cuadro de mando detallado." },
        {
          label: "Miro de vez en cuando el banco y la facturación.",
        },
        {
          label: "Tengo una idea aproximada pero no muy concreta.",
        },
        { label: "No entiendo bien la pregunta." },
        { label: "Sinceramente, voy a ciegas." },
      ],
    },
    {
      type: "text",
      progress: 80,
      question:
        "Indica la web de tu negocio (necesario para procesar tu negocio y comprender tu propuesta de valor)",
      placeholder: "tunegocio.com",
      unavailableOptionLabel: "No tengo web",
      unavailableOptionValue: "__no_website__",
    },
    {
      type: "text",
      progress: 85,
      question:
        "Indica el Instagram de tu negocio (necesario para comprender la esencia de tu negocio)",
      placeholder: "@tunegocio",
      unavailableOptionLabel: "No tengo Instagram",
      unavailableOptionValue: "__no_instagram__",
    },
    {
      type: "audio",
      progress: 90,
      question:
        "¿Cuál es tu producto o servicio principal y cuál es el mayor obstáculo al venderlo?",
      instruction:
        "Graba un audio de un máximo de 30 segundos contestando a la siguiente pregunta:",
    },
    {
      type: "audio",
      progress: 95,
      question: "¿Cuál es el precio aproximado de tu producto o servicio principal?",
      instruction:
        "Por último, graba un audio de un máximo de 30 segundos contestando a la siguiente pregunta:",
    },
  ];
}
