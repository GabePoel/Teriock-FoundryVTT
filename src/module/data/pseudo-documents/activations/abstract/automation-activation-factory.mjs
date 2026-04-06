import BaseActivation from "./base-activation.mjs";

/**
 *
 * @param {typeof BaseAutomation} Automation
 * @returns {typeof BaseActivation}
 */
export default function AutomationActivationFactory(Automation) {
  class AutomationActivation extends BaseActivation {
    /** @inheritDoc */
    static get LABEL() {
      return Automation.LABEL;
    }

    /** @inheritDoc */
    static get TYPE() {
      return Automation.TYPE;
    }

    /** @inheritDoc */
    static defineSchema() {
      const automationSchema = Automation.defineSchema();
      delete automationSchema.crit;
      delete automationSchema.competencies;
      delete automationSchema.heighten;
      delete automationSchema.display;
      return Object.assign(super.defineSchema(), automationSchema);
    }
  }

  return AutomationActivation;
}
