import { makeIcon } from "../../../../../helpers/utils.mjs";

/**
 * Ability rank part.
 * @param {typeof AbilitySystem} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {AbilitySystem}
     * @mixin
     */
    class AbilityRankPart extends Base {
      /** @inheritDoc */
      get tagIcon() {
        if (this.parent.parent?.type === "rank") {
          if (this.parent.getFlag("teriock", "category") === "combat") {
            return {
              icon: TERIOCK.display.icons.rank.combatAbility,
              tooltip: game.i18n.localize(
                "TERIOCK.SYSTEMS.Ability.EMBED.combat",
              ),
              classes: "ability-category-tag-icon",
            };
          } else if (this.parent.getFlag("teriock", "category") === "support") {
            return {
              icon: TERIOCK.display.icons.rank.supportAbility,
              tooltip: game.i18n.localize(
                "TERIOCK.SYSTEMS.Ability.EMBED.support",
              ),
              classes: "ability-category-tag-icon",
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
            name: game.i18n.localize(
              "TERIOCK.SYSTEMS.Ability.EMBED.setCombatCategory",
            ),
            icon: makeIcon(
              TERIOCK.display.icons.rank.combatAbility,
              "contextMenu",
            ),
            callback: async () =>
              await this.parent.setFlag("teriock", "category", "combat"),
            condition: this.parent.getFlag("teriock", "category") !== "combat",
            group: "edit",
          });
          entries.push({
            name: game.i18n.localize(
              "TERIOCK.SYSTEMS.Ability.EMBED.setSupportCategory",
            ),
            icon: makeIcon(
              TERIOCK.display.icons.rank.supportAbility,
              "contextMenu",
            ),
            callback: async () =>
              await this.parent.setFlag("teriock", "category", "support"),
            condition: this.parent.getFlag("teriock", "category") !== "support",
            group: "edit",
          });
          entries.push({
            name: game.i18n.localize(
              "TERIOCK.SYSTEMS.Ability.EMBED.unsetCategory",
            ),
            icon: makeIcon(TERIOCK.display.icons.ui.unset, "contextMenu"),
            callback: async () =>
              await this.parent.unsetFlag("teriock", "category"),
            condition: !!this.parent.getFlag("teriock", "category"),
            group: "edit",
          });
        }
        return entries;
      }
    }
  );
};
