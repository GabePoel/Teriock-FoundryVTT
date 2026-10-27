import { mergeMetadata, mixClasses, objectMap } from "../../../../utils/_module.mjs";
import commandActivations from "../../activations/command-activations.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";
import { TriggerAutomationMixin } from "../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @extends {BaseAutomation}
 * @mixes TriggerAutomation
 */
export default class CommonOutcomesAutomation extends mixClasses(BaseAutomation, TriggerAutomationMixin) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.CommonOutcomes"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { type: "common" });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      common: new fields.SetField(
        new fields.StringField({
          choices: objectMap(TERIOCK.CONFIG.command, e => e.label, {
            localize: true,
            filter: e => e.common,
          }),
        }),
      ),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["common", ...super._formPaths];
  }

  /** @inheritDoc */
  get makesOneActivation() {
    return false;
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
    return Array.from(this.common).filter(c => commandActivations[c]).map(c =>
      new commandActivations[c](foundry.utils.deepClone(activationOptions))
    );
  }
}
