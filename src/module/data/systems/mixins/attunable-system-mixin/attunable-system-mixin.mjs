import { formulaExists } from "../../../../helpers/formula.mjs";
import { makeIcon } from "../../../../helpers/utils.mjs";
import { EvaluationField } from "../../../fields/_module.mjs";

const { fields } = foundry.data;

/**
 * @param {typeof BaseItemSystem} Base
 */
export default function AttunableSystemMixin(Base) {
  return (
    /**
     * @extends {BaseItemSystem}
     * @extends {Teriock.Models.AttunableSystemData}
     * @mixin
     */
    class AttunableSystem extends Base {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Attunable"];

      /** @inheritDoc */
      static PRESERVED_PROPERTIES = ["system.needsAttunement", "system.tier", ...super.PRESERVED_PROPERTIES];

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          needsAttunement: new fields.BooleanField({ initial: true }),
          tier: new EvaluationField({ deterministic: true, min: 0 }),
        });
      }

      /**
       * Attunable tags.
       * @returns {Teriock.Sheet.DisplayTag[]}
       */
      get _attunableTags() {
        const key = this.needsAttunement.toString();
        const tags = [{ label: `TERIOCK.SYSTEMS.Attunable.FIELDS.needsAttunement.${key}` }];
        if (this.isAttuned) { tags.push({ label: "TERIOCK.SYSTEMS.Attunement.USAGE.attuned" }); }
        return tags.map(t => {
          return { label: t.label, tooltip: "TYPES.ActiveEffect.attunement" };
        });
      }

      /**
       * Attunable wrappers.
       * @returns {string[]}
       */
      get _attunableWrappers() {
        return formulaExists(this.tier.text)
          ? [_loc("TERIOCK.SYSTEMS.Attunable.PANELS.tier", { value: this.tier.text })]
          : [];
      }

      /**
       * Gets the current attunement data for this item.
       * @returns {TeriockAttunement|null} The attunement data or null if not attuned.
       */
      get attunement() {
        return this.actor?.attunements.find(a => a.system.target?.uuid === this.parent.uuid) ?? null;
      }

      /** @inheritDoc */
      get displayToggles() {
        return ["system.needsAttunement", ...super.displayToggles];
      }

      /** @inheritDoc */
      get embedIcons() {
        return [{
          action: "toggleAttunedDoc",
          icon: this.isAttuned ? TERIOCK.display.icons.attunable.attune : TERIOCK.display.icons.attunable.deattune,
          tooltip: this.isAttuned
            ? _loc("TERIOCK.SYSTEMS.Attunement.USAGE.attuned")
            : _loc("TERIOCK.SYSTEMS.Attunement.USAGE.deattuned"),
          visible: this.parent.isOwner && this.actor && this.actor.type !== "inventory",
          onClick: async () => {
            if (this.isAttuned) { await this.deattune(); }
            else { await this.attune(); }
          },
        }, ...super.embedIcons];
      }

      /**
       * Checks if the item is currently attuned.
       * @returns {boolean} True if the item is attuned, false otherwise.
       */
      get isAttuned() {
        return Boolean(this.attunement);
      }

      /** @inheritDoc */
      _onUpdate(changed, options, userId) {
        super._onUpdate(changed, options, userId);
        if (this.parent.checkEditor(userId)) {
          if (this.attunement) { this.attunement.update({ "system.tier": this.tier.value }); }
        }
      }

      /**
       * Attunes the item to the current character.
       *
       * Relevant wiki pages:
       * - [Attune](https://wiki.teriock.com/index.php/Ability:Attune)
       *
       * @returns {Promise<TeriockAttunement | null>} Promise that resolves to the attunement effect or null.
       */
      async attune() {
        await this.parent.hookCall("attune", { scope: { attunable: this.parent } });
        let attunement = this.attunement;
        if (attunement) { return attunement; }
        const attunementData = {
          changes: [{ key: "system.attunements", phase: "initial", priority: 10, type: "add", value: this.parent._id }],
          img: this.parent.img,
          name: _loc("TERIOCK.SYSTEMS.Attunable.USAGE.Attune.defaultName", { name: this.parent.name }),
          system: { inheritTier: true, target: this.parent._id, tier: this.tier.value, type: this.parent.type },
          type: "attunement",
        };
        if (this.parent.actor && (await this.canAttune())) {
          attunement = await this.parent.actor.createEmbeddedDocuments("ActiveEffect", [attunementData]);
          ui.notifications.success("TERIOCK.SYSTEMS.Attunable.USAGE.Attune.success", {
            format: { name: this.parent.fullName },
            localize: true,
          });
          await this.parent.sheet?.render();
        } else {
          ui.notifications.error("TERIOCK.SYSTEMS.Attunable.USAGE.Attune.notEnoughPresence", {
            format: { name: this.parent.fullName },
            localize: true,
          });
        }
        return attunement;
      }

      /**
       * Checks if the character can attune to the item based on available presence.
       * Considers reference item tier if the item is not identified.
       * @returns {Promise<boolean>} Promise that resolves to true if attunement is possible, false otherwise.
       */
      async canAttune() {
        if (this.parent.actor) {
          const tierDerived = this.tier.value;
          const unp = this.parent.actor.system.presence.max - this.parent.actor.system.presence.value;
          return tierDerived <= unp;
        }
        return false;
      }

      /**
       * Removes attunement from the item.
       *
       * Relevant wiki pages:
       * - [Deattune](https://wiki.teriock.com/index.php/Ability:Deattune)
       *
       * @returns {Promise<void>}
       */
      async deattune() {
        await this.parent.hookCall("deattune", { scope: { attunable: this.parent } });
        if (this.attunement) {
          await this.attunement.delete();
          ui.notifications.success("TERIOCK.SYSTEMS.Attunable.USAGE.Deattune.success", {
            format: { name: this.parent.fullName },
            localize: true,
          });
          await this.parent.sheet?.render();
        }
      }

      /** @inheritDoc */
      getCardContextMenuEntries(doc) {
        return [...super.getCardContextMenuEntries(doc), {
          group: "control",
          icon: makeIcon(TERIOCK.display.icons.attunable.attune, "contextMenu"),
          label: _loc("TERIOCK.SYSTEMS.Attunable.MENU.attune"),
          onClick: this.attune.bind(this),
          visible: !this.isAttuned && this.actor && this.parent._checkValidEditorDocument(doc, { self: false }),
        }, {
          group: "control",
          icon: makeIcon(TERIOCK.display.icons.attunable.deattune, "contextMenu"),
          label: _loc("TERIOCK.SYSTEMS.Attunable.MENU.deattune"),
          onClick: this.deattune.bind(this),
          visible: this.isAttuned && this.actor && this.parent._checkValidEditorDocument(doc, { self: false }),
        }];
      }

      /** @inheritDoc */
      getLocalRollData() {
        return { ...super.getLocalRollData(), attuned: Number(this.isAttuned), tier: this.tier.value || 0 };
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
      }

      /** @inheritDoc */
      prepareSpecialData() {
        super.prepareSpecialData();
        this.tier.evaluate();
      }
    }
  );
}
