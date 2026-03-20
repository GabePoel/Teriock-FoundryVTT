import { BaseRoll } from "../../../dice/rolls/_module.mjs";
import { ApplyEffectHandler } from "../../../helpers/interaction/button-handlers/apply-effect-handlers.mjs";
import { FormulaField } from "../../fields/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";

export default class AttunementAutomation extends BaseAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.SYSTEMS.Attunement",
  ];

  /** @inheritDoc */
  static get LABEL() {
    return "TYPES.ActiveEffect.attunement";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "attunement";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      tier: new FormulaField({
        deterministic: false,
        initial: "1",
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["tier"];
  }

  /** @inheritDoc */
  async getButtons(options = { rollData: {} }) {
    const rollData = Object.assign(this.getRollData(), options?.rollData ?? {});
    const tier = await BaseRoll.getValue(this.tier, rollData);
    const attunementData = {
      img: this.document.img,
      name: game.i18n.format(
        "TERIOCK.SYSTEMS.Attunable.USAGE.Attune.defaultName",
        { name: this.document.name },
      ),
      system: { inheritTier: false, tier, type: "effect" },
      type: "attunement",
    };
    return [
      ApplyEffectHandler.buildButton(attunementData, {
        label: game.i18n.format("TERIOCK.COMMANDS.Status.applyNamed", {
          name: game.i18n.localize("TYPES.ActiveEffect.attunement"),
        }),
      }),
    ];
  }
}
