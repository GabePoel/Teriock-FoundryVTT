import { copyItem } from "../../../../../../helpers/fetch.mjs";
import { getImage } from "../../../../../../helpers/path.mjs";
import { toTitleCase } from "../../../../../../helpers/string.mjs";
import { makeIcon } from "../../../../../../helpers/utils.mjs";
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
            ? game.i18n.localize("TERIOCK.SYSTEMS.Ability.USAGE.onlyOnUse")
            : game.i18n.localize("TERIOCK.SYSTEMS.Ability.USAGE.alwaysActive"),
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
      getCardContextMenuEntries(doc) {
        const entries = super.getCardContextMenuEntries(doc);
        entries.push({
          callback: async () => {
            const data = await this.toScroll();
            if (
              doc?.actor?.documentName === "Actor" &&
              doc?.actor?.uuid === this.actor?.uuid
            ) {
              await this.actor.createEmbeddedDocuments("Item", [data], {
                keepEmbeddedIds: true,
              });
            } else {
              game.teriock.Item.create(data, { keepEmbeddedIds: true });
            }
          },
          condition: this.parent.parent?.isOwner && this.spell,
          group: "control",
          icon: makeIcon(TERIOCK.display.icons.ability.scroll, "contextMenu"),
          name: game.i18n.localize("TERIOCK.SYSTEMS.Ability.EMBED.makeScroll"),
        });
        return entries;
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
          ? game.i18n.format(
              "TERIOCK.SYSTEMS.Ability.FIELDS.grantOnlyText.derived",
              {
                uuid: this.parent.parent?.uuid,
              },
            )
          : "";
      }

      /**
       * Data that represents this ability as a scroll.
       * @param {object} [data] - Optional data to mutate the created scroll.
       * @param {string} [equipmentType="scroll"] - A chosen equipment type to make.
       * @returns {Promise<Object>}
       */
      async toScroll(data = {}, equipmentType = "scroll") {
        const reference = await copyItem(
          TERIOCK.index.equipment[equipmentType] || equipmentType || "Scroll",
          "equipment",
        );
        let img;
        if (toTitleCase(equipmentType) === "Scroll") {
          if (this.elements.size === 1) {
            img = getImage(
              "consumables",
              toTitleCase(Array.from(this.elements)[0]) + " Spell Scroll",
            );
          } else {
            img = getImage("consumables", "Celestial Spell Scroll");
          }
        }
        let out = foundry.utils.mergeObject(reference.toObject(true), {
          name: game.i18n.format(
            "TERIOCK.SYSTEMS.Ability.DIALOG.MakeScroll.scrollName",
            { name: this.parent.nameString },
          ),
          system: {
            consumable: true,
            onUse: [this.parent.id],
            powerLevel: "enchanted",
            quantity: 1,
          },
        });
        if (img) out.img = img;
        out = foundry.utils.mergeObject(out, data);
        if (!out.effects) out.effects = [];
        out.effects.push(this.parent.toObject(true));
        return out;
      }
    }
  );
};
