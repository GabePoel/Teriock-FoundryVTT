import { TeriockDialog } from "../../../../applications/api/_module.mjs";
import { selectDocumentsDialog } from "../../../../applications/dialogs/select-document-dialog.mjs";
import { getDocument } from "../../../../helpers/fetch.mjs";
import { makeIconClass, queryGM } from "../../../../helpers/utils.mjs";
import { TextField } from "../../../fields/_module.mjs";

const { ux } = foundry.applications;
const { fields } = foundry.data;

/**
 * Equipment data model mixin that handles identifying and reading magic.
 * @param {typeof TeriockEquipmentModel} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {TeriockEquipmentModel}
     */
    class EquipmentIdentificationPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        const schema = super.defineSchema();
        Object.assign(schema, {
          identification: new fields.SchemaField({
            flaws: new TextField({
              initial: "",
              label: "Unidentified Flaws",
              gmOnly: true,
              required: false,
            }),
            identified: new fields.BooleanField({
              initial: true,
              label: "Identified",
            }),
            name: new fields.StringField({
              initial: "",
              label: "Unidentified Name",
            }),
            notes: new TextField({
              initial: "",
              label: "Unidentified Notes",
              gmOnly: true,
              required: false,
            }),
            powerLevel: new fields.StringField({
              choices: TERIOCK.options.equipment.powerLevelShort,
              initial: "mundane",
              label: "Unidentified Power Level",
            }),
            read: new fields.BooleanField({
              initial: true,
              label: "Read",
            }),
          }),
        });
        return schema;
      }

      /** @inheritDoc */
      get displayFields() {
        return [
          {
            path: "system.identification.notes",
            visible: game.user.isGM && !this.identification.identified,
            classes: "faded-display-field",
          },
          {
            path: "system.identification.flaws",
            visible: game.user.isGM && !this.identification.identified,
            classes: "faded-display-field",
          },
          ...super.displayFields,
        ];
      }

      /**
       * Identifies the equipment, revealing all its properties.
       * @returns {Promise<void>} Promise that resolves when the equipment is identified.
       */
      async identify() {
        const data = { doc: this.parent };
        await this.parent.hookCall("equipmentIdentify", data);
        if (!data.cancel) {
          if (!this.identification.identified) {
            ui.notifications.info(
              `Asking GMs to approve identification of ${this.parent.name}.`,
            );
            const doIdentify = await queryGM(
              "teriock.identifyItem",
              {
                uuid: this.parent.uuid,
              },
              {
                failPrefix: "Could not ask to identify.",
              },
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

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        if (!this.identification.identified) {
          this.parent._stats.compendiumSource = null;
          this.parent._stats.duplicateSource = null;
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
            ui.notifications.info(
              `Asking GMs to approve reading magic on ${this.parent.name}.`,
            );
            const content = await ux.TextEditor.enrichHTML(
              `<p>Should @UUID[${game.user.uuid}] read magic on ` +
                `@UUID[${this.parent.uuid}]{${this.identification.name}}?</p>`,
            );
            const doReadMagic = await TeriockDialog.query(activeGM, "confirm", {
              content: content,
              modal: false,
              window: {
                icon: makeIconClass("magnifying-glass", "title"),
                title: "Read Magic",
              },
            });
            if (doReadMagic) {
              await queryGM(
                "teriock.update",
                {
                  uuid: this.parent.uuid,
                  data: {
                    "system.identification.read": true,
                    "system.powerLevel": this.identification.powerLevel,
                  },
                },
                {
                  failPrefix: "Could not ask to read magic.",
                },
              );
              ui.notifications.success(
                `${this.parent.name} was successfully read.`,
              );
            } else {
              ui.notifications.error(
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
                ...(
                  await getDocument(this.equipmentType, "equipment")
                ).properties.map((p) => p.name),
              );
            }
            const revealed = [
              ...this.parent.properties.filter((p) => p.system.revealed),
              ...this.parent.abilities.filter((a) => a.system.revealed),
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
            ui.notifications.warn("This item is already unidentified.");
          }
        }
      }
    }
  );
};
