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
          "TERIOCK.MODELS.Identification.QUERY.Identify.ask",
          {
            format: {
              name: this.parent.parent.nameString,
            },
            localize: true,
          },
        );
        const doIdentify = await game.users.queryGM(
          "teriock.identifyItem",
          {
            uuid: this.parent.parent.uuid,
          },
          {
            failPrefix:
              "TERIOCK.MODELS.Identification.QUERY.Identify.failPrefix",
            localize: true,
          },
        );
        if (doIdentify) {
          ui.notifications.success(
            "TERIOCK.MODELS.Identification.QUERY.Identify.success",
            {
              format: {
                name: this.parent.parent.nameString,
              },
              localize: true,
            },
          );
          return;
        }
      }
      ui.notifications.error(
        "TERIOCK.MODELS.Identification.QUERY.Identify.failure",
        {
          format: {
            name: this.parent.parent.nameString,
          },
          localize: true,
        },
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
          "TERIOCK.MODELS.Identification.QUERY.ReadMagic.ask",
          {
            format: {
              name: this.parent.parent.nameString,
            },
            localize: true,
          },
        );
        const content = await TeriockTextEditor.enrichHTML(
          game.i18n.format(
            "TERIOCK.MODELS.Identification.QUERY.ReadMagic.question",
            {
              user: `@UUID[${game.user.uuid}]`,
              item: `@UUID[${this.parent.parent.uuid}]{${this.name}}`,
            },
          ),
        );
        const doReadMagic = await TeriockDialog.query(activeGM, "confirm", {
          content: content,
          modal: false,
          window: {
            icon: makeIconClass(
              TERIOCK.display.icons.equipment.readMagic,
              "title",
            ),
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
              failPrefix:
                "TERIOCK.MODELS.Identification.QUERY.ReadMagic.failPrefix",
              localize: true,
            },
          );
          ui.notifications.success(
            "TERIOCK.MODELS.Identification.QUERY.ReadMagic.success",
            {
              format: {
                name: this.parent.parent.nameString,
              },
              localize: true,
            },
          );
        } else {
          ui.notifications.error(
            "TERIOCK.MODELS.Identification.QUERY.ReadMagic.failure",
            {
              format: {
                name: this.parent.parent.nameString,
              },
              localize: true,
            },
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
            "TERIOCK.MODELS.Identification.QUERY.Unidentify.hint",
          ),
          silent: true,
          tooltipAsync: false,
          noDocumentsMessage: game.i18n.localize(
            "TERIOCK.MODELS.Identification.QUERY.Unidentify.noDocumentsMessage",
          ),
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
          name: game.i18n.format(
            "TERIOCK.MODELS.Identification.QUERY.Unidentify.name",
            { type: this.parent.equipmentType },
          ),
        });
      } else {
        ui.notifications.warn(
          "TERIOCK.MODELS.Identification.QUERY.Unidentify.alreadyUnidentified",
          { localize: true },
        );
      }
    }
  }
}
