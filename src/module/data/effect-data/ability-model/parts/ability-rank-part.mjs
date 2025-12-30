import { makeIcon } from "../../../../helpers/utils.mjs";

/**
 * Ability rank part.
 * @param {typeof TeriockAbilityModel} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {TeriockAbilityModel}
     * @mixin
     */
    class AbilityRankPart extends Base {
      /** @inheritDoc */
      get tagIcon() {
        if (this.parent.parent?.type === "rank") {
          if (this.parent.getFlag("teriock", "category") === "combat") {
            return {
              icon: "hand-fist",
              tooltip: "Combat",
              classes: "ability-category-tag-icon",
            };
          } else if (this.parent.getFlag("teriock", "category") === "support") {
            return {
              icon: "shield-heart",
              tooltip: "Support",
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
            name: "Set Combat Category",
            icon: makeIcon("hand-fist", "contextMenu"),
            callback: async () =>
              await this.parent.setFlag("teriock", "category", "combat"),
            condition: this.parent.getFlag("teriock", "category") !== "combat",
            group: "edit",
          });
          entries.push({
            name: "Set Support Category",
            icon: makeIcon("shield-heart", "contextMenu"),
            callback: async () =>
              await this.parent.setFlag("teriock", "category", "support"),
            condition: this.parent.getFlag("teriock", "category") !== "support",
            group: "edit",
          });
          entries.push({
            name: "Unset Category",
            icon: makeIcon("delete-left", "contextMenu"),
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
