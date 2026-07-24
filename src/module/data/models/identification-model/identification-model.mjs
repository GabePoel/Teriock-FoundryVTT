import { TeriockDialog } from "../../../applications/api/_module.mjs";
import { DocumentSelector } from "../../../applications/dialogs/_module.mjs";
import { TeriockTextEditor } from "../../../applications/ux/_module.mjs";
import { makeIconClass } from "../../../helpers/icon.mjs";
import { buildWriteOperation, fromIdentifier, getName, objectMap } from "../../../helpers/utils.mjs";
import { BaseDataModel } from "../../abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * @extends {Teriock.Models.IdentificationModelData}
 */
export default class IdentificationModel extends BaseDataModel {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.MODELS.Identification"];

  /** @inheritDoc */
  static defineSchema() {
    return {
      flaws: new fields.HTMLField({ gmOnly: true, initial: "", required: false }),
      identified: new fields.BooleanField({ initial: true }),
      name: new fields.StringField({ gmOnly: true, initial: "" }),
      notes: new fields.HTMLField({ gmOnly: true, initial: "", required: false }),
      powerLevel: new fields.StringField({
        blank: false,
        choices: objectMap(TERIOCK.config.equipment.powerLevel, e => e.label),
        gmOnly: true,
        initial: "mundane",
        nullable: false,
        required: true,
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
    await this.parent.parent.hookCall("identify", { scope: { equipment: this.parent.parent } });
    if (!this.identified) {
      ui.notifications.info("TERIOCK.MODELS.Identification.QUERY.Identify.ask", {
        format: { name: this.parent.parent.fullName },
        localize: true,
      });
      const doIdentify = await game.users.queryGM("teriock.identifyItem", { uuid: this.parent.parent.uuid }, {
        failPrefix: "TERIOCK.MODELS.Identification.QUERY.Identify.failPrefix",
        localize: true,
      });
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
    await this.parent.parent.hookCall("readMagic", { scope: { equipment: this.parent.parent } });
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
        content,
        modal: false,
        window: {
          icon: makeIconClass(TERIOCK.display.icons.equipment.readMagic, "title"),
          title: _loc("TERIOCK.MODELS.Identification.QUERY.ReadMagic.title"),
        },
      });
      if (doReadMagic) {
        await this.document.update({ "system.identification.read": true, "system.powerLevel": this.powerLevel }, {
          asGM: true,
        });
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
      const reference = await fromIdentifier(this.parent.equipmentType);
      if (reference) { uncheckedPropertyIdentifiers.push(...reference.properties.map(p => p.system.identifier)); }
      const revealed = [
        ...this.parent.parent.properties.filter(p => p.system.revealed),
        ...this.parent.parent.abilities.filter(a => a.system.revealed),
        ...this.parent.parent.resources.filter(r => r.system.revealed),
        ...this.parent.parent.fluencies.filter(f => f.system.revealed),
      ];
      const checked = revealed.filter(e =>
        e.type !== "property" || !uncheckedPropertyIdentifiers.includes(e.system.identifier)
      ).map(e => e.uuid);
      const toReveal = await DocumentSelector.selectMulti(revealed, {
        checked,
        hint: _loc("TERIOCK.MODELS.Identification.QUERY.Unidentify.hint"),
        noDocumentsMessage: _loc("TERIOCK.MODELS.Identification.QUERY.Unidentify.noDocumentsMessage"),
        silent: true,
      });
      const revealOperation = this.parent.parent.getUpdateChildDocumentsOperation(
        "ActiveEffect",
        toReveal.map(e => {
          return { _id: e._id, "system.revealed": false };
        }),
      );
      const itemOperation = await buildWriteOperation({
        action: "update",
        docData: {
          name: _loc("TERIOCK.MODELS.Identification.QUERY.Unidentify.name", {
            type: getName(this.parent.equipmentType),
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
        },
        uuid: this.parent.parent.uuid,
      });
      await foundry.documents.modifyBatch([revealOperation, itemOperation].filter(Boolean));
    } else {
      ui.notifications.warn("TERIOCK.MODELS.Identification.QUERY.Unidentify.alreadyUnidentified", { localize: true });
    }
  }
}
