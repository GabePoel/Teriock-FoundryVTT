import { mergeMetadata, mixClasses, objectMap } from "../../../../utils/_module.mjs";
import { migrateRename } from "../../../fields/tools/migrations.mjs";
import { TakeActivation } from "../../activations/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";
import { TriggerAutomationMixin } from "../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @extends {BaseAutomation}
 * @mixes TriggerAutomation
 */
export default class TakeAutomation extends mixClasses(BaseAutomation, TriggerAutomationMixin) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Take"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { type: "take" });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      amount: new fields.NumberField({ nullable: true, placeholder: _loc("COMMON.Default") }),
      command: new fields.StringField({
        choices: objectMap(TERIOCK.CONFIG.command, i => i.numeric?.take, { localize: true, filter: c => c.numeric }),
        initial: "damage",
        nullable: false,
        required: true,
      }),
      morganti: new fields.BooleanField(),
      options: new fields.ObjectField(),
    });
  }

  /** @inheritDoc */
  static migrateData(source, options) {
    migrateRename(source, "impact", "command");
    return super.migrateData(source, options);
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = ["command", "amount"];
    if (TERIOCK.CONFIG.command[this.command]?.numeric?.morganti) { paths.push("morganti"); }
    paths.push("hr", ...this._triggerDisplayPaths);
    return paths;
  }

  /** @inheritDoc */
  async _getActivations() {
    if (this.command) {
      return [
        new TakeActivation({
          amount: this.amount,
          command: this.command,
          morganti: this.morganti,
          options: this.options,
        }),
      ];
    }
    return [];
  }
}
