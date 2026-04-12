import { TeriockItem } from "../../../../../../documents/_module.mjs";
import { getImage } from "../../../../../../helpers/path.mjs";
import { toTitleCase } from "../../../../../../helpers/string.mjs";
import { fromIdentifier, makeIcon } from "../../../../../../helpers/utils.mjs";
import { TextField } from "../../../../../fields/_module.mjs";

const { fields } = foundry.data;

/**
 * Ability equipment part.
 * @param {typeof AbilitySystem} Base
 */
export default (Base) => {
  return (
    /**
     * @extends {BaseEffectSystem}
     * @extends {Teriock.Models.AbilityEquipmentPartData}
     * @mixin
     */
    class AbilityEquipmentPart extends Base {
      /** @inheritDoc */
      static PRESERVED_PROPERTIES = [
        "system.grantOnly",
        ...super.PRESERVED_PROPERTIES,
      ];

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          consumeSource: new fields.BooleanField({ initial: false }),
          consumeSourceText: new TextField({ initial: "" }),
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
          icon: this.parent.isOnUse
            ? TERIOCK.display.icons.ability.onUse
            : TERIOCK.display.icons.ability.notOnUse,
          action: "toggleOnUseDoc",
          tooltip: this.parent.isOnUse
            ? _loc("TERIOCK.SYSTEMS.Ability.USAGE.onlyOnUse")
            : _loc("TERIOCK.SYSTEMS.Ability.USAGE.alwaysActive"),
          condition: this.parent.isOwner,
          callback: async () => {
            const onUseSet = this.parent.parent?.system.onUse;
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
        if (
          ["body", "equipment"].includes(this.parent.elder?.type) &&
          this.parent.isOnUse
        ) {
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
            const op = { keepEmbeddedIds: true, renderSheet: true };
            if (
              doc?.actor?.documentName === "Actor" &&
              doc?.actor?.uuid === this.actor?.uuid
            ) {
              await this.actor.createEmbeddedDocuments("Item", [data], op);
            } else {
              TeriockItem.create(data, op);
            }
          },
          condition:
            this.parent.parent?.isOwner &&
            this.spell &&
            doc !== this.parent &&
            doc.sheet.isEditable,
          group: "control",
          icon: makeIcon(TERIOCK.display.icons.ability.scroll, "contextMenu"),
          name: _loc("TERIOCK.SYSTEMS.Ability.EMBED.makeScroll"),
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
        this.consumeSourceText = this.consumeSource
          ? _loc("TERIOCK.SYSTEMS.Ability.FIELDS.consumeSourceText.derived", {
              uuid: this.parent.parent?.uuid,
            })
          : "";
        this.grantOnlyText = this.grantOnly
          ? _loc("TERIOCK.SYSTEMS.Ability.FIELDS.grantOnlyText.derived", {
              uuid: this.parent.parent?.uuid,
            })
          : "";
      }

      /**
       * Data that represents this ability as a scroll.
       * @param {object} [data] - Optional data to mutate the created scroll.
       * @param {string} [equipmentType="scroll"] - A chosen equipment type to make.
       * @returns {Promise<object>}
       */
      async toScroll(data = {}, equipmentType = "scroll") {
        const reference = (
          await fromIdentifier("equipment:scroll")
        )?.toObject() || {
          type: "equipment",
          system: { equipmentType: "scroll" },
        };
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
        let out = foundry.utils.mergeObject(reference, {
          name: _loc("TERIOCK.SYSTEMS.Ability.DIALOG.MakeScroll.scrollName", {
            name: this.parent.fullName,
          }),
          system: {
            identifier: `scroll-of-${this.parent.forcedIdentifier}`,
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
