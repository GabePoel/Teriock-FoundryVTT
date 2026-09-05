import { ConstructionNode } from "../../_module.mjs";
import { icons } from "../../../../constants/display/_module.mjs";
import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { FormulaField } from "../../../fields/_module.mjs";
import { AddDocumentsActivation } from "../../activations/_module.mjs";
import { CritMechanicMixin } from "../../mixins/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";
import * as automationMixins from "../mixins/_module.mjs";

/**
 * @mixes CritMechanic
 * @mixes TriggerAutomation
 */
export default class AttunementAutomation
  extends mixClasses(BaseAutomation, CritMechanicMixin, automationMixins.TriggerAutomationMixin)
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Attunement"];

  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { type: "attunement" });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      tier: new FormulaField({ deterministic: false, initial: "1", placeholder: "0" }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["tier", ...super._formPaths];
  }

  /** @inheritDoc */
  async _getActivations(options = { rollData: {} }) {
    const rollData = Object.assign(this.getRollData(), options?.rollData ?? {});
    const tier = await BaseRoll.getValue(this.tier, rollData);
    const attunementData = {
      img: this.document.img,
      name: _loc("TERIOCK.SYSTEMS.Attunable.USAGE.Attune.defaultName", { name: this.document.name }),
      system: { inheritTier: false, origin: "effect", tier },
      type: "attunement",
    };
    return [
      new AddDocumentsActivation({
        constructionNodes: ConstructionNode.toCollectionObject([{
          data: JSON.stringify(attunementData),
          overrideData: true,
        }]),
        display: {
          icon: icons.manifest.attunable.attune,
          label: _loc("TERIOCK.COMMANDS.Status.applyNamed", { name: _loc("TYPES.ActiveEffect.attunement") }),
        },
      }),
    ];
  }
}
