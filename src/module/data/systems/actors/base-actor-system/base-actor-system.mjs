import { dotJoin } from "../../../../helpers/string.mjs";
import { makeIcon, mix } from "../../../../helpers/utils.mjs";
import { ActorSettingsModel } from "../../../models/settings-models/_module.mjs";
import { CommonSystem } from "../../abstract/_module.mjs";
import * as parts from "./parts/_module.mjs";

//noinspection JSClosureCompilerSyntax
/**
 * Base {@link TeriockActor} data model.
 * @implements {Teriock.Models.BaseActorSystemInterface}
 * @mixes CommonSystem
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
 * @mixes ActorRestingPart
 * @mixes ActorRollableTakesPart
 * @mixes ActorScalingPart
 * @mixes ActorSensesPart
 * @mixes ActorStatsPart
 * @mixes ActorTradecraftsPart
 * @mixes ActorTransformationPart
 */
export default class BaseActorSystem extends mix(
  CommonSystem,
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
  parts.ActorRestingPart,
) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.SYSTEMS.BaseActor",
  ];

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
  get _settingsFlagsDataModel() {
    return ActorSettingsModel;
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
      game.i18n.format("TERIOCK.SHEETS.Actor.SIDEBAR.Scaling.scaled.lvl", {
        number: this.scaling.lvl,
      }),
      game.i18n.format("TERIOCK.SHEETS.Actor.SIDEBAR.Scaling.scaled.br", {
        number: this.scaling.br,
      }),
      game.i18n.format("TERIOCK.SHEETS.Actor.SIDEBAR.Scaling.scaled.size", {
        number: this.size.number.value,
      }),
    ]);
    parts.makeTooltip = this.parent.isViewer;
    return parts;
  }

  /** @inheritDoc */
  get panelParts() {
    const parts = super.panelParts;
    parts.blocks = [
      {
        title: game.i18n.localize("TERIOCK.SYSTEMS.BaseActor.PANELS.notes"),
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
        name: game.i18n.localize("TERIOCK.SYSTEMS.BaseActor.MENU.openToken"),
        icon: makeIcon(TERIOCK.display.icons.document.token, "contextMenu"),
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
    const conditionExpirationEffects = this.parent.consequences.filter(
      (c) =>
        c.system.expirations.conditions.present.size +
          c.system.expirations.conditions.absent.size >
        0,
    );
    const shouldExpire = conditionExpirationEffects.filter((c) =>
      c.system.shouldExpireFromConditions(),
    );
    await this.parent.deleteEmbeddedDocuments(
      "ActiveEffect",
      shouldExpire.map((c) => c.id),
    );
    await Promise.all([
      ...this.parent.getDependentTokens().map((t) => t.postActorUpdate()),
    ]);
  }
}
