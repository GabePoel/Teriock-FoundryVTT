import { TeriockDialog } from "../../../../applications/api/_module.mjs";

const { ux } = foundry.applications;

/**
 * Equipment data model mixin that handles identifying and reading magic.
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends TeriockEquipmentData
     */
    class EquipmentUnderstandingPart extends Base {
      /**
       * Identifies the equipment, revealing all its properties.
       * @returns {Promise<void>} Promise that resolves when the equipment is identified.
       */
      async identify() {
        const data = { doc: this.parent };
        await this.parent.hookCall("equipmentIdentify", data);
        if (!data.cancel) {
          if (this.reference && !this.identified) {
            const activeGM = game.users.activeGM;
            const ref = await fromUuid(this.reference);
            const referenceName = ref ? ref.name : "Unknown";
            const referenceUuid = ref ? ref.uuid : "Unknown";
            foundry.ui.notifications.info(
              `Asking GMs to approve identification of ${this.parent.name}.`,
            );
            const content = await ux.TextEditor.implementation.enrichHTML(
              `<p>Should ${game.user.name} identify @UUID[${referenceUuid}]{${referenceName}}?</p>`,
            );
            const doIdentify = await TeriockDialog.query(activeGM, "confirm", {
              content: content,
              modal: false,
              window: {
                icon: "fa-solid fa-magnifying-glass",
                title: "Identify Item",
              },
            });
            if (doIdentify) {
              const knownEffectNames = this.parent.transferredEffects.map(
                (e) => e.name,
              );
              const unknownEffects = ref.transferredEffects.filter(
                (e) => !knownEffectNames.includes(e.name),
              );
              const unknownEffectData = unknownEffects.map((e) =>
                foundry.utils.duplicate(e),
              );
              await this.parent.createEmbeddedDocuments(
                "ActiveEffect",
                unknownEffectData,
              );
              const refSystem = foundry.utils.duplicate(ref.system);
              delete refSystem.equipped;
              delete refSystem.dampened;
              delete refSystem.shattered;
              if (ref) {
                await this.parent.update({
                  name: ref.name,
                  system: refSystem,
                });
              }
              ui.notifications.success(
                `${this.parent.name} was successfully identified.`,
              );
            } else {
              ui.notifications.error(
                `${this.parent.name} was not successfully identified.`,
              );
            }
          }
        }
      }

      /**
       * Reads magic on the equipment to reveal its properties.
       * @returns {Promise<void>} Promise that resolves when magic reading is complete.
       */
      async readMagic() {
        const data = { doc: this.parent };
        await this.parent.hookCall("equipmentReadMagic", data);
        if (!data.cancel) {
          if (this.reference && !this.identified) {
            const activeGM = game.users.activeGM;
            const ref = await fromUuid(this.reference);
            const referenceName = ref ? ref.name : "Unknown";
            const referenceUuid = ref ? ref.uuid : "Unknown";
            foundry.ui.notifications.info(
              `Asking GMs to approve reading magic on ${this.parent.name}.`,
            );
            const content = await ux.TextEditor.enrichHTML(
              `<p>Should ${game.user.name} read magic on @UUID[${referenceUuid}]{${referenceName}}?</p>`,
            );
            const doReadMagic = await TeriockDialog.query(activeGM, "confirm", {
              content: content,
              modal: false,
              window: {
                icon: "fa-solid fa-magnifying-glass",
                title: "Read Magic",
              },
            });
            if (doReadMagic) {
              if (ref) {
                await this.parent.update({
                  "system.powerLevel": ref.system.powerLevel,
                });
              }
              foundry.ui.notifications.success(
                `${this.parent.name} was successfully read.`,
              );
            } else {
              foundry.ui.notifications.error(
                `${this.parent.name} was not successfully read.`,
              );
            }
          }
        }
      }

      /**
       * Removes identification from the equipment.
       * @returns {Promise<void>} Promise that resolves when the equipment is unidentified.
       */
      async unidentify() {
        const data = { doc: this.parent };
        await this.parent.hookCall("equipmentUnidentify", data);
        if (!data.cancel) {
          if (this.identified) {
            const reference = this.parent.uuid;
            const copy =
              /** @type {TeriockEquipment} */ await this.parent.duplicate();
            const name = "Unidentified " + this.equipmentType;
            const description = "This item has not been identified.";
            const effects = copy.transferredEffects;
            const unidentifiedProperties =
              TERIOCK.options.equipment.unidentifiedProperties;
            const idsToRemove = effects
              .filter(
                (e) =>
                  e.type !== "property" ||
                  !unidentifiedProperties.includes(e.name),
              )
              .map((e) => e._id);
            await copy.update({
              name: name,
              "system.reference": reference,
              "system.description": description,
              "system.powerLevel": "unknown",
              "system.tier.saved": "",
              "system.identified": false,
              "system.flaws": "",
              "system.notes": "",
              "system.font": "",
              "system.equipped": false,
            });
            await copy.deleteEmbeddedDocuments("ActiveEffect", idsToRemove);
          } else if (this.parent.type === "equipment") {
            foundry.ui.notifications.warn("This item is already unidentified.");
          }
        }
      }
    }
  );
};
