import { icons } from "../../../constants/display/icons.mjs";
import { BaseRoll } from "../../../dice/rolls/_module.mjs";
import { FormulaField } from "../../fields/_module.mjs";
import { AddDocumentsActivation } from "../activations/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";

export default class AttunementAutomation extends BaseAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Attunement"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.Attunement.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "attunement";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      tier: new FormulaField({ deterministic: false, initial: "1" }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["tier"];
  }

  /** @inheritDoc */
  async getActivations(options = { rollData: {} }) {
    const rollData = Object.assign(this.getRollData(), options?.rollData ?? {});
    const tier = await BaseRoll.getValue(this.tier, rollData);
    const attunementData = {
      img: this.document.img,
      name: _loc("TERIOCK.SYSTEMS.Attunable.USAGE.Attune.defaultName", {
        name: this.document.name,
      }),
      system: { inheritTier: false, tier, type: "effect" },
      type: "attunement",
    };
    return [
      new AddDocumentsActivation({
        display: {
          icon: icons.attunable.attune,
          label: _loc("TERIOCK.COMMANDS.Status.applyNamed", {
            name: _loc("TYPES.ActiveEffect.attunement"),
          }),
        },
        primary: { root: { data: attunementData } },
      }),
    ];
  }
}
