import { makeIcon } from "../../../../../../helpers/icon.mjs";
import { initialBoolean } from "../../../../../fields/helpers/initializers.mjs";

const { fields } = foundry.data;

/**
 * Equipment data model mixin that handles shattering and dampening.
 * @param {typeof EquipmentSystem} Base
 */
export default function EquipmentSuppressionPart(Base) {
  return (
    /**
     * @extends {BaseItemSystem}
     * @extends {Teriock.Models.EquipmentSuppressionPartData}
     * @mixin
     */
    class EquipmentSuppressionPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          dampened: initialBoolean(),
          destroyed: initialBoolean(),
          shattered: initialBoolean(),
          stashed: new fields.BooleanField({ initial: false }),
        });
      }

      /** @inheritDoc */
      get _displayMessagesSuppression() {
        const messages = super._displayMessagesSuppression;
        if (this._isSuppressedUnequipped) { this._addSuppressionMessage("unequipped", messages); }
        if (this._isSuppressedStashed) { this._addSuppressionMessage("stashed", messages); }
        if (this._isSuppressedDestroyed) { this._addSuppressionMessage("destroyed", messages); }
        return messages;
      }

      /** @inheritDoc */
      get _embedIcons() {
        return [super._embedIcons.find(i => i.action?.toLowerCase().includes("attuned")), {
          action: "toggleDampenedDoc",
          icon: this.dampened ? TERIOCK.display.icons.equipment.dampen : TERIOCK.display.icons.equipment.undampen,
          tooltip: this.dampened
            ? _loc("TERIOCK.SYSTEMS.Equipment.FIELDS.dampened.label")
            : _loc("TERIOCK.SYSTEMS.Equipment.EMBED.undampened"),
          visible: this.parent.isOwner,
          onClick: async () => {
            if (this.dampened) { await this.undampen(); }
            else { await this.dampen(); }
          },
        }, {
          action: "toggleShatteredDoc",
          icon: this.shattered ? TERIOCK.display.icons.break.shatter : TERIOCK.display.icons.break.repair,
          tooltip: this.shattered
            ? _loc("TERIOCK.TERMS.Properties.shattered")
            : _loc("TERIOCK.SYSTEMS.Equipment.EMBED.unshatterd"),
          visible: this.parent.isOwner,
          onClick: async () => {
            if (this.shattered) { await this.repair(); }
            else { await this.shatter(); }
          },
        }, ...super._embedIcons.filter(i => !i.action?.toLowerCase().includes("attuned"))];
      }

      /**
       * If this is suppressed due to being destroyed.
       * @returns {boolean}
       */
      get _isSuppressedDestroyed() {
        return this.destroyed;
      }

      /**
       * If this is suppressed due to being stashed.
       * @returns {boolean}
       */
      get _isSuppressedStashed() {
        return this.stashed;
      }

      /**
       * If this is suppressed due to not being equipped.
       * @returns {boolean}
       */
      get _isSuppressedUnequipped() {
        return !this.equipped;
      }

      /** @inheritDoc */
      get _nameTags() {
        const tags = super._nameTags;
        if (this.stashed) { tags.push(_loc("TERIOCK.SYSTEMS.Equipment.FIELDS.stashed.label")); }
        return tags;
      }

      /** @inheritDoc */
      get embedParts() {
        return Object.assign(super.embedParts, { shattered: this.shattered });
      }

      /** @inheritDoc */
      get makeSuppressed() {
        return super.makeSuppressed
          || this._isSuppressedUnequipped
          || this._isSuppressedStashed
          || this._isSuppressedDestroyed;
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
        await this.parent.hookCall("dampen", { scope: { equipment: this.parent } });
        await this.parent.toggleChild("property:dampened", { active: true });
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
        await this.parent.hookCall("destroy", { scope: { equipment: this.parent } });
        await this.parent.toggleChild("property:destroyed", { active: true });
      }

      /** @inheritdoc */
      getCardContextMenuEntries(doc) {
        return [...super.getCardContextMenuEntries(doc), {
          group: "control",
          icon: makeIcon(TERIOCK.display.icons.break.shatter, "contextMenu"),
          label: _loc("TERIOCK.SYSTEMS.Equipment.MENU.shatter"),
          onClick: this.shatter.bind(this),
          visible: !this.shattered && this.parent._checkValidEditorDocument(doc, { self: false }),
        }, {
          group: "control",
          icon: makeIcon(TERIOCK.display.icons.break.repair, "contextMenu"),
          label: _loc("TERIOCK.SYSTEMS.Equipment.MENU.repair"),
          onClick: this.repair.bind(this),
          visible: this.shattered && this.parent._checkValidEditorDocument(doc, { self: false }),
        }, {
          group: "control",
          icon: makeIcon(TERIOCK.display.icons.break.destroy, "contextMenu"),
          label: _loc("TERIOCK.SYSTEMS.Equipment.MENU.destroy"),
          onClick: this.destroy.bind(this),
          visible: !this.destroyed && this.parent._checkValidEditorDocument(doc, { self: false }),
        }, {
          group: "control",
          icon: makeIcon(TERIOCK.display.icons.break.reforge, "contextMenu"),
          label: _loc("TERIOCK.SYSTEMS.Equipment.MENU.reforge"),
          onClick: this.reforge.bind(this),
          visible: this.destroyed && this.parent._checkValidEditorDocument(doc, { self: false }),
        }, {
          group: "control",
          icon: makeIcon(TERIOCK.display.icons.equipment.dampen, "contextMenu"),
          label: _loc("TERIOCK.SYSTEMS.Equipment.MENU.dampen"),
          onClick: this.dampen.bind(this),
          visible: !this.dampened && this.parent._checkValidEditorDocument(doc, { self: false }),
        }, {
          group: "control",
          icon: makeIcon(TERIOCK.display.icons.equipment.undampen, "contextMenu"),
          label: _loc("TERIOCK.SYSTEMS.Equipment.MENU.undampen"),
          onClick: this.undampen.bind(this),
          visible: this.dampened && this.parent._checkValidEditorDocument(doc, { self: false }),
        }, {
          group: "control",
          icon: makeIcon(TERIOCK.display.icons.equipment.stash, "contextMenu"),
          label: _loc("TERIOCK.SYSTEMS.Equipment.MENU.stash"),
          onClick: this.stash.bind(this),
          visible: !this.stashed && this.actor && this.parent._checkValidEditorDocument(doc, { self: false }),
        }, {
          group: "control",
          icon: makeIcon(TERIOCK.display.icons.equipment.unstash, "contextMenu"),
          label: _loc("TERIOCK.SYSTEMS.Equipment.MENU.unstash"),
          onClick: this.unstash.bind(this),
          visible: this.stashed && this.actor && this.parent._checkValidEditorDocument(doc, { self: false }),
        }];
      }

      /** @inheritDoc */
      getLocalRollData() {
        const data = super.getLocalRollData();
        Object.assign(data, {
          dampened: Number(this.dampened),
          destroyed: Number(this.destroyed),
          shattered: Number(this.shattered),
          stashed: Number(this.stashed),
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
        await this.parent.hookCall("reforge", { scope: { equipment: this.parent } });
        await this.parent.toggleChild("property:destroyed", { active: false });
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
        await this.parent.hookCall("repair", { scope: { equipment: this.parent } });
        await this.parent.toggleChild("property:shattered", { active: false });
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
        await this.parent.hookCall("shatter", { scope: { equipment: this.parent } });
        await this.parent.toggleChild("property:shattered", { active: true });
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
        await this.parent.hookCall("undampen", { scope: { equipment: this.parent } });
        await this.parent.toggleChild("property:dampened", { active: false });
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
}
