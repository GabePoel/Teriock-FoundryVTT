import { TeriockDialog } from "../../../../applications/api/_module.mjs";
import { selectDocumentsDialog } from "../../../../applications/dialogs/select-document-dialog.mjs";
import { getItem } from "../../../../helpers/fetch.mjs";

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
    class EquipmentIdentificationPart extends Base {
      /**
       * Identifies the equipment, revealing all its properties.
       * @returns {Promise<void>} Promise that resolves when the equipment is identified.
       */
      async identify() {
        const data = { doc: this.parent };
        await this.parent.hookCall("equipmentIdentify", data);
        if (!data.cancel) {
          if (!this.identification.identified) {
            foundry.ui.notifications.info(
              `Asking GMs to approve identification of ${this.parent.name}.`,
            );
            const doIdentify = await game.users.activeGM.query(
              "teriock.identifyItem",
              { uuid: this.parent.uuid },
            );
            if (doIdentify) {
              ui.notifications.success(
                `${this.parent.name} was successfully identified.`,
              );
              return;
            }
          }
          ui.notifications.error(
            `${this.parent.name} was not successfully identified.`,
          );
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
          if (!this.identification.identified && !this.identification.read) {
            const activeGM = game.users.activeGM;
            foundry.ui.notifications.info(
              `Asking GMs to approve reading magic on ${this.parent.name}.`,
            );
            const content = await ux.TextEditor.enrichHTML(
              `<p>Should @UUID[${game.user.uuid}] read magic on @UUID[${this.parent.uuid}]{${this.identification.name}}?</p>`,
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
              await game.users.activeGM.query("teriock.update", {
                uuid: this.parent.uuid,
                data: {
                  "system.identification.read": true,
                  "system.powerLevel": this.identification.powerLevel,
                },
              });
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
          if (this.identification.identified && game.user.isGM) {
            const uncheckedPropertyNames =
              TERIOCK.options.equipment.unidentifiedProperties;
            if (
              Object.values(TERIOCK.index.equipment).includes(
                this.equipmentType,
              )
            ) {
              uncheckedPropertyNames.push(
                ...(await getItem(this.equipmentType, "equipment"))
                  .getProperties()
                  .map((p) => p.name),
              );
            }
            const revealed = [
              ...this.parent.getProperties().filter((p) => p.system.revealed),
              ...this.parent.getAbilities().filter((a) => a.system.revealed),
              ...this.parent.resources.filter((r) => r.system.revealed),
              ...this.parent.fluencies.filter((f) => f.system.revealed),
            ];
            const checked = revealed
              .filter(
                (e) =>
                  e.type !== "property" ||
                  !uncheckedPropertyNames.includes(e.name),
              )
              .map((e) => e.uuid);
            const toReveal = await selectDocumentsDialog(revealed, {
              hint: "Select effects to unreveal.",
              tooltipAsync: false,
              checked: checked,
            });
            await this.parent.updateEmbeddedDocuments(
              "ActiveEffect",
              toReveal.map((e) => {
                return {
                  _id: e._id,
                  "system.revealed": false,
                };
              }),
            );
            await this.parent.update({
              "system.flaws": "",
              "system.identification.flaws": this.flaws,
              "system.identification.identified": false,
              "system.identification.name": this.parent.name,
              "system.identification.notes": this.notes,
              "system.identification.powerLevel": this.powerLevel,
              "system.identification.read": false,
              "system.notes": "",
              "system.powerLevel": "unknown",
              name: "Unidentified " + this.equipmentType,
            });
          } else {
            foundry.ui.notifications.warn("This item is already unidentified.");
          }
        }
      }
    }
  );
};
