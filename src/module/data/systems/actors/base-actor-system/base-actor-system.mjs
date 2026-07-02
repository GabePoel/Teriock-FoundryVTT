import { mixClasses } from "../../../../helpers/construction.mjs";
import { makeIcon } from "../../../../helpers/icon.mjs";
import { dotJoin } from "../../../../helpers/string.mjs";
import { ActorSettingsModel } from "../../../models/settings-models/_module.mjs";
import { StatusExpiration } from "../../../pseudo-documents/expirations/_module.mjs";
import { BaseExpiration } from "../../../pseudo-documents/expirations/abstract/_module.mjs";
import AbstractActorSystem from "./abstract-actor-system.mjs";
import * as parts from "./parts/_module.mjs";

const { fields } = foundry.data;

/**
 * Base {@link TeriockActor} data model.
 * @extends {AbstractActorSystem}
 * @extends {Teriock.Models.BaseActorSystemData}
 * @mixes CommonSystem
 * @mixes ActorAttributesPart
 * @mixes ActorAutomationPart
 * @mixes ActorCapacitiesPart
 * @mixes ActorCombatPart
 * @mixes ActorConditionsPart
 * @mixes ActorCoverPart
 * @mixes ActorDeathBagPart
 * @mixes ActorHacksPart
 * @mixes ActorInformationPart
 * @mixes ActorLimitsPart
 * @mixes ActorMoneyPart
 * @mixes ActorMovementPart
 * @mixes ActorProtectionsPart
 * @mixes ActorRestingPart
 * @mixes ActorImpactsPart
 * @mixes ActorScalingPart
 * @mixes ActorSensesPart
 * @mixes ActorStatsPart
 * @mixes ActorTradecraftsPart
 * @mixes ActorTransformationPart
 */
export default class BaseActorSystem
  extends mixClasses(
    AbstractActorSystem,
    parts.ActorStatsPart,
    parts.ActorConditionsPart,
    parts.ActorAutomationPart,
    parts.ActorScalingPart,
    parts.ActorHacksPart,
    parts.ActorCombatPart,
    parts.ActorCoverPart,
    parts.ActorRollableTakesPart,
    parts.ActorTradecraftsPart,
    parts.ActorAttributesPart,
    parts.ActorCapacitiesPart,
    parts.ActorTransformationPart,
    parts.ActorDeathBagPart,
    parts.ActorInformationPart,
    parts.ActorLimitsPart,
    parts.ActorMoneyPart,
    parts.ActorMovementPart,
    parts.ActorSensesPart,
    parts.ActorProtectionsPart,
    parts.ActorRestingPart,
    parts.ActorTokenPart,
  )
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.BaseActor"];

  /** @inheritDoc */
  static PRESERVED_PROPERTIES = ["effects", "items", ...super.PRESERVED_PROPERTIES];

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      childEffectTypes: ["attunement", "base", "condition", "consequence", "cover", "fluency", "hack", "resource"],
      childItemTypes: ["archetype", "body", "equipment", "mount", "power", "rank", "species"],
      visibleTypes: ["power", "rank", "species"],
    });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), { settings: new fields.EmbeddedDataField(ActorSettingsModel) });
  }

  /**
   * Labeled tags that represent this actor's attributes.
   * @returns {string[]}
   */
  get _attributeTags() {
    return Object.entries(TERIOCK.config.attribute).map(([k, v]) => `${this.attributes[k].score} ${v.abbreviation}`);
  }

  /** @inheritDoc */
  get _displayToggles() {
    return [...super._displayToggles, "disabled"];
  }

  /**
   * Labeled tags that represent how this scales.
   * @returns {string[]}
   */
  get _scalingTags() {
    return [
      _loc("TERIOCK.SHEETS.Actor.SIDEBAR.Scaling.scaled.lvl", { number: this.scaling.lvl }),
      _loc("TERIOCK.SHEETS.Actor.SIDEBAR.Scaling.scaled.br", { number: this.scaling.br }),
      _loc("TERIOCK.SHEETS.Actor.SIDEBAR.Scaling.scaled.size", { number: this.size.number }),
    ];
  }

  /** @inheritDoc */
  get embedParts() {
    return Object.assign(super.embedParts, {
      makeTooltip: this.parent.isViewer,
      subtitle: TERIOCK.config.document[this.parent.type]?.label,
      text: dotJoin(this._scalingTags),
    });
  }

  /** @inheritDoc */
  getCardContextMenuEntries(doc) {
    return [
      {
        icon: makeIcon(TERIOCK.display.icons.document.token, "contextMenu"),
        label: _loc("TERIOCK.SYSTEMS.BaseActor.MENU.openToken"),
        onClick: async () => this.parent.token.sheet.render(true),
        visible: () => this.parent.token && this.parent.token.isViewer,
      },
      ...super.getCardContextMenuEntries(doc),
      this._getPanelCardContextMenuEntry(),
    ];
  }

  /** @inheritDoc */
  async getPanelParts() {
    return Object.assign(await super.getPanelParts(), {
      bars: [{
        icon: TERIOCK.display.icons.ui.info,
        label: _loc("TERIOCK.SYSTEMS.Ability.PANELS.info"),
        wrappers: this._scalingTags,
      }, {
        icon: TERIOCK.display.icons.interaction.feat,
        label: _loc("TERIOCK.TERMS.Common.attributes"),
        wrappers: this._attributeTags,
      }],
      blocks: [{ text: this.notes, title: _loc("TERIOCK.SYSTEMS.BaseActor.PANELS.notes") }],
    });
  }

  /** @inheritDoc */
  getSystemRollData() {
    return this.getLocalRollData();
  }

  /**
   * Performs post-update operations for the actor.
   * @returns {Promise<void>}
   */
  async postUpdate() {
    await Promise.all([...this.parent.getDependentTokens().map(t => t.postActorUpdate())]);
    await BaseExpiration.massExpire([this.parent], StatusExpiration.TYPE, {}, true);
  }
}
