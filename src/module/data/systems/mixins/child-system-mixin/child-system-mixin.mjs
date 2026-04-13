import { mix } from "../../../../helpers/construction.mjs";
import { ucFirst } from "../../../../helpers/string.mjs";
import { makeIcon } from "../../../../helpers/utils.mjs";
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
      get SettingsFlagsDataModel() {
        return ChildSettingsModel;
      }

      /** @inheritDoc */
      get _masterText() {
        return this.parent.master?.documentName === "Actor"
          ? ""
          : super._masterText;
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
            tooltip: _loc("TERIOCK.SYSTEMS.Child.MENU.shareWriteup"),
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
              ? _loc("TERIOCK.SYSTEMS.Child.EMBED.disabled")
              : _loc("TERIOCK.SYSTEMS.Child.EMBED.enabled"),
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
        return _loc("TERIOCK.SYSTEMS.Child.USAGE.use", {
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
              label: this.useText,
              icon: makeIcon(this.useIcon, "contextMenu"),
              onClick: async () => {
                await this.use();
              },
              visible: this.isUsable,
              group: "usage",
            },
            {
              label: _loc("TERIOCK.SYSTEMS.Child.MENU.enable"),
              icon: makeIcon(TERIOCK.display.icons.ui.enable, "contextMenu"),
              onClick: this.parent.enable.bind(this.parent),
              visible:
                this.parent.parent?.isOwner &&
                this.parent.disabled &&
                this.parent.type !== "equipment" &&
                this.parent.type !== "mount" &&
                doc !== this.parent,
              group: "control",
            },
            {
              label: _loc("TERIOCK.SYSTEMS.Child.MENU.disable"),
              icon: makeIcon(TERIOCK.display.icons.ui.disable, "contextMenu"),
              onClick: this.parent.disable.bind(this.parent),
              visible:
                this.parent.parent?.isOwner &&
                !this.parent.disabled &&
                this.parent.type !== "equipment" &&
                this.parent.type !== "mount" &&
                !(this.parent.type === "ability" && this.isVirtual) &&
                doc !== this.parent,
              group: "control",
            },
            {
              label: _loc("TERIOCK.SYSTEMS.Child.MENU.openGmNotes"),
              icon: makeIcon(TERIOCK.display.icons.ui.notes, "contextMenu"),
              onClick: async () => {
                await this.gmNotesOpen();
              },
              visible: game.user.isGM,
              group: "open",
            },
            {
              label: _loc("TERIOCK.SYSTEMS.Child.MENU.openImage"),
              icon: makeIcon(TERIOCK.display.icons.ui.image, "contextMenu"),
              onClick: async () => {
                await new ImagePopout({
                  src: this.parent.img,
                  uuid: this.parent.uuid,
                  window: { title: this.parent.fullName },
                }).render(true);
              },
              group: "open",
            },
            {
              label: _loc("TERIOCK.SYSTEMS.Child.MENU.shareImage"),
              icon: makeIcon(
                TERIOCK.display.icons.ui.shareImage,
                "contextMenu",
              ),
              onClick: this.parent.chatImage.bind(this.parent),
              group: "share",
            },
            {
              label: _loc("TERIOCK.SYSTEMS.Child.MENU.shareWriteup"),
              icon: makeIcon(TERIOCK.display.icons.ui.shareText, "contextMenu"),
              onClick: this.parent.toMessage.bind(this.parent),
              group: "share",
            },
            {
              label: _loc("TERIOCK.SYSTEMS.Common.MENU.duplicate"),
              icon: makeIcon(TERIOCK.display.icons.ui.duplicate, "contextMenu"),
              onClick: async () => {
                await this.parent.duplicate();
              },
              visible: () =>
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
