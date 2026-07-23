import { TeriockItem } from "../../../../../../documents/_module.mjs";
import { makeIcon } from "../../../../../../helpers/icon.mjs";
import { getImage } from "../../../../../../helpers/path.mjs";
import { fromIdentifier, getName } from "../../../../../../helpers/utils.mjs";
import { initialText } from "../../../../../fields/tools/initializers.mjs";

const { fields } = foundry.data;

/**
 * Ability equipment part.
 * @param {typeof AbilitySystem} Base
 */
export default function AbilityEquipmentPart(Base) {
  return (
    /**
     * @extends {BaseEffectSystem}
     * @extends {Teriock.Models.AbilityEquipmentPartData}
     * @mixin
     */
    class AbilityEquipmentPart extends Base {
      /** @inheritDoc */
      static PRESERVED_PROPERTIES = ["system.grantOnly", "system.grantUse", ...super.PRESERVED_PROPERTIES];

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          consumeSource: new fields.BooleanField(),
          consumeSourceText: initialText(),
          grantOnly: new fields.BooleanField(),
          grantOnlyText: initialText(),
          grantUse: new fields.BooleanField(),
          grantUseText: initialText(),
        });
      }

      /**
       * On use icon (when ability is granted by equipment and can be toggled to activate only on use).
       * @returns {Teriock.EmbedData.EmbedIcon}
       */
      get grantUseIcon() {
        return {
          action: "toggleGrantUseDoc",
          icon: this.grantUse ? TERIOCK.display.icons.ability.onUse : TERIOCK.display.icons.ability.notOnUse,
          tooltip: this.grantUse
            ? _loc("TERIOCK.SYSTEMS.Ability.USAGE.onlyOnUse")
            : _loc("TERIOCK.SYSTEMS.Ability.USAGE.alwaysActive"),
          visible: this.parent.isOwner && this.isArmamentChild,
          onClick: async (_ev, doc) => {
            if (doc === this.parent.parent) { await this.parent.update({ "system.grantUse": !this.grantUse }); }
          },
        };
      }

      /**
       * Whether this is on an armament.
       * @returns {boolean}
       */
      get isArmamentChild() {
        return ["body", "equipment"].includes(this.parent.parent?.type);
      }

      /** @inheritDoc */
      get isReference() {
        return this.grantUse || super.isReference;
      }

      /** @inheritDoc */
      get tagIcon() {
        if (this.isArmamentChild && this.grantUse) { return this.grantUseIcon; }
        return super.tagIcon;
      }

      /** @inheritDoc */
      getCardContextMenuEntries(doc) {
        const entries = super.getCardContextMenuEntries(doc);
        entries.push({
          group: "control",
          icon: makeIcon(TERIOCK.display.icons.ability.scroll, "contextMenu"),
          label: _loc("TERIOCK.SYSTEMS.Ability.EMBED.makeScroll"),
          visible: Boolean(
            this.parent.parent?.isOwner && this.spell && doc !== this.parent
              && (!doc?.actor || doc?.actor?.sheet?.isEditable),
          ),
          onClick: async () => {
            const data = await this.toScroll();
            const op = { keepEmbeddedIds: true, renderSheet: true };
            if (doc?.actor?.documentName === "Actor" && doc?.actor?.uuid === this.actor?.uuid) {
              this.actor.createEmbeddedDocuments("Item", [data], op);
              if (this.actor.sheet?.rendered) {
                this.actor.sheet.changeTab("inventory", "primary");
              }
            } else {
              TeriockItem.create(data, op);
              ui.items?.activate();
            }
          },
        });
        return entries;
      }

      /** @inheritDoc */
      getLocalRollData() {
        return Object.assign(super.getLocalRollData(), {
          grantOnly: Number(this.grantOnly),
          grantUse: Number(this.grantUse),
        });
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        this.consumeSourceText = this.consumeSource
          ? _loc(`TERIOCK.SYSTEMS.Ability.FIELDS.consumeSourceText.${this.parent.parent ? "derived" : "noParent"}`, {
            uuid: this.parent.parent?.uuid,
          })
          : "";
        this.grantOnlyText = this.isArmamentChild && this.grantOnly
          ? _loc("TERIOCK.SYSTEMS.Ability.FIELDS.grantOnlyText.derived", { uuid: this.parent.parent?.uuid })
          : "";
        this.grantUseText = this.isArmamentChild && this.grantUse
          ? _loc("TERIOCK.SYSTEMS.Ability.FIELDS.grantUseText.derived", { uuid: this.parent.parent?.uuid })
          : "";
      }

      /**
       * Data that represents this ability as a scroll.
       * @param {object} [data] - Optional data to mutate the created scroll.
       * @param {Identifier} [equipmentType="scroll"] - A chosen equipment type to make.
       * @returns {Promise<object>}
       */
      async toScroll(data = {}, equipmentType = "scroll") {
        const reference = (await fromIdentifier(`equipment:${equipmentType}`))?.toObject(true)
          || { system: { equipmentType }, type: "equipment" };
        let img;
        if (equipmentType.titleCase() === "Scroll") {
          if (this.elements.size === 1) {
            img = getImage("consumables", `${this.elements.first().titleCase()} Spell Scroll`);
          } else { img = getImage("consumables", "Celestial Spell Scroll"); }
        }
        let out = foundry.utils.mergeObject(reference, {
          name: _loc("TERIOCK.SYSTEMS.Ability.DIALOG.MakeScroll.name", {
            spell: this.parent.fullName,
            type: getName(`equipment:${equipmentType}`),
          }),
          system: {
            _src: this.parent.uuid,
            consumable: true,
            description: _loc("TERIOCK.SYSTEMS.Ability.DIALOG.MakeScroll.description", { id: this.parent.id }),
            identifier: `${equipmentType}-of-${this.parent.forcedIdentifier}`,
            needsAttunement: false,
            powerLevel: "enchanted",
            quantity: 1,
          },
        });
        if (img) { out.img = img; }
        out = foundry.utils.mergeObject(out, data);
        const effects = await this.parent.toObjects();
        if (effects.length) {
          const root = effects.find((e) => e._id === this.parent.id);
          if (root) { root.system.grantUse = true; }
        }
        if (!out.effects) { out.effects = []; }
        out.effects.push(...effects);
        return out;
      }
    }
  );
}
