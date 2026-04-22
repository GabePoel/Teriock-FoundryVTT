import { makeIcon } from "../../../../../helpers/utils.mjs";

/**
 * Ability rank part.
 * @param {typeof AbilitySystem} Base
 */
export default (Base) => {
  return (
    /**
     * @extends {BaseEffectSystem}
     * @mixin
     */
    class AbilityRankPart extends Base {
      /** @inheritDoc */
      get tagIcon() {
        if (this.parent.parent?.type === "rank") {
          if (this.parent.getFlag("teriock", "category") === "combat") {
            return {
              classes: "ability-category-tag-icon",
              icon: TERIOCK.display.icons.rank.combatAbility,
              tooltip: _loc("TERIOCK.SYSTEMS.Ability.EMBED.combat"),
            };
          } else if (this.parent.getFlag("teriock", "category") === "support") {
            return {
              classes: "ability-category-tag-icon",
              icon: TERIOCK.display.icons.rank.supportAbility,
              tooltip: _loc("TERIOCK.SYSTEMS.Ability.EMBED.support"),
            };
          }
        }
        return super.tagIcon;
      }

      /** @inheritDoc */
      getCardContextMenuEntries(doc) {
        const entries = super.getCardContextMenuEntries(doc);
        if (
          doc?.type === "rank" &&
          doc?.uuid === this.parent.parent?.uuid &&
          doc?.isOwner &&
          doc?.sheet?.isEditable
        ) {
          entries.push({
            group: "edit",
            icon: makeIcon(
              TERIOCK.display.icons.rank.combatAbility,
              "contextMenu",
            ),
            label: _loc("TERIOCK.SYSTEMS.Ability.EMBED.setCombatCategory"),
            onClick: async () =>
              await this.parent.setFlag("teriock", "category", "combat"),
            visible: this.parent.getFlag("teriock", "category") !== "combat",
          });
          entries.push({
            group: "edit",
            icon: makeIcon(
              TERIOCK.display.icons.rank.supportAbility,
              "contextMenu",
            ),
            label: _loc("TERIOCK.SYSTEMS.Ability.EMBED.setSupportCategory"),
            onClick: async () =>
              await this.parent.setFlag("teriock", "category", "support"),
            visible: this.parent.getFlag("teriock", "category") !== "support",
          });
          entries.push({
            group: "edit",
            icon: makeIcon(TERIOCK.display.icons.ui.unset, "contextMenu"),
            label: _loc("TERIOCK.SYSTEMS.Ability.EMBED.unsetCategory"),
            onClick: async () =>
              await this.parent.unsetFlag("teriock", "category"),
            visible: !!this.parent.getFlag("teriock", "category"),
          });
        }
        return entries;
      }

      /** @inheritDoc */
      getLocalRollData() {
        const data = super.getLocalRollData();
        if (this.parent.parent?.type === "rank") {
          const rank = /** @type {TeriockRank} */ this.parent.parent;
          data[`class.${rank.system.className.slice(0, 3).toLowerCase()}`] = 1;
          data[`class.${rank.system.className}`] = 1;
          data[`class.rank`] = rank.system.classRank;
        }
        return data;
      }
    }
  );
};
