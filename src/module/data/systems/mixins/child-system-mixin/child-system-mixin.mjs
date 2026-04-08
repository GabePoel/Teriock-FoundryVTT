import { ucFirst } from "../../../../helpers/string.mjs";
import { makeIcon, mix } from "../../../../helpers/utils.mjs";
import { EvaluationField, TextField } from "../../../fields/_module.mjs";
import { ChildSettingsModel } from "../../../models/settings-models/_module.mjs";
import { UsableDataMixin } from "../../../shared/mixins/_module.mjs";
import {
  CommonSystemMixin,
  HierarchySystemMixin,
} from "../../mixins/_module.mjs";

const { fields } = foundry.data;
const { ImagePopout } = foundry.applications.apps;

/**
 * @param {typeof TypeDataModel} Base
 */
export default function ChildSystemMixin(Base) {
  return (
    /**
     * @extends {TypeDataModel}
     * @extends {Teriock.Models.ChildSystemData}
     * @mixes CommonSystem
     * @mixes UsableData
     * @mixes HierarchySystem
     * @mixin
     */
    class ChildSystem extends mix(
      Base,
      CommonSystemMixin,
      UsableDataMixin,
      HierarchySystemMixin,
    ) {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = super.LOCALIZATION_PREFIXES.concat(
        "TERIOCK.SYSTEMS.Child",
      );

      /** @inheritDoc */
      static PRESERVED_PROPERTIES = [
        "system.competence",
        "system.qualifiers",
        ...super.PRESERVED_PROPERTIES,
      ];

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          font: new fields.StringField({
            initial: "",
          }),
          description: new TextField({
            initial: "",
          }),
          qualifiers: new fields.SchemaField({
            ephemeral: new EvaluationField({
              deterministic: true,
              initial: "0",
            }),
            suppressed: new EvaluationField({
              deterministic: true,
              initial: "0",
            }),
          }),
        });
      }

      /** @inheritDoc */
      get _masterText() {
        return this.parent.master?.documentName === "Actor"
          ? ""
          : super._masterText;
      }

      /** @inheritDoc */
      get _settingsFlagsDataModel() {
        return ChildSettingsModel;
      }

      /** @returns {Teriock.Sheet.DisplayTag[]} */
      get displayTags() {
        return [
          {
            label: this.parent.active
              ? "TERIOCK.SHEETS.Common.TAGS.active"
              : "TERIOCK.SHEETS.Common.TAGS.inactive",
            tooltip: "TERIOCK.SHEETS.Child.DISPLAY.activeStatus",
          },
        ];
      }

      /** @returns {Teriock.Sheet.DisplayField[]} */
      get displayToggles() {
        return [];
      }

      /** @inheritDoc */
      get embedActions() {
        return Object.assign(super.embedActions, {
          useDoc: {
            primary: async (event, relative) => {
              await this.use({ event, actor: relative?.actor });
            },
            secondary: async (event, relative) => {
              await this.use({ event, actor: relative?.actor });
            },
          },
        });
      }

      /** @inheritDoc */
      get embedIcons() {
        return [
          ...super.embedIcons,
          {
            icon: TERIOCK.display.icons.ui.chat,
            action: "chatDoc",
            tooltip: game.i18n.localize(
              "TERIOCK.SYSTEMS.Child.MENU.shareWriteup",
            ),
            callback: async () => {
              await this.parent.toMessage();
            },
            condition: this.parent.isViewer,
          },
          {
            icon: this.parent.disabled
              ? TERIOCK.display.icons.ui.disabled
              : TERIOCK.display.icons.ui.enabled,
            action: "toggleDisabledDoc",
            callback: () => this.parent.toggleDisabled(),
            tooltip: this.parent.disabled
              ? game.i18n.localize("TERIOCK.SYSTEMS.Child.EMBED.disabled")
              : game.i18n.localize("TERIOCK.SYSTEMS.Child.EMBED.enabled"),
            condition: this.parent.isOwner,
          },
        ];
      }

      /** @inheritDoc */
      get embedParts() {
        return Object.assign(super.embedParts, {
          action: "useDoc",
          makeTooltip: true,
          struck: this.parent.disabled,
          usable: true,
        });
      }

      /** @returns {boolean} */
      get isUsable() {
        return this.constructor.metadata.usable;
      }

      /** @returns {boolean} */
      get makeEphemeral() {
        return (
          !!this.parent.elder?.isEphemeral || !!this.qualifiers.ephemeral.value
        );
      }

      /** @returns {boolean} */
      get makeSuppressed() {
        return (
          !!(this.parent.elder && !this.parent.elder?.active) ||
          !!this.qualifiers.suppressed.value ||
          !!this.parent.isEphemeral
        );
      }

      /**
       * @inheritDoc
       * @returns {ChildDocument}
       */
      get parent() {
        return /** @type {ChildDocument} */ super.parent;
      }

      /** @inheritDoc */
      get useText() {
        return game.i18n.format("TERIOCK.SYSTEMS.Child.USAGE.use", {
          value: this.parent.name,
        });
      }

      /** @inheritDoc */
      async _use(options = {}) {
        await this.parent.toMessage(options);
      }

      /** @inheritDoc */
      async deleteThis() {
        if (this.parent.parent) {
          await this.parent.parent.deleteEmbeddedDocuments(
            this.parent.documentName,
            [this.parent.id],
          );
        } else {
          await super.deleteThis();
        }
      }

      /** @inheritDoc */
      getCardContextMenuEntries(doc) {
        const entries = super.getCardContextMenuEntries(doc);
        entries.push(
          ...[
            {
              name: this.useText,
              icon: makeIcon(this.useIcon, "contextMenu"),
              callback: async () => {
                await this.use();
              },
              condition: this.isUsable,
              group: "usage",
            },
            {
              name: game.i18n.localize("TERIOCK.SYSTEMS.Child.MENU.enable"),
              icon: makeIcon(TERIOCK.display.icons.ui.enable, "contextMenu"),
              callback: this.parent.enable.bind(this.parent),
              condition:
                this.parent.parent?.isOwner &&
                this.parent.disabled &&
                this.parent.type !== "equipment" &&
                this.parent.type !== "mount" &&
                doc !== this.parent,
              group: "control",
            },
            {
              name: game.i18n.localize("TERIOCK.SYSTEMS.Child.MENU.disable"),
              icon: makeIcon(TERIOCK.display.icons.ui.disable, "contextMenu"),
              callback: this.parent.disable.bind(this.parent),
              condition:
                this.parent.parent?.isOwner &&
                !this.parent.disabled &&
                this.parent.type !== "equipment" &&
                this.parent.type !== "mount" &&
                !(this.parent.type === "ability" && this.isVirtual) &&
                doc !== this.parent,
              group: "control",
            },
            {
              name: game.i18n.localize(
                "TERIOCK.SYSTEMS.Child.MENU.openGmNotes",
              ),
              icon: makeIcon(TERIOCK.display.icons.ui.notes, "contextMenu"),
              callback: async () => {
                await this.gmNotesOpen();
              },
              condition: game.user.isGM,
              group: "open",
            },
            {
              name: game.i18n.localize("TERIOCK.SYSTEMS.Child.MENU.openImage"),
              icon: makeIcon(TERIOCK.display.icons.ui.image, "contextMenu"),
              callback: async () => {
                await new ImagePopout({
                  src: this.parent.img,
                  uuid: this.parent.uuid,
                  window: { title: this.parent.fullName },
                }).render(true);
              },
              group: "open",
            },
            {
              name: game.i18n.localize("TERIOCK.SYSTEMS.Child.MENU.shareImage"),
              icon: makeIcon(
                TERIOCK.display.icons.ui.shareImage,
                "contextMenu",
              ),
              callback: this.parent.chatImage.bind(this.parent),
              group: "share",
            },
            {
              name: game.i18n.localize(
                "TERIOCK.SYSTEMS.Child.MENU.shareWriteup",
              ),
              icon: makeIcon(TERIOCK.display.icons.ui.shareText, "contextMenu"),
              callback: this.parent.toMessage.bind(this.parent),
              group: "share",
            },
            {
              name: game.i18n.localize("TERIOCK.SYSTEMS.Common.MENU.duplicate"),
              icon: makeIcon(TERIOCK.display.icons.ui.duplicate, "contextMenu"),
              callback: async () => {
                await this.parent.duplicate();
              },
              condition: () =>
                this.parent._checkValidEditorDocument(doc, { self: false }),
              group: "document",
            },
          ],
        );
        return entries;
      }

      /** @inheritDoc */
      getLocalRollData() {
        return {
          ...super.getLocalRollData(),
          flu: Number(this.competence?.fluent),
          pro: Number(this.competence?.proficient),
          c: this.competence.bonus,
        };
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        this.qualifiers.suppressed.evaluate();
        this.qualifiers.ephemeral.evaluate();
        this.boosts = /** @type {Record<Teriock.Keys.Impact, string>} */ {};
      }

      /** @inheritDoc */
      async use(options = {}) {
        await this.parent.hookCall("use");
        Hooks.callAll(
          "teriock.use" + ucFirst(this.parent.type) + this.parent.type.slice(1),
          [this.parent],
        );
        await super.use(options);
      }
    }
  );
}
