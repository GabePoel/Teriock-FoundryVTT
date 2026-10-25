import { mergeMetadata, mixClasses, objectMap } from "../../../../utils/_module.mjs";
import { commandActivations } from "../../activations/command-activations.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";
import { TriggerAutomationMixin } from "../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @extends {BaseAutomation}
 * @mixes TriggerAutomation
 */
export default class HacksAutomation extends mixClasses(BaseAutomation, TriggerAutomationMixin) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Hacks"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { type: "hacks" });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      hacks: new fields.SetField(
        new fields.StringField({ choices: objectMap(TERIOCK.CONFIG.hack, h => h.part, { localize: true }) }),
        { label: "TERIOCK.COMMON.Hacks" },
      ),
      reverse: new fields.BooleanField(),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["hacks", "reverse", ...super._formPaths];
  }

  /** @inheritDoc */
  get makesOneActivation() {
    return false;
  }

  /** @inheritDoc */
  async _getActivations() {
    if (this.reverse) { return Array.from(this.hacks).map(h =>
        new commandActivations.unhack({ options: { part: h } })
      ); }
    return Array.from(this.hacks).map(h => new commandActivations.hack({ options: { part: h } }));
  }
}
