import attunementConfig from "../../../../constants/config/attunement-config.mjs";
import { makeIcon } from "../../../../helpers/icon.mjs";
import { dotJoin } from "../../../../helpers/string.mjs";
import { LocalDocumentField } from "../../../fields/_module.mjs";
import CleanedEffectSystem from "../cleaned-effect-system.mjs";

const { fields } = foundry.data;

/**
 * Attunement-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Presence](https://wiki.teriock.com/index.php/Core:Presence)
 */
export default class AttunementSystem extends CleanedEffectSystem {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Attunement"];

  /** @inheritDoc */
  static get Execution() {
    return teriock.executions.document.AttunementExecution;
  }

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, { initialKind: "other", type: "attunement", usable: true });
  }

  /** @inheritDoc */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      inheritTier: new fields.BooleanField({ initial: true }),
      target: new LocalDocumentField(foundry.documents.BaseItem),
      tier: new fields.NumberField({ initial: 0 }),
    });
  }

  /** @inheritDoc */
  static kinds() {
    return attunementConfig.kind;
  }

  /** @inheritDoc */
  get _displayTags() {
    const tags = super._displayTags;
    const usage = this.usage;
    if (usage) { tags.push(usage); }
    return tags;
  }

  /** @inheritDoc */
  get _embedIcons() {
    return [{
      action: "deattuneDoc",
      icon: TERIOCK.display.icons.manifest.attunable.deattune,
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
  get embedParts() {
    const parts = super.embedParts;
    parts.subtitle = _loc("TERIOCK.SYSTEMS.Attunement.PANELS.subtitle", { tier: this.tier || 0 });
    parts.text = dotJoin([this._kindEntry.label, this.usage]);
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
  getEmbedContextMenuEntries(doc) {
    const entries = super.getEmbedContextMenuEntries(doc).filter(e =>
      ![_loc("COMMON.Delete"), _loc("SIDEBAR.Duplicate")].includes(e.label)
    );
    return [...entries, {
      group: "attunement",
      icon: makeIcon(TERIOCK.display.icons.manifest.attunable.deattune, "contextMenu"),
      label: _loc("TERIOCK.SYSTEMS.Attunable.MENU.deattune"),
      onClick: async () => await this.deattune(),
    }];
  }

  /** @inheritDoc */
  getLocalRollData() {
    return Object.assign(super.getLocalRollData(), { target: Number(this.target), tier: this.tier });
  }

  /** @inheritDoc */
  async getPanelParts() {
    const parts = await super.getPanelParts();
    parts.bars = this._withKindBar([{
      icon: TERIOCK.display.icons.manifest.attunable.tier,
      label: _loc("TERIOCK.SYSTEMS.Attunable.FIELDS.tier.raw.label"),
      wrappers: [_loc("TERIOCK.SYSTEMS.Attunable.PANELS.tier", { value: this.tier || 0 })],
    }]);
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
  prepareSpecialData() {
    super.prepareSpecialData();
    if (this.inheritTier && this.target) { this.tier = this.target.system.tier.value; }
  }
}
