import {
  deriveModifiableDeterministic,
  modifiableFormula,
  prepareModifiableBase,
} from "../../shared/fields/modifiable.mjs";

export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @implements {AttunableDataMixinInterface}
     * @extends {ChildTypeModel}
     */
    class AttunableDataMixin extends Base {
      static defineSchema() {
        const schema = super.defineSchema();
        Object.assign(schema, {
          tier: modifiableFormula(),
        });
        return schema;
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

      /**
       * Attunes the item to the current character.
       * @returns {Promise<TeriockAttunement | null>} Promise that resolves to the attunement effect or null.
       */
      async attune() {
        const data = { doc: this.parent };
        await this.parent.hookCall("attune", data);
        await this.parent.hookCall(`${this.parent.type}Attune`, data);
        if (!data.cancel) {
          let attunement = this.attunement;
          if (attunement) {
            return attunement;
          }
          const attunementData = {
            type: "attunement",
            name: `${this.parent.name} Attunement`,
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
                  "system.tier.saved": ref.system.tier.saved,
                });
              }
            }
            attunement = await this.parent.actor.createEmbeddedDocuments(
              "ActiveEffect",
              [attunementData],
            );
            foundry.ui.notifications.success(
              `${this.parent.name} was successfully attuned.`,
            );
          } else {
            foundry.ui.notifications.error(
              `You do not have enough unused presence to attune ${this.parent.name}.`,
            );
          }
          return attunement;
        }
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
       * @returns {Promise<void>} Promise that resolves when the item is deattuned.
       */
      async deattune() {
        const data = { doc: this.parent };
        await this.parent.hookCall(`deattune`, data);
        await this.parent.hookCall(`${this.parent.type}Deattune`, data);
        if (!data.cancel) {
          const attunement = this.attunement;
          if (attunement) {
            await attunement.delete();
          }
        }
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        prepareModifiableBase(this.tier);
      }

      /** @inheritDoc */
      prepareSpecialData() {
        super.prepareSpecialData();
        deriveModifiableDeterministic(this.tier, this.parent);
      }
    }
  );
};
