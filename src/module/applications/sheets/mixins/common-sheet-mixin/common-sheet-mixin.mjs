import { mix } from "../../../../helpers/utils.mjs";
import { bindCommonActions } from "../../../shared/_module.mjs";
import { TeriockTextEditor } from "../../../ux/_module.mjs";
import { ConfigButtonSheetMixin, IndexButtonSheetMixin } from "../_module.mjs";
import * as parts from "./parts/_module.mjs";

/**
 * {@link TeriockCommon} sheet mixin.
 * @param {typeof TeriockDocumentSheet} Base - The base application class to mix in with.
 */
export default function CommonSheetMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @implements {CommonSheetMixinInterface}
     * @extends {TeriockDocumentSheet}
     * @mixes DocumentCreationCommonSheetPart
     * @mixes DragDropCommonSheetPart
     * @mixes FieldsCommonSheetPart
     * @mixes GmNotesCommonSheetPart
     * @mixes ImageEditingCommonSheetPart
     * @mixes AutomationsTabsCommonSheetPart
     * @mixes InteractionCommonSheetPart
     * @mixes LockingCommonSheetPart
     * @mixes MenuCommonSheetPart
     * @mixes StatDiceCommonSheetPart
     * @mixes ToggleCommonSheetPart
     * @mixin
     * @property {GenericCommon} document
     */
    class CommonSheet extends mix(
      Base,
      ConfigButtonSheetMixin,
      parts.ConnectionCommonSheetPart,
      parts.DragDropCommonSheetPart,
      parts.DocumentCreationCommonSheetPart,
      parts.FieldsCommonSheetPart,
      parts.GmNotesCommonSheetPart,
      parts.ImageEditingCommonSheetPart,
      parts.AutomationsTabsCommonSheetPart,
      parts.InteractionCommonSheetPart,
      parts.LockingCommonSheetPart,
      parts.MenuCommonSheetPart,
      parts.StatDiceCommonSheetPart,
      parts.ToggleCommonSheetPart,
      parts.AutomationsCommonSheetPart,
      IndexButtonSheetMixin,
    ) {
      /** @type {Partial<ApplicationConfiguration>} */
      static DEFAULT_OPTIONS =
        /** @type {Partial<ApplicationConfiguration>} */ {
          actions: {
            openDoc: this._onOpenDoc,
          },
          form: {
            closeOnSubmit: false,
            submitOnChange: true,
          },
          position: {
            height: 600,
            width: 560,
          },
          window: {
            resizable: true,
          },
        };

      /**
       * Creates a new Teriock sheet instance.
       * Initializes sheet state including settings.
       * @param {...any} args - Arguments to pass to the base constructor.
       */
      constructor(...args) {
        super(...args);
        this.settings = {};
      }

      /**
       * Open a linked document.
       * @param {PointerEvent} _event
       * @param {HTMLEmbedElement} target
       * @returns {Promise<void>}
       */
      static async _onOpenDoc(_event, target) {
        const uuid = target.dataset.uuid;
        const doc = await fromUuid(uuid);
        await doc.sheet.render(true);
      }

      /**
       * Enriches HTML content for display.
       * @param {string} parameter - The HTML content to enrich.
       * @returns {Promise<string|undefined>} Promise that resolves to the enriched HTML or undefined.
       */
      async _enrich(parameter) {
        return parameter?.length
          ? await TeriockTextEditor.enrichHTML(parameter, {
              relativeTo: this.document,
            })
          : undefined;
      }

      /** @inheritDoc */
      async _onRender(context, options) {
        await super._onRender(context, options);
        bindCommonActions(this.element);
        this._connect("[data-debug]", "contextmenu", () => {
          if (game.settings.get("teriock", "developerMode")) {
            console.log("Debug", this.document, this);
          }
        });
        this.element.querySelectorAll(".teriock-block[data-uuid]").forEach(
          /** @param {HTMLElement} el */ (el) => {
            const uuid = el.dataset.uuid;
            fromUuid(uuid).then((doc) => doc?.onEmbed(el));
          },
        );
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        const context = await super._prepareContext(options);
        let children = await this.document.getVisibleChildren();
        children = children.filter((c) => {
          if (foundry.utils.hasProperty(c, "system.revealed")) {
            return (
              foundry.utils.getProperty(c, "system.revealed") || game.user.isGM
            );
          } else {
            return true;
          }
        });
        for (const [type, options] of Object.entries(
          TERIOCK.options.document,
        )) {
          if (options.getter) {
            context[options["getter"]] = TERIOCK.options.document[type].sorter(
              children.filter((c) => c.type === type),
            );
          }
        }
        Object.assign(context, {
          TERIOCK: TERIOCK,
          document: this.document,
          editable: this.isEditable,
          enriched: {},
          fields: this.document.schema.fields,
          flags: this.document.flags,
          hasMenu: true,
          id: this.document.id,
          img: this.document.img,
          imgPath: "img",
          isGM: game.user.isGM,
          limited: this.document.limited,
          metadata: this.document.metadata,
          name: this.document.name,
          owner: this.document.isOwner,
          settings: this.settings,
          sheetId: this.id,
          source: this.document._source,
          system: this.document.system,
          systemFields: this.document.system.schema.fields,
          systemSource: this.document.system._source,
          uuid: this.document.uuid,
        });
        return context;
      }

      /** @inheritDoc */
      async _renderFrame(options = {}) {
        const frame = await super._renderFrame(options);
        if (this.document.inCompendium) {
          this.window.header.style.backgroundColor =
            "var(--compendium-sheet-header-background-color)";
        }
        return frame;
      }
    }
  );
}
