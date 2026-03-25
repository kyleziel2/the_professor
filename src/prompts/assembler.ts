import { CORE_IDENTITY_PROMPT } from "./core-identity";
import { GUIDE_01_VALUES_CLARIFICATION } from "./guides/01-values-clarification";

/**
 * Guide registry — maps guide IDs to their content.
 * Add new guides here as they are converted to TypeScript.
 */
const GUIDES: Record<string, string> = {
  "01-values-clarification": GUIDE_01_VALUES_CLARIFICATION,
  // "02-relationship-assessment": GUIDE_02_RELATIONSHIP_ASSESSMENT,
  // "03-intersection-analysis": GUIDE_03_INTERSECTION_ANALYSIS,
  // ... add remaining guides as they are created
};

/**
 * Assembles the full system prompt by combining the Core Identity Prompt
 * with the selected Conversation Guide.
 *
 * @param guideId - The ID of the conversation guide to load (e.g., "01-values-clarification")
 * @returns The complete system prompt string
 */
export function assembleSystemPrompt(guideId?: string): string {
  // If a guide is specified and exists, combine Core + Guide
  if (guideId && GUIDES[guideId]) {
    return `${CORE_IDENTITY_PROMPT}\n\n${GUIDES[guideId]}`;
  }

  // Default: Core Identity only (general coaching mode)
  return CORE_IDENTITY_PROMPT;
}

/**
 * Returns the default guide ID for Phase 1 testing.
 * In Phase 2, this will be replaced by intent detection logic
 * that reads the learner's first message and selects the appropriate guide.
 */
export function getDefaultGuideId(): string {
  return "01-values-clarification";
}

/**
 * Returns a list of all available guide IDs.
 * Useful for debugging and future admin interfaces.
 */
export function getAvailableGuides(): string[] {
  return Object.keys(GUIDES);
}
