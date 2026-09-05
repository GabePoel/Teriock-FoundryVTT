import { mixClasses } from "../../../../helpers/construction.mjs";
import * as activations from "../../activations/command-activations.mjs";
import { CritMechanicMixin } from "../../mixins/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";
import * as automationMixins from "../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @mixes CritMechanic
 * @mixes TriggerAutomation
 */
export default class CommonOutcomesAutomation
  extends mixClasses(CritMechanicMixin(BaseAutomation), automationMixins.TriggerAutomationMixin)
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.CommonOutcomes"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.CommonOutcomes.LABEL";
  }

  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { type: "common" });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      common: new fields.SetField(new fields.StringField({ choices: TERIOCK.config.consequence.common })),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["common", ...super._formPaths];
  }

  /** @inheritDoc */
  async _getActivations(options) {
    const activationOptions = {};
    if (options?.execution?.armament?.uuid && options?.execution?.actor?.uuid) {
      const armamentUuid = foundry.utils.buildRelativeUuid(options.execution.armament, options.execution.actor);
      foundry.utils.setProperty(activationOptions, "options.armament", armamentUuid);
      if (options?.execution?.ammunition?.uuid) {
        const ammunitionUuid = foundry.utils.buildRelativeUuid(options.execution.ammunition, options.execution.actor);
        foundry.utils.setProperty(activationOptions, "options.ammunition", ammunitionUuid);
      }
    }
    const activationClasses = Object.values(activations);
    return Array.from(this.common).filter(Boolean).map(c => {
      const Act = activationClasses.find(A => A.metadata.type === c);
      if (Act) { return new Act(foundry.utils.deepClone(activationOptions)); }
    }).filter(Boolean);
  }
}
