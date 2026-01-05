import { getProperty } from "../../../../../helpers/fetch.mjs";
import { makeIcon } from "../../../../../helpers/utils.mjs";

const { fields } = foundry.data;

/**
 * Equipment data model mixin that handles shattering and dampening.
 * @param {typeof TeriockEquipmentModel} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {TeriockEquipmentModel}
     * @implements {EquipmentSuppressionPartInterface}
     * @mixin
     */
    class EquipmentSuppressionPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        const schema = super.defineSchema();
        Object.assign(schema, {
          dampened: new fields.BooleanField({
            initial: false,
            label: "Dampened",
          }),
          shattered: new fields.BooleanField({
            initial: false,
            label: "Shattered",
          }),
        });
        return schema;
      }

      /** @inheritDoc */
      get embedIcons() {
        return [
          super.embedIcons.find((i) =>
            i.action?.toLowerCase().includes("attuned"),
          ),
          {
            icon: this.dampened ? "bell-slash" : "bell",
            action: "toggleDampenedDoc",
            tooltip: this.dampened ? "Dampened" : "Undampened",
            condition: this.parent.isOwner,
            callback: async () => {
              if (this.dampened) {
                await this.undampen();
              } else {
                await this.dampen();
              }
            },
          },
          {
            icon: this.shattered ? "wine-glass-crack" : "wine-glass",
            action: "toggleShatteredDoc",
            tooltip: this.shattered ? "Shattered" : "Shattered",
            condition: this.parent.isOwner,
            callback: async () => {
              if (this.shattered) {
                await this.repair();
              } else {
                await this.shatter();
              }
            },
          },
          ...super.embedIcons.filter(
            (i) => !i.action?.toLowerCase().includes("attuned"),
          ),
        ];
      }

      /** @inheritDoc */
      get makeSuppressed() {
        let suppressed = super.makeSuppressed || !this.equipped;
        if (this.actor && this.actor.system.isTransformed) {
          if (
            this.parent.elder?.documentName === "Actor" &&
            this.actor.system.transformation.suppression.equipment
          ) {
            suppressed = true;
          }
        }
        return suppressed;
      }

      /**
       * Dampen this equipment.
       * @returns {Promise<void>}
       */
      async dampen() {
        const data = { doc: this.parent };
        await this.parent.hookCall("equipmentDampen", data);
        if (!data.cancel) {
          await this.parent.update({ "system.dampened": true });
        }
      }

      /** @inheritdoc */
      getCardContextMenuEntries(doc) {
        return [
          ...super.getCardContextMenuEntries(doc),
          {
            name: "Shatter",
            icon: makeIcon("wine-glass-crack", "contextMenu"),
            callback: this.shatter.bind(this),
            condition: this.parent.isOwner && !this.shattered,
            group: "control",
          },
          {
            name: "Repair",
            icon: makeIcon("wine-glass", "contextMenu"),
            callback: this.repair.bind(this),
            condition: this.parent.isOwner && this.shattered,
            group: "control",
          },
          {
            name: "Dampen",
            icon: makeIcon("bell-slash", "contextMenu"),
            callback: this.dampen.bind(this),
            condition: this.parent.isOwner && !this.dampened,
            group: "control",
          },
          {
            name: "Undampen",
            icon: makeIcon("bell", "contextMenu"),
            callback: this.undampen.bind(this),
            condition: this.parent.isOwner && this.dampened,
            group: "control",
          },
        ];
      }

      /** @inheritDoc */
      getLocalRollData() {
        const data = super.getLocalRollData();
        Object.assign(data, {
          dampened: Number(this.dampened),
          shattered: Number(this.shattered),
        });
        return data;
      }

      /**
       * Repair this equipment.
       * @returns {Promise<void>}
       */
      async repair() {
        const data = { doc: this.parent };
        await this.parent.hookCall("equipmentRepair", data);
        if (!data.cancel) {
          if (this.shattered) {
            const shatterProperties = this.parent.properties.filter(
              (p) => p.name === "Shattered",
            );
            if (shatterProperties.length > 0) {
              await this.parent.deleteEmbeddedDocuments(
                "ActiveEffect",
                shatterProperties.map((p) => p.id),
              );
            }
          }
          if (this.shattered) {
            await this.parent.update({ "system.shattered": false });
          }
        }
      }

      /**
       * Shatter this equipment.
       * @returns {Promise<void>}
       */
      async shatter() {
        const data = { doc: this.parent };
        await this.parent.hookCall("equipmentShatter", data);
        if (!data.cancel) {
          const shatterProperty = await getProperty("Shattered");
          if (!this.shattered) {
            await this.parent.createEmbeddedDocuments("ActiveEffect", [
              shatterProperty,
            ]);
          }
        }
      }

      /**
       * Undampen this equipment.
       * @returns {Promise<void>}
       */
      async undampen() {
        const data = { doc: this.parent };
        await this.parent.hookCall("equipmentUndampen", data);
        if (!data.cancel) {
          await this.parent.update({ "system.dampened": false });
        }
      }
    }
  );
};
