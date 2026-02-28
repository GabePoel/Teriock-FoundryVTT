import { makeIcon } from "../../../../helpers/utils.mjs";
import { EvaluationField } from "../../../fields/_module.mjs";

/**
 * @param {typeof BaseItemSystem} Base
 */
export default function AttunableSystemMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {BaseItemSystem}
     * @implements {Teriock.Models.AttunableSystemInterface}
     * @mixin
     */
    class AttunableSystem extends Base {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        "TERIOCK.SYSTEMS.Attunable",
      ];

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          tier: new EvaluationField({ deterministic: true, min: 0 }),
        });
      }

      /**
       * Gets the current attunement data for this item.
       * @returns {TeriockAttunement|null} The attunement data or null if not attuned.
       */
      get attunement() {
        if (this.parent.actor) {
          return this.parent.actor.attunements.find(
            (effect) => effect.system.target === this.parent._id,
          );
        }
        return null;
      }

      /** @inheritDoc */
      get embedIcons() {
        return [
          {
            icon: this.isAttuned
              ? TERIOCK.display.icons.attunable.attune
              : TERIOCK.display.icons.attunable.deattune,
            action: "toggleAttunedDoc",
            tooltip: this.isAttuned
              ? game.i18n.localize("TERIOCK.SYSTEMS.Attunement.USAGE.attuned")
              : game.i18n.localize(
                  "TERIOCK.SYSTEMS.Attunement.USAGE.deattuned",
                ),
            condition: this.parent.isOwner,
            callback: async () => {
              if (this.isAttuned) await this.deattune();
              else await this.attune();
            },
          },
          ...super.embedIcons,
        ];
      }

      /**
       * Checks if the item is currently attuned.
       * @returns {boolean} True if the item is attuned, false otherwise.
       */
      get isAttuned() {
        if (this.parent.actor) {
          return this.parent.actor.system.attunements.has(this.parent._id);
        }
        return false;
      }

      /** @inheritDoc */
      _onUpdate(changed, options, userId) {
        super._onUpdate(changed, options, userId);
        if (this.parent.checkEditor(userId)) {
          if (this.attunement) {
            this.attunement
              .update({
                "system.tier": this.tier.value,
              })
              .then();
          }
        }
      }

      /**
       * Attunes the item to the current character.
       * @returns {Promise<TeriockAttunement | null>} Promise that resolves to the attunement effect or null.
       */
      async attune() {
        const data = { doc: this.parent };
        await this.parent.hookCall("attune", data);
        await this.parent.hookCall(`${this.parent.type}Attune`, data);
        if (data.cancel) return null;
        let attunement = this.attunement;
        if (attunement) return attunement;
        const attunementData = {
          type: "attunement",
          name: game.i18n.format(
            "TERIOCK.SYSTEMS.Attunable.USAGE.Attune.defaultName",
            { name: this.parent.name },
          ),
          img: this.parent.img,
          system: {
            type: this.parent.type,
            target: this.parent._id,
            inheritTier: true,
            tier: this.tier.value,
          },
          changes: [
            {
              key: "system.attunements",
              mode: 2,
              value: this.parent._id,
              priority: 10,
            },
            {
              key: "system.presence.value",
              mode: 2,
              value: this.tier.value,
              priority: 10,
            },
          ],
        };
        if (this.parent.actor && (await this.canAttune())) {
          if (this.reference && !this.identified) {
            const ref = await fromUuid(this.reference);
            if (ref) {
              await this.parent.update({
                "system.tier.saved": ref.system.tier.raw,
              });
            }
          }
          attunement = await this.parent.actor.createEmbeddedDocuments(
            "ActiveEffect",
            [attunementData],
          );
          ui.notifications.success(
            "TERIOCK.SYSTEMS.Attunable.USAGE.Attune.success",
            { format: { name: this.parent.nameString }, localize: true },
          );
        } else {
          ui.notifications.error(
            "TERIOCK.SYSTEMS.Attunable.USAGE.Attune.notEnoughPresence",
            { format: { name: this.parent.nameString }, localize: true },
          );
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
          let tierDerived = this.tier.value;
          if (this.reference && !this.identified) {
            const ref = await fromUuid(this.reference);
            tierDerived = ref.system.tier.value;
          }
          const unp =
            this.parent.actor.system.presence.max -
            this.parent.actor.system.presence.value;
          return tierDerived <= unp;
        }
        return false;
      }

      /**
       * Removes attunement from the item.
       * @returns {Promise<void>}
       */
      async deattune() {
        const data = { doc: this.parent };
        await this.parent.hookCall(`deattune`, data);
        await this.parent.hookCall(`${this.parent.type}Deattune`, data);
        if (data.cancel) return;
        const attunement = this.attunement;
        if (attunement) {
          await attunement.delete();
          ui.notifications.success(
            "TERIOCK.SYSTEMS.Attunable.USAGE.Deattune.success",
            { format: { name: this.parent.nameString }, localize: true },
          );
        }
      }

      /** @inheritDoc */
      getCardContextMenuEntries(doc) {
        return [
          ...super.getCardContextMenuEntries(doc),
          {
            name: game.i18n.localize("TERIOCK.SYSTEMS.Attunable.MENU.attune"),
            icon: makeIcon(
              TERIOCK.display.icons.attunable.attune,
              "contextMenu",
            ),
            callback: this.attune.bind(this),
            condition: this.parent.isOwner && !this.isAttuned,
            group: "control",
          },
          {
            name: game.i18n.localize("TERIOCK.SYSTEMS.Attunable.MENU.deattune"),
            icon: makeIcon(
              TERIOCK.display.icons.attunable.deattune,
              "contextMenu",
            ),
            callback: this.deattune.bind(this),
            condition: this.parent.isOwner && this.isAttuned,
            group: "control",
          },
        ];
      }

      /** @inheritDoc */
      getLocalRollData() {
        return {
          ...super.getLocalRollData(),
          tier: this.tier.value || 0,
          attuned: Number(this.isAttuned),
        };
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
      }

      /** @inheritDoc */
      prepareSpecialData() {
        super.prepareSpecialData();
        this.tier.evaluate();
        this.range.long.evaluate();
        this.range.short.evaluate();
      }
    }
  );
}
