# Pendências de backend para fechamento do PDF "Onboarding Alter CEO"

Este documento lista mudanças necessárias no repositório backend (`alterCEO/backend`) para que o frontend mobile possa entregar 100% das funcionalidades descritas no PDF a partir da Pantalla 3.4.

O frontend já consome **todos os campos atualmente expostos** por `PlanAlterCEO` (ver `src/types/plan.ts` e `src/components/my-plan/`). Os itens abaixo são **novos** e não existem no schema atual.

---

## 1. (Alta prioridade) — 6 pilares universales (Pantalla 3.4)

O PDF "Indicadores principales" descreve 6 pilares com 7 níveis canônicos por pilar:

- **Pilares**: Visibilidad, Comunicación, Diferenciación, Captación, Experiencia de usuario, Modelo de monetización.
- **Níveis** (com cores e percentual de gráfico circular obrigatórios):
  - `Inexistente` → rojo, 0%
  - `Debil` → amarillo, 20%
  - `Basico` → naranja, 40%
  - `Aceptable` → marrón, 60%
  - `Bueno` → azul, 80%
  - `Referente` → verde, 100%
  - `NoEvaluable` → cinza, sem preenchimento
- Cada pilar deve ter **justificación de ~300 palabras** com epígrafes/títulos.

### Sugestão de schema (`alterCEO/backend/src/levelup_agent/domain/plan.py`)

```python
PilarNivel = Literal[
    "Inexistente", "Debil", "Basico", "Aceptable", "Bueno", "Referente", "NoEvaluable"
]

class PilarUniversal(StrictModel):
    nivel: PilarNivel
    justificacion: str = Field(description="~300 palabras con epígrafes y títulos")

class SeisPilaresUniversales(StrictModel):
    visibilidad: PilarUniversal
    comunicacion: PilarUniversal
    diferenciacion: PilarUniversal
    captacion: PilarUniversal
    experiencia_usuario: PilarUniversal
    modelo_monetizacion: PilarUniversal

# Adicionar a DiagnosticoEstrategico:
class DiagnosticoEstrategico(StrictModel):
    ...
    pilares_universales: SeisPilaresUniversales | None = None
```

Quando esse campo existir, o frontend substitui os 6 status indicators atuais (Rentabilidad, Liquidez, KPIs, Planificación, Dependencia, Captación) por uma seção dedicada aos 6 pilares com cores e percentuais canônicos do PDF.

---

## 2. (Alta prioridade) — Endpoint "Aceptar Plan" (Pantalla 3.5)

> "Si le da a ACEPTAR PLAN, debe generar una serie de tareas calendarizadas que se mostrarán en otra parte de la app."

### Endpoint sugerido

`POST /v1/plans/{plan_id}/accept`

**Request body:**
```json
{ "user_id": "string" }
```

**Response (201):**
```json
{
  "plan_id": "string",
  "tasks_generated": 12,
  "calendar_starts_at": "2026-04-28T00:00:00Z"
}
```

O backend deve:
- Marcar o plano como aceito (status).
- Gerar tarefas calendarizadas com base no `plan_ventas.prioridad_inmediata_30_dias` e `plan_liderazgo.tres_pasos_redefinir_rol`.
- Persistir as tarefas em uma estrutura consumível pela tela `/(app)/tasks`.

Hoje o frontend redireciona para `/tasks` após o clique, mas a tela ficará vazia até esse endpoint existir.

---

## 3. (Alta prioridade) — Modificar Plan com chat e relançamento (Pantalla 3.5)

> "Si le da a MODIFICAR PLAN ... Alter CEO debería tomar el control de la pantalla. ... En la propia interactuación, Alter CEO le debería preguntar si tras esa conversación o esas modificaciones quiere actualizar el Plan, en cuyo caso debería volver a lanzar el proceso de creación del plan teniendo en cuenta las apreciaciones del usuario en ese proceso."

### Sugestão

Estender o endpoint atual `POST /v1/runs` para aceitar contexto de modificação:

```json
{
  "run_type": "plan_generation",
  "user_id": "string",
  "onboarding_mode": "express",
  "answers": { ... },
  "modification_context": {
    "previous_plan_id": "string",
    "chat_history": [
      { "role": "assistant", "content": "...mensaje fijo..." },
      { "role": "user", "content": "..." }
    ]
  }
}
```

Hoje o frontend abre o chat com a mensagem fixa do CEO. Quando o backend aceitar `modification_context`, o frontend pode adicionar um botão "Actualizar plan" no chat que dispara um novo run com o histórico.

---

## 4. (Média prioridade) — Notificación push após 10s (Pantalla 3.4)

> "cuando lleve 10 segundos leyendo, le debería aparecer una notificación push interrumpiendo la lectura."

**Já implementado no frontend** como aviso in-app (`PlanReadingNotice`) com persistência por `userId:planId` em AsyncStorage.

Se o produto quiser **push real do servidor**, será necessário:

- Endpoint para registrar device push token.
- Worker que dispare a notificação após 10s do `plan.fetch` (ou via SSE).

---

## 5. (Baixa prioridade) — Estacionalidad histórica para gráfico comparativo

PDF Pantalla "Propuesta de evolución de las ventas" pede, quando há estacionalidade, **dois gráficos**:

- "Situación actual" (ano passado com picos sazonais)
- "Tras aplicar el plan" (mesmos picos duplicados)

Hoje o backend retorna apenas `proyeccion_mensual_euros` (12 meses do plano). Para o gráfico comparativo, sugerir:

```python
class PlanVentas(StrictModel):
    ...
    proyeccion_baseline_actual_euros: list[float] | None = Field(
        default=None,
        min_length=12,
        max_length=12,
        description="Curva mensual del año pasado (cuando hay estacionalidad)",
    )
```

Frontend hoje exibe apenas a nota explicativa quando `estacionalidad_detectada=true`. Sem o baseline, o gráfico comparativo fica como pendência.

---

## 6. (Baixa prioridade) — Nivel canon do `RoleEvolution` ortografia

Os campos do schema `RoleEvolutionSnapshot` em `plan_role_evolution.py` usam snake_case sem acentos (ex: `microgestion_equipo`). Frontend traduz para labels com tildes/ñ na render. Não é divergência funcional, apenas um aviso.

---

## Referência rápida

| Funcionalidade PDF | Status frontend | Status backend |
|---|---|---|
| Plano com `conclusion_express` personalizada | ✅ consumindo | ✅ existe |
| 4 gráficos de evolução do rol (atual/M4/M8/M12) | ✅ consumindo | ✅ existe |
| Nota de estacionalidade | ✅ consumindo | ✅ existe (flag) |
| `resumen_negocio` completo no header | ✅ consumindo | ✅ existe |
| `tipo_consumo` + `percepcion_externa_scrapping` no diagnóstico | ✅ consumindo | ✅ existe |
| `escenario` do primer paso como badge | ✅ consumindo | ✅ existe |
| Botão Aceptar plan → gera tasks | ✅ UI + navega `/tasks` | ❌ endpoint pendente |
| Botão Modificar plan → chat + relançamento | ✅ UI + dialog + navega `/chat` | ❌ contexto pendente |
| Notificación 10s de leitura | ✅ in-app implementado | n/a (decisão de produto) |
| Chat embutido ChatGPT-style no plano | ✅ dock + abre `/chat` | ✅ existe |
| 6 pilares universales | ❌ não há campo | ❌ schema pendente |
| Gráfico estacional comparativo | ❌ não tem baseline | ❌ baseline pendente |

---

**Última atualização:** 2026-04-27
