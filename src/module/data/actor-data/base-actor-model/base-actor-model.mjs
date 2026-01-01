import { dotJoin, prefix } from "../../../helpers/string.mjs";
import { makeIcon, mix } from "../../../helpers/utils.mjs";
import { CommonTypeModel } from "../../models/_module.mjs";
import * as parts from "./parts/_module.mjs";

//noinspection JSClosureCompilerSyntax
/**
 * Base {@link TeriockActor} data model.
 * @implements {Teriock.Models.TeriockBaseActorModelInterface}
 * @mixes CommonTypeModel
 * @mixes ActorAttributesPart
 * @mixes ActorAutomationPart
 * @mixes ActorCapacitiesPart
 * @mixes ActorCombatPart
 * @mixes ActorConditionTogglingPart
 * @mixes ActorCoverPart
 * @mixes ActorDeathBagPart
 * @mixes ActorDisplayPart
 * @mixes ActorHacksPart
 * @mixes ActorLimitsPart
 * @mixes ActorMoneyPart
 * @mixes ActorMovementPart
 * @mixes ActorProtectionsPart
 * @mixes ActorRollableTakesPart
 * @mixes ActorScalingPart
 * @mixes ActorSensesPart
 * @mixes ActorStatsPart
 * @mixes ActorTradecraftsPart
 * @mixes ActorTransformationPart
 */
export default class TeriockBaseActorModel extends mix(
  CommonTypeModel,
  parts.ActorStatsPart,
  parts.ActorAutomationPart,
  parts.ActorScalingPart,
  parts.ActorHacksPart,
  parts.ActorCombatPart,
  parts.ActorCoverPart,
  parts.ActorRollableTakesPart,
  parts.ActorConditionTogglingPart,
  parts.ActorTradecraftsPart,
  parts.ActorAttributesPart,
  parts.ActorCapacitiesPart,
  parts.ActorTransformationPart,
  parts.ActorDeathBagPart,
  parts.ActorDisplayPart,
  parts.ActorLimitsPart,
  parts.ActorMoneyPart,
  parts.ActorMovementPart,
  parts.ActorSensesPart,
  parts.ActorProtectionsPart,
) {
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      childEffectTypes: [
        "ability",
        "attunement",
        "base",
        "condition",
        "consequence",
        "fluency",
        "resource",
      ],
      childItemTypes: [
        "body",
        "equipment",
        "power",
        "rank",
        "species",
        "mount",
      ],
      childMacroTypes: [],
      visibleTypes: ["power", "rank", "species"],
    });
  }

  /** @inheritDoc */
  get displayToggles() {
    return [...super.displayToggles, "disabled"];
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.subtitle = this.metadata.type;
    parts.text = dotJoin([
      prefix(this.scaling.lvl, "LVL"),
      prefix(this.scaling.br, "BR"),
      prefix(this.size.number.value, "Size"),
    ]);
    parts.makeTooltip = this.parent.isViewer;
    return parts;
  }

  /** @inheritDoc */
  get panelParts() {
    const parts = super.panelParts;
    parts.blocks = [
      {
        title: "Notes",
        text: this.notes,
      },
    ];
    return parts;
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    if ((await super._preCreate(data, options, user)) === false) {
      return false;
    }
    this.parent.updateSource({
      prototypeToken: {
        bar1: {
          attribute: "hp",
        },
        bar2: {
          attribute: "mp",
        },
        displayBars: 20,
        ring: {
          enabled: true,
        },
      },
    });
  }

  /** @inheritDoc */
  getCardContextMenuEntries(doc) {
    return [
      {
        name: "Open Token",
        icon: makeIcon("user-circle", "contextMenu"),
        condition: () => this.parent.token && this.parent.token.isViewer,
        callback: async () => this.parent.token.sheet.render(true),
      },
      ...super.getCardContextMenuEntries(doc),
    ];
  }

  /** @inheritDoc */
  getRollData() {
    const rollData = super.getRollData();
    foundry.utils.deleteProperty(rollData, "Actor");
    foundry.utils.deleteProperty(rollData, this.parent.type);
    return rollData;
  }

  /**
   * Performs post-update operations for the actor.
   * @returns {Promise<void>}
   */
  async postUpdate() {
    await Promise.all([
      ...this.parent.conditionExpirationEffects.map((e) =>
        e.system.checkExpiration(),
      ),
      ...this.parent.getDependentTokens().map((t) => t.postActorUpdate()),
    ]);
  }
}
