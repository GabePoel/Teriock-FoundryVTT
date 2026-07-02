import attunementConfig from "../../../../constants/config/attunement-config.mjs";
import { AttunementExecution } from "../../../../executions/child-executions/_module.mjs";
import { makeIcon } from "../../../../helpers/icon.mjs";
import { localizeChoices } from "../../../../helpers/localization.mjs";
import { dotJoin, toCamelCase } from "../../../../helpers/string.mjs";
import { objectMap } from "../../../../helpers/utils.mjs";
import { LocalDocumentField } from "../../../fields/_module.mjs";
import CleanedEffectSystem from "../cleaned-effect-system.mjs";

const { fields } = foundry.data;

/**
 * Attunement-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Presence](https://wiki.teriock.com/index.php/Core:Presence)
 *
 * @extends {Teriock.Models.AttunementSystemData}
 */
export default class AttunementSystem extends CleanedEffectSystem {
  /** @inheritDoc */
  static Execution = AttunementExecution;

  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Attunement"];

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, { type: "attunement", usable: true });
  }

  /** @inheritDoc */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      inheritTier: new fields.BooleanField({ initial: true }),
      target: new LocalDocumentField(foundry.documents.BaseItem),
      tier: new fields.NumberField({ initial: 0, label: "TERIOCK.SYSTEMS.Attunable.FIELDS.tier.raw.label" }),
      type: new fields.StringField({
        choices: localizeChoices(objectMap(attunementConfig.type, v => v.label)),
        initial: "effect",
      }),
    });
  }

  /** @inheritDoc */
  get _embedIcons() {
    return [{
      action: "deattuneDoc",
      icon: TERIOCK.display.icons.attunable.deattune,
      tooltip: _loc("TERIOCK.SYSTEMS.Attunable.MENU.deattune"),
      visible: this.parent.isOwner,
      onClick: async () => await this.deattune(),
    }, ...super._embedIcons];
  }

  /** @inheritDoc */
  get _panelBlocks() {
    return [];
  }

  /** @inheritDoc */
  get color() {
    return this.target ? TERIOCK.display.colors.palette.green : TERIOCK.display.colors.palette.orange;
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.subtitle = _loc("TERIOCK.SYSTEMS.Attunement.PANELS.subtitle", { tier: this.tier || 0 });
    parts.text = dotJoin([attunementConfig.type[this.type].label, this.usage]);
    return parts;
  }

  /**
   * Gets the usage status of the attunement target.
   * @returns {string} The usage status.
   */
  get usage() {
    if (this.target) {
      if (this.target.type === "equipment") {
        if (this.target.system.equipped) { return _loc("TERIOCK.SYSTEMS.Equipment.EMBED.equipped"); }
        return _loc("TERIOCK.SYSTEMS.Equipment.EMBED.unequipped");
      } else if (this.target.type === "mount") {
        if (this.target.system.mounted) { return _loc("TERIOCK.SYSTEMS.Mount.EMBED.mounted"); }
        return _loc("TERIOCK.SYSTEMS.Mount.EMBED.unmounted");
      }
      return _loc("TERIOCK.SYSTEMS.Attunement.USAGE.attuned");
    } else if (this._source.target) { return _loc("TERIOCK.SYSTEMS.Attunement.USAGE.missing"); }
    return "";
  }

  /**
   * Removes attunement.
   * @returns {Promise<void>}
   */
  async deattune() {
    await this.parent.delete();
  }

  /** @inheritDoc */
  getCardContextMenuEntries(doc) {
    const entries = super.getCardContextMenuEntries(doc).filter(e =>
      ![_loc("COMMON.Delete"), _loc("SIDEBAR.Duplicate")].includes(e.label)
    );
    return [...entries, {
      group: "attunement",
      icon: makeIcon(TERIOCK.display.icons.attunable.deattune, "contextMenu"),
      label: _loc("TERIOCK.SYSTEMS.Attunable.MENU.deattune"),
      onClick: async () => await this.deattune(),
    }];
  }

  /** @inheritDoc */
  getLocalRollData() {
    return {
      ...super.getLocalRollData(),
      [`type.${toCamelCase(this.type)}`]: 1,
      target: this.target ? 1 : 0,
      tier: this.tier,
    };
  }

  /** @inheritDoc */
  async getPanelParts() {
    const parts = await super.getPanelParts();
    parts.bars = [{
      icon: TERIOCK.display.icons.attunable.tier,
      label: _loc("TERIOCK.SYSTEMS.Attunable.FIELDS.tier.raw.label"),
      wrappers: [
        attunementConfig.type[this.type].label,
        _loc("TERIOCK.SYSTEMS.Attunable.PANELS.tier", { value: this.tier || 0 }),
      ],
    }];
    if (this.target) {
      parts.associations = [{
        cards: [{
          color: this.target.system.color,
          img: this.target.img,
          makeTooltip: true,
          name: this.target.fullName,
          type: this.target.type,
          uuid: this.target.uuid,
        }],
        icon: TERIOCK.config.document.attunement.icon,
        title: _loc("TERIOCK.SYSTEMS.Attunement.PANELS.for"),
      }];
    }
    return parts;
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    if (this.inheritTier && this.target) { this.tier = this.target.system.tier.currentValue; }
    this.changes.push({ key: "system.presence.value", phase: "initial", priority: 10, type: "add", value: this.tier });
  }
}
