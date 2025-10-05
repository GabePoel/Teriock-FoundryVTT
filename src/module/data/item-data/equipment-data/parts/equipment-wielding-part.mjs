import { getProperty } from "../../../../helpers/fetch.mjs";

/**
 * Equipment data model mixin that handles equipping, gluing, and attunement.
 * @mixin
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends TeriockEquipmentData
     */
    class EquipmentWieldingPart extends Base {
      /**
       * Gets the current attunement data for the equipment.
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
       * Checks if equipping is a valid operation.
       * @returns {boolean}
       */
      get canEquip() {
        return (
          ((this.consumable && this.quantity >= 1) || !this.consumable) &&
          !this.isEquipped
        );
      }

      /**
       * Checks if unequipping is a valid operation.
       * @returns {boolean}
       */
      get canUnequip() {
        return (
          ((this.consumable && this.quantity >= 1) || !this.consumable) &&
          this.isEquipped
        );
      }

      /**
       * Checks if the equipment is currently attuned.
       * @returns {boolean} True if the equipment is attuned, false otherwise.
       */
      get isAttuned() {
        if (this.parent.actor) {
          return this.parent.actor.system.attunements.has(this.parent._id);
        }
        return false;
      }

      /**
       * Checks if the equipment is currently equipped.
       * @returns {boolean} - True if the equipment is equipped, false otherwise.
       */
      get isEquipped() {
        if (this.consumable) {
          return this.quantity >= 1 && this.equipped;
        } else {
          return this.equipped;
        }
      }

      //noinspection JSUnusedGlobalSymbols
      /** @inheritDoc */
      _onCreate(data, options, userId) {
        super._onCreate(data, options, userId);
        this.unglue().then();
      }

      /**
       * Attunes the equipment to the current character.
       * @returns {Promise<TeriockAttunement | null>} Promise that resolves to the attunement effect or null.
       */
      async attune() {
        const data = { doc: this.parent };
        await this.parent.hookCall("equipmentAttune", data);
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
              type: "equipment",
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
              const ref = await foundry.utils.fromUuid(this.reference);
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
       * Checks if the character can attune to the equipment based on available presence.
       * Considers reference equipment tier if the equipment is not identified.
       * @returns {Promise<boolean>} Promise that resolves to true if attunement is possible, false otherwise.
       */
      async canAttune() {
        if (this.parent.actor) {
          let tierDerived = this.tier.value;
          if (this.reference && !this.identified) {
            const ref =
              /** @type {TeriockEquipment} */ await foundry.utils.fromUuid(
                this.reference,
              );
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
       * Removes attunement from the equipment.
       * @returns {Promise<void>} Promise that resolves when the equipment is deattuned.
       */
      async deattune() {
        const data = { doc: this.parent };
        await this.parent.hookCall("equipmentDeattune", data);
        if (!data.cancel) {
          const attunement = this.attunement;
          if (attunement) {
            await attunement.delete();
          }
        }
      }

      /**
       * Equip this equipment.
       * @returns {Promise<void>}
       */
      async equip() {
        const data = { doc: this.parent };
        await this.parent.hookCall("equipmentEquip", data);
        if (!data.cancel) {
          await this.parent.update({ "system.equipped": true });
        }
      }

      /**
       * Glue this equipment.
       * @returns {Promise<void>}
       */
      async glue() {
        const data = { doc: this.parent };
        await this.parent.hookCall("equipmentGlue", data);
        if (!data.cancel) {
          const glueProperty = await getProperty("Glued");
          if (!this.glued) {
            await this.parent.createEmbeddedDocuments("ActiveEffect", [
              glueProperty,
            ]);
          }
        }
      }

      /**
       * Unequip this equipment.
       * @returns {Promise<void>}
       */
      async unequip() {
        const data = { doc: this.parent };
        await this.parent.hookCall("equipmentUnequip", data);
        if (!data.cancel) {
          await this.parent.update({ "system.equipped": false });
        }
      }

      /**
       * Unglue this equipment.
       * @returns {Promise<void>}
       */
      async unglue() {
        const data = { doc: this.parent };
        await this.parent.hookCall("equipmentUnglue", data);
        if (!data.cancel) {
          if (this.glued) {
            const glueProperties = this.parent.properties.filter(
              (p) => p.name === "Glued",
            );
            if (glueProperties.length > 0) {
              await this.parent.deleteEmbeddedDocuments(
                "ActiveEffect",
                glueProperties.map((p) => p.id),
              );
            }
            if (this.glued) {
              await this.parent.update({ "system.glued": false });
            }
          }
        }
      }
    }
  );
};
