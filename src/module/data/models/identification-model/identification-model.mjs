import { TeriockDialog } from "../../../applications/api/_module.mjs";
import { selectDocumentsDialog } from "../../../applications/dialogs/select-document-dialog.mjs";
import { TeriockTextEditor } from "../../../applications/ux/_module.mjs";
import { toCamelCase } from "../../../helpers/string.mjs";
import { fromIdentifier, inferNameFromIdentifier, makeIconClass, objectMap } from "../../../helpers/utils.mjs";
import { TextField } from "../../fields/_module.mjs";
import EmbeddedDataModel from "../embedded-data-model.mjs";

const { fields } = foundry.data;

/**
 * @extends {Teriock.Models.IdentificationModelData}
 */
export default class IdentificationModel extends EmbeddedDataModel {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.MODELS.Identification"];

  /** @inheritDoc */
  static defineSchema() {
    return {
      flaws: new TextField({
        gmOnly: true,
        initial: "",
        required: false,
      }),
      identified: new fields.BooleanField({ initial: true }),
      name: new fields.StringField({ initial: "" }),
      notes: new TextField({
        gmOnly: true,
        initial: "",
        required: false,
      }),
      powerLevel: new fields.StringField({
        choices: objectMap(TERIOCK.config.equipment.powerLevel, e => e.label),
        initial: "mundane",
      }),
      read: new fields.BooleanField({ initial: true }),
    };
  }

  /**
   * Identifies the equipment.
   *
   * Relevant wiki pages:
   * - [Identify](https://wiki.teriock.com/index.php/Ability:Identify)
   *
   * @returns {Promise<void>}
   */
  async identify() {
    await this.parent.parent.hookCall("identify", {
      scope: {
        equipment: this.parent.parent,
      },
    });
    if (!this.identified) {
      ui.notifications.info("TERIOCK.MODELS.Identification.QUERY.Identify.ask", {
        format: { name: this.parent.parent.fullName },
        localize: true,
      });
      const doIdentify = await game.users.queryGM(
        "teriock.identifyItem",
        { uuid: this.parent.parent.uuid },
        {
          failPrefix: "TERIOCK.MODELS.Identification.QUERY.Identify.failPrefix",
          localize: true,
        },
      );
      if (doIdentify) {
        ui.notifications.success("TERIOCK.MODELS.Identification.QUERY.Identify.success", {
          format: { name: this.parent.parent.fullName },
          localize: true,
        });
        return;
      }
    }
    ui.notifications.error("TERIOCK.MODELS.Identification.QUERY.Identify.failure", {
      format: { name: this.parent.parent.fullName },
      localize: true,
    });
  }

  /**
   * Reads magic on the equipment.
   *
   * Relevant wiki pages:
   * - [Read Magic](https://wiki.teriock.com/index.php/Ability:Read_Magic)
   * - [Magic](https://wiki.teriock.com/index.php/Property:Magic)
   *
   * @returns {Promise<void>}
   */
  async readMagic() {
    await this.parent.parent.hookCall("readMagic", {
      scope: { equipment: this.parent.parent },
    });
    if (!this.identified && !this.read) {
      const activeGM = game.users.activeGM;
      ui.notifications.info("TERIOCK.MODELS.Identification.QUERY.ReadMagic.ask", {
        format: { name: this.parent.parent.fullName },
        localize: true,
      });
      const content = await TeriockTextEditor.enrichHTML(
        _loc("TERIOCK.MODELS.Identification.QUERY.ReadMagic.question", {
          item: `@UUID[${this.parent.parent.uuid}]{${this.name}}`,
          user: game.user.link,
        }),
      );
      const doReadMagic = await TeriockDialog.query(activeGM, "confirm", {
        content: content,
        modal: false,
        window: {
          icon: makeIconClass(TERIOCK.display.icons.equipment.readMagic, "title"),
          title: _loc("TERIOCK.MODELS.Identification.QUERY.ReadMagic.title"),
        },
      });
      if (doReadMagic) {
        await this.document.update(
          {
            "system.identification.read": true,
            "system.powerLevel": this.powerLevel,
          },
          { asGM: true },
        );
        ui.notifications.success("TERIOCK.MODELS.Identification.QUERY.ReadMagic.success", {
          format: { name: this.parent.parent.fullName },
          localize: true,
        });
      } else {
        ui.notifications.error("TERIOCK.MODELS.Identification.QUERY.ReadMagic.failure", {
          format: { name: this.parent.parent.fullName },
          localize: true,
        });
      }
    }
  }

  /**
   * Removes identification from the equipment.
   *
   * Relevant wiki pages:
   * - [Identify](https://wiki.teriock.com/index.php/Ability:Identify)
   *
   * @returns {Promise<void>}
   */
  async unidentify() {
    if (this.identified && game.user.isGM) {
      const uncheckedPropertyIdentifiers = [...TERIOCK.config.equipment.unidentifiedProperties];
      if (Object.keys(TERIOCK.index.equipment).includes(toCamelCase(this.parent.equipmentType))) {
        const reference = await fromIdentifier(`equipment:${this.parent.equipmentType}`);
        if (reference) {
          uncheckedPropertyIdentifiers.push(...reference.properties.map(p => p.system.identifier));
        }
      }
      const revealed = [
        ...this.parent.parent.properties.filter(p => p.system.revealed),
        ...this.parent.parent.abilities.filter(a => a.system.revealed),
        ...this.parent.parent.resources.filter(r => r.system.revealed),
        ...this.parent.parent.fluencies.filter(f => f.system.revealed),
      ];
      const checked = revealed
        .filter(e => e.type !== "property" || !uncheckedPropertyIdentifiers.includes(e.system.identifier))
        .map(e => e.uuid);
      const toReveal = await selectDocumentsDialog(revealed, {
        checked: checked,
        hint: _loc("TERIOCK.MODELS.Identification.QUERY.Unidentify.hint"),
        noDocumentsMessage: _loc("TERIOCK.MODELS.Identification.QUERY.Unidentify.noDocumentsMessage"),
        silent: true,
        tooltipAsync: false,
      });
      await this.parent.parent.updateEmbeddedDocuments(
        "ActiveEffect",
        toReveal.map(e => {
          return { _id: e._id, "system.revealed": false };
        }),
      );
      await this.parent.parent.update({
        name: _loc("TERIOCK.MODELS.Identification.QUERY.Unidentify.name", {
          type: this.parent.equipmentTypeName,
        }),
        "system.flaws": "",
        "system.identification.flaws": this.parent.flaws,
        "system.identification.identified": false,
        "system.identification.name": this.parent.parent.name,
        "system.identification.notes": this.parent.notes,
        "system.identification.powerLevel": this.parent.powerLevel,
        "system.identification.read": false,
        "system.notes": "",
        "system.powerLevel": "unknown",
      });
    } else {
      ui.notifications.warn("TERIOCK.MODELS.Identification.QUERY.Unidentify.alreadyUnidentified", { localize: true });
    }
  }
}
