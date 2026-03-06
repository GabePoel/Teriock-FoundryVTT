import {
  ensureChildren,
  ensureNoChildren,
} from "../../../../../../helpers/resolve.mjs";
import { makeIcon } from "../../../../../../helpers/utils.mjs";

const { fields } = foundry.data;

/**
 * Equipment data model mixin that handles shattering and dampening.
 * @param {typeof EquipmentSystem} Base
 */
export default (Base) => {
  return (
    /**
     * @extends {BaseItemSystem}
     * @extends {EquipmentSuppressionPartInterface}
     * @mixin
     */
    class EquipmentSuppressionPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          dampened: new fields.BooleanField({ initial: false }),
          shattered: new fields.BooleanField({ initial: false }),
          stashed: new fields.BooleanField({ initial: false }),
          destroyed: new fields.BooleanField({ initial: false }),
        });
      }

      /** @inheritDoc */
      get embedIcons() {
        return [
          super.embedIcons.find((i) =>
            i.action?.toLowerCase().includes("attuned"),
          ),
          {
            icon: this.dampened
              ? TERIOCK.display.icons.equipment.dampen
              : TERIOCK.display.icons.equipment.undampen,
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
        return (
          super.makeSuppressed ||
          !this.equipped ||
          this.stashed ||
          this.destroyed
        );
      }

      /**
       * Dampen this equipment.
       *
       * Relevant wiki pages:
       * - [Dampened](https://wiki.teriock.com/index.php/Property:Dampened)
       *
       * @returns {Promise<void>}
       */
      async dampen() {
        await this.parent.hookCall("dampen", {
          scope: { equipment: this.parent },
        });
        await ensureChildren(this.parent, "property", ["Dampened"]);
      }

      /**
       * Destroy this equipment.
       *
       * Relevant wiki pages:
       * - [Destroyed](https://wiki.teriock.com/index.php/Property:Destroyed)
       *
       * @returns {Promise<void>}
       */
      async destroy() {
        await this.parent.hookCall("destroy", {
          scope: { equipment: this.parent },
        });
        await ensureChildren(this.parent, "property", ["Destroyed"]);
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
            name: game.i18n.localize("TERIOCK.SYSTEMS.Equipment.MENU.destroy"),
            icon: makeIcon(TERIOCK.display.icons.break.destroy, "contextMenu"),
            callback: this.destroy.bind(this),
            condition: this.parent.isOwner && !this.destroyed,
            group: "control",
          },
          {
            name: game.i18n.localize("TERIOCK.SYSTEMS.Equipment.MENU.reforge"),
            icon: makeIcon(TERIOCK.display.icons.break.reforge, "contextMenu"),
            callback: this.reforge.bind(this),
            condition: this.parent.isOwner && this.destroyed,
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
       * Reforge this equipment.
       *
       * Relevant wiki pages:
       * - [Destroyed](https://wiki.teriock.com/index.php/Property:Destroyed)
       *
       * @returns {Promise<void>}
       */
      async reforge() {
        await this.parent.hookCall("reforge", {
          scope: { equipment: this.parent },
        });
        await ensureNoChildren(this.parent, "property", ["Destroyed"]);
      }

      /**
       * Repair this equipment.
       *
       * Relevant wiki pages:
       * - [Shattered](https://wiki.teriock.com/index.php/Property:Shattered)
       *
       * @returns {Promise<void>}
       */
      async repair() {
        await this.parent.hookCall("repair", {
          scope: { equipment: this.parent },
        });
        await ensureNoChildren(this.parent, "property", ["Shattered"]);
        if (this.shattered) {
          await this.parent.update({ "system.shattered": false });
        }
      }

      /**
       * Shatter this equipment.
       *
       * Relevant wiki pages:
       * - [Shattered](https://wiki.teriock.com/index.php/Property:Shattered)
       *
       * @returns {Promise<void>}
       */
      async shatter() {
        await this.parent.hookCall("shatter", {
          scope: { equipment: this.parent },
        });
        await ensureChildren(this.parent, "property", ["Shattered"]);
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
       *
       * Relevant wiki pages:
       * - [Dampened](https://wiki.teriock.com/index.php/Property:Dampened)
       *
       * @returns {Promise<void>}
       */
      async undampen() {
        await this.parent.hookCall("undampen", {
          scope: { equipment: this.parent },
        });
        await ensureNoChildren(this.parent, "property", ["Dampened"]);
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
