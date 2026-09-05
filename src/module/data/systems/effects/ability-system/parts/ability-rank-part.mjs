import { makeIcon } from "../../../../../helpers/icon.mjs";

/**
 * Ability rank part.
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, AbilityRankPart>}
 */
export default function AbilityRankPart(Base) {
  /**
   * @mixin
   * @property {TeriockActiveEffect<"ability">} parent
   */
  class AbilityRankPart extends Base {
    /** @inheritDoc */
    get tagIcon() {
      if (this.parent.parent?.type === "rank") {
        if (this.parent.getFlag("teriock", "category") === "combat") {
          return {
            classes: "ability-category-tag-icon",
            icon: TERIOCK.display.icons.manifest.rank.combatAbility,
            tooltip: _loc("TERIOCK.SYSTEMS.Ability.EMBED.combat"),
          };
        } else if (this.parent.getFlag("teriock", "category") === "support") {
          return {
            classes: "ability-category-tag-icon",
            icon: TERIOCK.display.icons.manifest.rank.supportAbility,
            tooltip: _loc("TERIOCK.SYSTEMS.Ability.EMBED.support"),
          };
        }
      }
      return super.tagIcon;
    }

    /** @inheritDoc */
    getEmbedContextMenuEntries(doc) {
      const entries = super.getEmbedContextMenuEntries(doc);
      if (doc?.type === "rank" && doc?.uuid === this.parent.parent?.uuid && doc?.isOwner && doc?.sheet?.isEditable) {
        entries.push({
          group: "edit",
          icon: makeIcon(TERIOCK.display.icons.manifest.rank.combatAbility, "contextMenu"),
          label: _loc("TERIOCK.SYSTEMS.Ability.EMBED.setCombatCategory"),
          visible: this.parent.getFlag("teriock", "category") !== "combat",
          onClick: async () => await this.parent.setFlag("teriock", "category", "combat"),
        });
        entries.push({
          group: "edit",
          icon: makeIcon(TERIOCK.display.icons.manifest.rank.supportAbility, "contextMenu"),
          label: _loc("TERIOCK.SYSTEMS.Ability.EMBED.setSupportCategory"),
          visible: this.parent.getFlag("teriock", "category") !== "support",
          onClick: async () => await this.parent.setFlag("teriock", "category", "support"),
        });
        entries.push({
          group: "edit",
          icon: makeIcon(TERIOCK.display.icons.manifest.ui.unset, "contextMenu"),
          label: _loc("TERIOCK.SYSTEMS.Ability.EMBED.unsetCategory"),
          visible: Boolean(this.parent.getFlag("teriock", "category")),
          onClick: async () => await this.parent.unsetFlag("teriock", "category"),
        });
      }
      return entries;
    }

    /** @inheritDoc */
    getLocalRollData() {
      const data = super.getLocalRollData();
      if (this.parent.parent?.type === "rank") {
        const rank = /** @type {TeriockItem<"rank">} */ this.parent.parent;
        data[`class.${rank.system._source.class}`] = 1;
        data["class.rank"] = rank.system.number;
      }
      return data;
    }
  }

  return AbilityRankPart;
}
