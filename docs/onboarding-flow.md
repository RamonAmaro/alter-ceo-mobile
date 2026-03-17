# Onboarding Flow — AlterCEO

## Visão geral

O onboarding coleta dados do negócio do usuário para gerar um "Plan para Duplicar tus Ventas y Trabajar la Mitad". Existem dois caminhos: Express (3 min, 13 perguntas) e Professional (7-10 min, 20 perguntas).

---

## Fluxo de telas

```
PANTALLA 0: Login (já implementada)
    ↓
PANTALLA 1: Bienvenida (welcome.tsx)
    ↓
PANTALLA 2: Escoge Express o Profesional (plan-selection.tsx)
    ↓
┌─────────────────────────────────────────────────────────────┐
│ EXPRESS (13 perguntas)                                      │
│ questions.tsx → audio-question.tsx                           │
│    ↓                                                        │
│ PANTALLA 3.2: Express Completado (express-complete.tsx)      │
│    ├─ ENVIAR → report-loading.tsx                           │
│    └─ CONTINUAR → upgrade para Professional (index 9)       │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ PROFESSIONAL (20 perguntas)                                 │
│ questions.tsx → audio-question.tsx                           │
│    ↓                                                        │
│ PANTALLA 4.2: report-loading.tsx                            │
└─────────────────────────────────────────────────────────────┘
    ↓
PANTALLA 3.4: Plan de Acción + Chat (⚠️ NÃO IMPLEMENTADA)
    ↓
PANTALLA 3.5: Aceptar/Modificar Plan (⚠️ NÃO IMPLEMENTADA)
    ↓
Home
```

---

## Perguntas Express (13)

| Index | Tipo   | Progresso | Pergunta                                       |
|-------|--------|-----------|------------------------------------------------|
| 0     | single | 0%        | Facturación anual aproximada                   |
| 1     | single | 5%        | Empleados en plantilla                         |
| 2     | single | 10%       | Horas de trabajo al día                        |
| 3     | single | 20%       | Estado actual del negocio                      |
| 4     | single | 30%       | Emoción respecto a la actividad empresarial    |
| 5     | multi  | 40%       | Principales dolores de cabeza (multi-select)   |
| 6     | single | 50%       | Priorización de tareas diarias                 |
| 7     | single | 60%       | Cómo llegan clientes nuevos                    |
| 8     | single | 65%       | Tipo de consumo más frecuente                  |
| 9     | text   | 70%       | Web del negocio                                |
| 10    | text   | 75%       | Instagram del negocio                          |
| 11    | audio  | 80%       | Producto/servicio + precio aproximado de venta |
| 12    | audio  | 90%       | Mayor obstáculo en el día a día del negocio    |

---

## Perguntas Professional (20)

| Index | Tipo   | Progresso | Pergunta                                           |
|-------|--------|-----------|---------------------------------------------------|
| 0     | single | 0%        | Facturación anual aproximada                       |
| 1     | single | 5%        | Empleados en plantilla                             |
| 2     | single | 10%       | Horas de trabajo al día                            |
| 3     | single | 15%       | Estado actual del negocio                          |
| 4     | single | 20%       | Emoción respecto a la actividad empresarial        |
| 5     | multi  | 25%       | Principales dolores de cabeza (multi-select, SEM "Un poco de todo") |
| 6     | single | 30%       | Priorización de tareas diarias                     |
| 7     | single | 35%       | Cómo llegan clientes nuevos                        |
| 8     | single | 40%       | Tipo de consumo más frecuente                      |
| 9     | single | 45%       | Margen bruto real                                  |
| 10    | single | 50%       | Nivel de liquidez actual                           |
| 11    | single | 55%       | Guiones/técnicas de conversión en ventas           |
| 12    | single | 60%       | Rendimiento del equipo                             |
| 13    | single | 65%       | Reuniones de seguimiento                           |
| 14    | single | 70%       | Qué pasaría si desaparecieses 3 meses             |
| 15    | single | 75%       | Indicadores para medir resultados                  |
| 16    | text   | 80%       | Web del negocio                                    |
| 17    | text   | 85%       | Instagram del negocio                              |
| 18    | audio  | 90%       | Producto/servicio + mayor obstáculo al venderlo    |
| 19    | audio  | 95%       | Precio aproximado del producto/servicio principal  |

---

## Upgrade Express → Professional

Quando o usuário completa o Express e escolhe "CONTINUAR", o sistema faz upgrade preservando respostas:

### Mapeamento de respostas

| Express Index | → | Professional Index | Campo                    |
|---------------|---|-------------------|--------------------------|
| 0-8           | → | 0-8               | Choice questions (1:1)   |
| 9             | → | 16                | Web del negocio          |
| 10            | → | 17                | Instagram del negocio    |
| 11            | ✗ | —                 | Áudio perdido (pergunta diferente) |
| 12            | ✗ | —                 | Áudio perdido (pergunta diferente) |

### Áudios do Express

Os áudios do Express são **preservados** no array `audioRecords` com `origin: "express"`. As perguntas de áudio do Professional são diferentes, então o usuário grava novos áudios que são adicionados com `origin: "professional"`. No payload final, o backend recebe **todos os áudios** com a tag de origem.

- **Express áudio 1**: "...cuál es el **precio aproximado de venta**?"
- **Express áudio 2**: "...cuál es el **mayor obstáculo en el día a día**?"
- **Professional áudio 1**: "...cuál es el **mayor obstáculo al venderlo**?"
- **Professional áudio 2**: "...cuál es el **precio aproximado**?"

### Resultado do upgrade

- **11 respostas choice/text preservadas** (9 choice + web + Instagram remapeados)
- **2 áudios Express preservados** em `audioRecords` (origin: "express")
- **2 novos áudios Professional** adicionados ao final (origin: "professional")
- Começa no **index 9** do Professional (primeira pergunta extra: "¿Conoces el margen bruto?")

---

## Telas pós-onboarding (⚠️ PENDENTES)

### PANTALLA 3.3 / 4.2: Report Loading
- Indicador circular de progresso (10% → 100%)
- 10 etapas com mensagens animadas
- Já implementada em `report-loading.tsx`

### PANTALLA 3.4: Plan de Acción
- Exibir o plano gerado na app
- Campo de texto estilo ChatGPT na parte inferior
- Suporte a texto e áudio
- Notificação push após 10 segundos lendo: "Desde este momento puedes interactuar con Alter CEO..."

### PANTALLA 3.5 / 4.3: Terminar Lectura del Plan
- Botões: ACEPTAR PLAN / MODIFICAR PLAN
- ACEPTAR → gerar tarefas calendarizadas
- MODIFICAR → chat com Alter CEO para ajustar o plano

---

## Persistência (estado atual)

- **Zustand store** (em memória): `planType`, `currentQuestionIndex`, `answers` (Map)
- **SecureStore** (persistente): apenas `onboarding_completed` (boolean)
- **Backend**: ⚠️ NÃO INTEGRADO — envio de respostas e áudios será implementado depois

---

## Arquivos do onboarding

| Arquivo | Descrição |
|---------|-----------|
| `src/app/(onboarding)/_layout.tsx` | Stack layout (sem header) |
| `src/app/(onboarding)/welcome.tsx` | PANTALLA 1: Bienvenida |
| `src/app/(onboarding)/plan-selection.tsx` | PANTALLA 2: Express/Professional |
| `src/app/(onboarding)/questions.tsx` | PANTALLA 3.1: Perguntas (choice/multi/text) |
| `src/app/(onboarding)/audio-question.tsx` | Perguntas de áudio (30s max) |
| `src/app/(onboarding)/express-complete.tsx` | PANTALLA 3.2: Express completado |
| `src/app/(onboarding)/report-loading.tsx` | PANTALLA 3.3/4.2: Loading circular |
| `src/app/(onboarding)/completion.tsx` | Tela final (temporária) |
| `src/constants/onboarding-questions.ts` | Dados de todas as perguntas |
| `src/stores/onboarding-store.ts` | Estado do onboarding (Zustand) |
| `src/components/question-option.tsx` | Opção de resposta (radio/checkbox) |
| `src/components/record-button.tsx` | Botão de gravação com animações |
| `src/components/countdown-overlay.tsx` | Countdown 3-2-1 antes de regravar |
