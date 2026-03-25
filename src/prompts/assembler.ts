import { CORE_IDENTITY_PROMPT } from "./core-identity";
import { GUIDE_01_VALUES_CLARIFICATION } from "./guides/01-values-clarification";
import { GUIDE_02_RELATIONSHIP_ASSESSMENT } from "./guides/02-relationship-assessment";
import { GUIDE_03_INTERSECTION_ANALYSIS } from "./guides/03-intersection-analysis";
import { GUIDE_04_VISION_DESTINATIONS_DIRECTIONS } from "./guides/04-vision-destinations-directions";
import { GUIDE_05_STRESS_TESTING } from "./guides/05-stress-testing";
import { GUIDE_06_LEARNING_PLAN } from "./guides/06-learning-plan";
import { GUIDE_07_IMMUNITY_TO_CHANGE } from "./guides/07-immunity-to-change";
import { GUIDE_08_SBNRR_MOOD_METER } from "./guides/08-sbnrr-mood-meter";
import { GUIDE_09_GENERAL_FRAMEWORK_APPLICATION } from "./guides/09-general-framework-application";
import { GUIDE_10_TEAM_SAFETY_ASSESSMENT } from "./guides/10-team-safety-assessment";
import { GUIDE_11_TRUST_DELEGATION } from "./guides/11-trust-delegation";
import { GUIDE_12_PURPOSE_CONNECTION } from "./guides/12-purpose-connection";
import { GUIDE_13_DECISION_MAKING } from "./guides/13-decision-making";
import { GUIDE_14_DISAGREEMENT_INFLUENCE } from "./guides/14-disagreement-influence";
import { GUIDE_15_TEAM_VISION_ACCOUNTABILITY } from "./guides/15-team-vision-accountability";
import { GUIDE_16_SBIA_FEEDBACK_PERFORMANCE } from "./guides/16-sbia-feedback-performance";
import { GUIDE_17_TEAM_RESISTANCE_CHANGE } from "./guides/17-team-resistance-change";
import { GUIDE_18_SUSTAINING_INFLUENCE } from "./guides/18-sustaining-influence";

const GUIDES: Record<string, string> = {
  "01-values-clarification": GUIDE_01_VALUES_CLARIFICATION,
  "02-relationship-assessment": GUIDE_02_RELATIONSHIP_ASSESSMENT,
  "03-intersection-analysis": GUIDE_03_INTERSECTION_ANALYSIS,
  "04-vision-destinations-directions": GUIDE_04_VISION_DESTINATIONS_DIRECTIONS,
  "05-stress-testing": GUIDE_05_STRESS_TESTING,
  "06-learning-plan": GUIDE_06_LEARNING_PLAN,
  "07-immunity-to-change": GUIDE_07_IMMUNITY_TO_CHANGE,
  "08-sbnrr-mood-meter": GUIDE_08_SBNRR_MOOD_METER,
  "09-general-framework-application": GUIDE_09_GENERAL_FRAMEWORK_APPLICATION,
  "10-team-safety-assessment": GUIDE_10_TEAM_SAFETY_ASSESSMENT,
  "11-trust-delegation": GUIDE_11_TRUST_DELEGATION,
  "12-purpose-connection": GUIDE_12_PURPOSE_CONNECTION,
  "13-decision-making": GUIDE_13_DECISION_MAKING,
  "14-disagreement-influence": GUIDE_14_DISAGREEMENT_INFLUENCE,
  "15-team-vision-accountability": GUIDE_15_TEAM_VISION_ACCOUNTABILITY,
  "16-sbia-feedback-performance": GUIDE_16_SBIA_FEEDBACK_PERFORMANCE,
  "17-team-resistance-change": GUIDE_17_TEAM_RESISTANCE_CHANGE,
  "18-sustaining-influence": GUIDE_18_SUSTAINING_INFLUENCE,
};

export function assembleSystemPrompt(guideId?: string): string {
  if (guideId && GUIDES[guideId]) {
    return `${CORE_IDENTITY_PROMPT}\n\n${GUIDES[guideId]}`;
  }
  return CORE_IDENTITY_PROMPT;
}

export function getDefaultGuideId(): string {
  return "01-values-clarification";
}

export function getAvailableGuides(): string[] {
  return Object.keys(GUIDES);
}
