import { getProperty } from "../../../../../../helpers/fetch.mjs";
import { makeIcon } from "../../../../../../helpers/utils.mjs";

const { fields } = foundry.data;

/**
 * Equipment data model mixin that handles shattering and dampening.
 * @param {typeof EquipmentSystem} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {EquipmentSystem}
     * @implements {EquipmentSuppressionPartInterface}
     * @mixin
     */
    class EquipmentSuppressionPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          dampened: new fields.BooleanField({ initial: false }),
          shattered: new fields.BooleanField({ initial: false }),
          stashed: new fields.BooleanField({ initial: false }),
        });
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
            tooltip: this.dampened
              ? game.i18n.localize(
                  "TERIOCK.SYSTEMS.Equipment.FIELDS.dampened.label",
                )
              : game.i18n.localize(
                  "TERIOCK.SYSTEMS.Equipment.EMBED.undampened",
                ),
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
            icon: this.shattered
              ? TERIOCK.display.icons.break.shatter
              : TERIOCK.display.icons.break.repair,
            action: "toggleShatteredDoc",
            tooltip: this.shattered
              ? game.i18n.localize("TERIOCK.TERMS.Properties.shattered")
              : game.i18n.localize(
                  "TERIOCK.SYSTEMS.Equipment.EMBED.unshatterd",
                ),
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
        if (data.cancel) return;
        await this.parent.update({ "system.dampened": true });
      }

      /** @inheritdoc */
      getCardContextMenuEntries(doc) {
        return [
          ...super.getCardContextMenuEntries(doc),
          {
            name: game.i18n.localize("TERIOCK.SYSTEMS.Equipment.MENU.shatter"),
            icon: makeIcon(TERIOCK.display.icons.break.shatter, "contextMenu"),
            callback: this.shatter.bind(this),
            condition: this.parent.isOwner && !this.shattered,
            group: "control",
          },
          {
            name: game.i18n.localize("TERIOCK.SYSTEMS.Equipment.MENU.repair"),
            icon: makeIcon(TERIOCK.display.icons.break.repair, "contextMenu"),
            callback: this.repair.bind(this),
            condition: this.parent.isOwner && this.shattered,
            group: "control",
          },
          {
            name: game.i18n.localize("TERIOCK.SYSTEMS.Equipment.MENU.dampen"),
            icon: makeIcon(
              TERIOCK.display.icons.equipment.dampen,
              "contextMenu",
            ),
            callback: this.dampen.bind(this),
            condition: this.parent.isOwner && !this.dampened,
            group: "control",
          },
          {
            name: game.i18n.localize("TERIOCK.SYSTEMS.Equipment.MENU.undampen"),
            icon: makeIcon(
              TERIOCK.display.icons.equipment.undampen,
              "contextMenu",
            ),
            callback: this.undampen.bind(this),
            condition: this.parent.isOwner && this.dampened,
            group: "control",
          },
          {
            name: game.i18n.localize("TERIOCK.SYSTEMS.Equipment.MENU.stash"),
            icon: makeIcon(
              TERIOCK.display.icons.equipment.stash,
              "contextMenu",
            ),
            callback: this.stash.bind(this),
            condition: this.parent.isOwner && !this.stashed,
            group: "control",
          },
          {
            name: game.i18n.localize("TERIOCK.SYSTEMS.Equipment.MENU.unstash"),
            icon: makeIcon(
              TERIOCK.display.icons.equipment.unstash,
              "contextMenu",
            ),
            callback: this.unstash.bind(this),
            condition: this.parent.isOwner && this.stashed,
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
        if (data.cancel) return;
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

      /**
       * Shatter this equipment.
       * @returns {Promise<void>}
       */
      async shatter() {
        const data = { doc: this.parent };
        await this.parent.hookCall("equipmentShatter", data);
        if (data.cancel) return;
        const shatterProperty = await getProperty("Shattered");
        if (!this.shattered) {
          await this.parent.createEmbeddedDocuments("ActiveEffect", [
            shatterProperty,
          ]);
        }
      }

      /**
       * Stash this equipment.
       * @returns {Promise<void>}
       */
      async stash() {
        await this.parent.update({ "system.stashed": true });
      }

      /**
       * Undampen this equipment.
       * @returns {Promise<void>}
       */
      async undampen() {
        const data = { doc: this.parent };
        await this.parent.hookCall("equipmentUndampen", data);
        if (data.cancel) return;
        await this.parent.update({ "system.dampened": false });
      }

      /**
       * Unstash this equipment.
       * @returns {Promise<void>}
       */
      async unstash() {
        await this.parent.update({ "system.stashed": false });
      }
    }
  );
};
