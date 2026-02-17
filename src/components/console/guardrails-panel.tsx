/**
 * Guardrails Panel — re-exports PolicySettingsPanel with Guardrails branding.
 *
 * In V2.1, "Policy Settings" is rebranded as "Guardrails" to better reflect
 * the agent-first paradigm: users define what the agent CAN do (guardrails),
 * and the agent operates autonomously within those constraints.
 *
 * The full implementation remains in policy-settings-panel.tsx.
 */
export { PolicySettingsPanel as GuardrailsPanel } from "./policy-settings-panel";
