import { TeriockDialog } from "../../../applications/api/_module.mjs";
import { selectDocumentsDialog } from "../../../applications/dialogs/select-document-dialog.mjs";
import { TeriockTextEditor } from "../../../applications/ux/_module.mjs";
import { getDocument } from "../../../helpers/fetch.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";
import { TextField } from "../../fields/_module.mjs";
import EmbeddedDataModel from "../embedded-data-model.mjs";

const { fields } = foundry.data;

//noinspection JSClosureCompilerSyntax
/**
 * @implements {Teriock.Models.IdentificationModelInterface}
 */
export default class IdentificationModel extends EmbeddedDataModel {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.MODELS.Identification",
  ];

  /** @inheritDoc */
  static defineSchema() {
    return {
      flaws: new TextField({
        initial: "",
        gmOnly: true,
        required: false,
      }),
      identified: new fields.BooleanField({
        initial: true,
      }),
      name: new fields.StringField({
        initial: "",
      }),
      notes: new TextField({
        initial: "",
        gmOnly: true,
        required: false,
      }),
      powerLevel: new fields.StringField({
        choices: TERIOCK.options.equipment.powerLevelShort,
        initial: "mundane",
      }),
      read: new fields.BooleanField({ initial: true }),
    };
  }

  /** @returns {EquipmentSystem} */
  get parent() {
    return /** @type {EquipmentSystem} */ super.parent;
  }

  /**
   * Identifies the equipment, revealing all its properties.
   * @returns {Promise<void>}
   */
  async identify() {
    const data = { doc: this.parent.parent };
    await this.parent.parent.hookCall("equipmentIdentify", data);
    if (!data.cancel) {
      if (!this.identified) {
        ui.notifications.info(
          game.i18n.format("TERIOCK.MODELS.Identification.QUERY.Identify.ask", {
            name: this.parent.parent.nameString,
          }),
        );
        const doIdentify = await game.users.queryGM(
          "teriock.identifyItem",
          {
            uuid: this.parent.parent.uuid,
          },
          {
            failPrefix: game.i18n.localize(
              "TERIOCK.MODELS.Identification.QUERY.Identify.failPrefix",
            ),
          },
        );
        if (doIdentify) {
          ui.notifications.success(
            game.i18n.format(
              "TERIOCK.MODELS.Identification.QUERY.Identify.success",
              {
                name: this.parent.parent.nameString,
              },
            ),
          );
          return;
        }
      }
      ui.notifications.error(
        game.i18n.format(
          "TERIOCK.MODELS.Identification.QUERY.Identify.failure",
          {
            name: this.parent.parent.nameString,
          },
        ),
      );
    }
  }

  /**
   * Reads magic on the equipment to reveal its properties.
   * @returns {Promise<void>}
   */
  async readMagic() {
    const data = { doc: this.parent.parent };
    await this.parent.parent.hookCall("equipmentReadMagic", data);
    if (!data.cancel) {
      if (!this.identified && !this.read) {
        const activeGM = game.users.activeGM;
        ui.notifications.info(
          game.i18n.format(
            "TERIOCK.MODELS.Identification.QUERY.ReadMagic.ask",
            {
              name: this.parent.parent.nameString,
            },
          ),
        );
        const content = await TeriockTextEditor.enrichHTML(
          `<p>Should @UUID[${game.user.uuid}] read magic on ` +
            `@UUID[${this.parent.parent.uuid}]{${this.name}}?</p>`,
        );
        const doReadMagic = await TeriockDialog.query(activeGM, "confirm", {
          content: content,
          modal: false,
          window: {
            icon: makeIconClass("magnifying-glass", "title"),
            title: game.i18n.localize(
              "TERIOCK.MODELS.Identification.QUERY.ReadMagic.title",
            ),
          },
        });
        if (doReadMagic) {
          await game.users.queryGM(
            "teriock.update",
            {
              uuid: this.parent.parent.uuid,
              data: {
                "system.identification.read": true,
                "system.powerLevel": this.powerLevel,
              },
            },
            {
              failPrefix: game.i18n.localize(
                "TERIOCK.MODELS.Identification.QUERY.ReadMagic.failPrefix",
              ),
            },
          );
          ui.notifications.success(
            game.i18n.format(
              "TERIOCK.MODELS.Identification.QUERY.ReadMagic.success",
              {
                name: this.parent.parent.nameString,
              },
            ),
          );
        } else {
          ui.notifications.error(
            game.i18n.format(
              "TERIOCK.MODELS.Identification.QUERY.ReadMagic.failure",
              {
                name: this.parent.parent.nameString,
              },
            ),
          );
        }
      }
    }
  }

  /**
   * Removes identification from the equipment.
   * @returns {Promise<void>}
   */
  async unidentify() {
    const data = { doc: this.parent.parent };
    await this.parent.parent.hookCall("equipmentUnidentify", data);
    if (!data.cancel) {
      if (this.identified && game.user.isGM) {
        const uncheckedPropertyNames =
          TERIOCK.options.equipment.unidentifiedProperties;
        if (
          Object.values(TERIOCK.index.equipment).includes(
            this.parent.equipmentType,
          )
        ) {
          uncheckedPropertyNames.push(
            ...(
              await getDocument(this.parent.equipmentType, "equipment")
            ).properties.map((p) => p.name),
          );
        }
        const revealed = [
          ...this.parent.parent.properties.filter((p) => p.system.revealed),
          ...this.parent.parent.abilities.filter((a) => a.system.revealed),
          ...this.parent.parent.resources.filter((r) => r.system.revealed),
          ...this.parent.parent.fluencies.filter((f) => f.system.revealed),
        ];
        const checked = revealed
          .filter(
            (e) =>
              e.type !== "property" || !uncheckedPropertyNames.includes(e.name),
          )
          .map((e) => e.uuid);
        const toReveal = await selectDocumentsDialog(revealed, {
          checked: checked,
          hint: game.i18n.localize(
            "TERIOCK.MODELS.Identification.Query.Unidentify.hint",
          ),
          tooltipAsync: false,
        });
        await this.parent.parent.updateEmbeddedDocuments(
          "ActiveEffect",
          toReveal.map((e) => {
            return {
              _id: e._id,
              "system.revealed": false,
            };
          }),
        );
        await this.parent.parent.update({
          "system.flaws": "",
          "system.identification.flaws": this.parent.flaws,
          "system.identification.identified": false,
          "system.identification.name": this.parent.parent.name,
          "system.identification.notes": this.parent.notes,
          "system.identification.powerLevel": this.parent.powerLevel,
          "system.identification.read": false,
          "system.notes": "",
          "system.powerLevel": "unknown",
          name: "Unidentified " + this.parent.equipmentType,
        });
      } else {
        ui.notifications.warn("This item is already unidentified.");
      }
    }
  }
}
