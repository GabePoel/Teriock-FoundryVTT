import { TextField } from "../../../../../fields/_module.mjs";

const { fields } = foundry.data;

/**
 * Ability equipment part.
 * @param {typeof AbilitySystem} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {AbilitySystem}
     * @implements {Teriock.Models.AbilityEquipmentPartInterface}
     * @mixin
     */
    class AbilityEquipmentPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          grantOnly: new fields.BooleanField({ initial: false }),
          grantOnlyText: new TextField({ initial: "" }),
        });
      }

      /**
       * On use icon (when ability is granted by equipment and can be toggled to activate only on use).
       * @returns {Teriock.EmbedData.EmbedIcon}
       */
      get onUseIcon() {
        return {
          icon: this.parent.isOnUse ? "bolt" : "bolt-slash",
          action: "toggleOnUseDoc",
          tooltip: this.parent.isOnUse
            ? "Activates Only on Use"
            : "Always Active",
          condition: this.parent.isOwner,
          callback: async () => {
            const onUseSet = this.parent.parent.system.onUse;
            if (onUseSet.has(this.parent.id)) {
              onUseSet.delete(this.parent.id);
            } else {
              onUseSet.add(this.parent.id);
            }
            await this.parent.parent.update({
              "system.onUse": Array.from(onUseSet),
            });
          },
        };
      }

      /** @inheritDoc */
      get tagIcon() {
        if (this.parent.elder?.type === "equipment" && this.parent.isOnUse) {
          return this.onUseIcon;
        }
        return super.tagIcon;
      }

      /** @inheritDoc */
      getLocalRollData() {
        return Object.assign(super.getLocalRollData(), {
          grantOnly: Number(this.grantOnly),
        });
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        this.grantOnlyText = this.grantOnly
          ? `This ability can only be used with @UUID[${this.parent.parent.uuid}].`
          : "";
      }
    }
  );
};
