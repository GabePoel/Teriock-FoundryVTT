import { checkFieldVisibility, fancifyFields } from "../../../utils/_module.mjs";
import { TeriockTextEditor } from "../../ux/_module.mjs";

const { ImagePopout } = foundry.applications.apps;

/**
 * @import { ApplicationConfiguration, ApplicationRenderOptions } from "@client/applications/_types.mjs";
 * @import { HandlebarsTemplatePart } from "@client/applications/api/handlebars-application.mjs";
 * @import { BaseSheet } from "@client/applications/sheets/_module.mjs";
 * @import { DataSchema } from "@common/abstract/_types.mjs";
 */

/**
 * Mixin that displays the parts of sheets configured in document systems.
 * @template {MixinBase<typeof BaseSheet>} T
 * @param {T} Base
 */
export default function DisplaySheetMixin(Base) {
  /** @mixin */
  class DisplaySheet extends Base {
    /**
     * Apply the selected add option.
     * @param {PointerEvent} _event
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     * @this {DisplaySheet}
     */
    static async #onAddOption(_event, target) {
      const option = this.#addOptions.find(o => o.value === target.previousElementSibling.value);
      if (this.isEditable && option) { await this.document.update(option.update); }
    }

    /**
     * Open the image for this document.
     * @returns {Promise<void>}
     */
    static async #onOpenImage() {
      await new ImagePopout({ src: this.document.img, window: { title: "TERIOCK.SYSTEMS.Child.MENU.imagePreview" } })
        .render(true);
    }

    /** @type {Record<string, HandlebarsTemplatePart>} */
    static CONTENT_PARTS = {
      content: { template: "teriock/sheets/shared/content", templates: ["templates/generic/tab-navigation.hbs"] },
    };

    /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
    static DEFAULT_OPTIONS = {
      actions: { addOption: this.#onAddOption, openImage: this.#onOpenImage },
      classes: ["unpadded"],
    };

    /** @type {Record<string, HandlebarsTemplatePart>} */
    static HEADER_PARTS = { header: { template: "teriock/sheets/shared/top" } };

    /** @type {Record<string, HandlebarsTemplatePart>} */
    static MENU_PARTS = {
      menu: { template: "teriock/sheets/shared/simple-menu", templates: ["templates/generic/tab-navigation.hbs"] },
    };

    /** @type {Record<string, HandlebarsTemplatePart>} */
    static DISPLAY_PARTS = { ...this.HEADER_PARTS, ...this.MENU_PARTS, ...this.CONTENT_PARTS };

    /**
     * Options for adding fields and values from the sheet menu.
     * @type {(Teriock.Display.DisplayButton & { value: string })[]}
     */
    #addOptions = [];

    /**
     * Expand fancy display fields into their schema and value.
     * @param {Teriock.Display.DisplayField[]} fields
     * @returns {(Teriock.Display.FancyDisplayField & { schema: DataSchema; value: any })[]}
     */
    #expandFields(fields) {
      return fancifyFields(fields).map(f => {
        const schema = this.document?.getFieldForProperty(f.path);
        return {
          ...f,
          choices: f.choices || schema?.choices,
          label: f.label || _loc(schema?.label),
          model: this.document.system,
          schema,
          value: foundry.utils.getProperty(this.document._source, f.path)
            ?? foundry.utils.getProperty(this.document, f.path),
        };
      }).filter(f => checkFieldVisibility(f.schema, this.document));
    }

    /**
     * Prepare display tags.
     * @param {Teriock.Display.DisplayTag[]} tags
     * @returns {Teriock.Display.FancyDisplayTag[]}
     */
    #expandTags(tags) {
      const defaultTooltip = _loc("TERIOCK.SHEETS.Child.DISPLAY.defaultTagTooltip");
      return tags.map(t =>
        typeof t === "string"
          ? { label: _loc(t), tooltip: defaultTooltip }
          : { label: _loc(t.label), tooltip: _loc(t.tooltip) }
      );
    }

    /**
     * Prepare menu toggles, inputs, add options, etc.
     * @param {Teriock.Display.FancyDisplayField[]} emptyFields - Display fields that can be added.
     * @returns {object[]}
     */
    #prepareMenuSections(emptyFields) {
      const { groups, subgroups } = TERIOCK.CONFIG.display;
      const text = `<p>${_loc("TERIOCK.SHEETS.Child.DEFAULTS.populateField")}</p>`;
      this.#addOptions = [
        ...emptyFields.filter(f => f.editable).map(f => ({
          group: f.group,
          label: f.button || f.label,
          subgroup: f.subgroup,
          update: { [f.path]: text },
          value: f.path,
        })),
        ...this.document.system._displayButtons.map(b => ({ ...b, label: _loc(b.label), value: b.button })),
      ];
      const fields = [
        ...this.#expandFields(this.document.system._displayToggles).map(f => ({ ...f, kind: "toggles" })),
        ...this.#expandFields(this.document.system._displayInputs).map(f => ({ ...f, kind: "inputs" })),
        ...this.#addOptions.map(o => ({ ...o, kind: "adds" })),
      ];
      const order = Object.keys(groups);
      const sections = [...Map.groupBy(fields, f => f.group ?? "general")].sort(([a], [b]) =>
        order.indexOf(a) - order.indexOf(b)
      ).map(([id, group]) => {
        group.sort((a, b) => (a.label ?? "").localeCompare(b.label ?? "", game.i18n.lang));
        const { adds = [], inputs, toggles } = Object.groupBy(group, f => f.kind);
        return {
          adds: adds.map(({ label, subgroup, value }) => ({ group: subgroups[subgroup ?? "overview"], label, value })),
          group: "menu",
          id,
          inputs,
          label: groups[id],
          toggles,
        };
      });
      const active = sections.find(s => s.id === this.tabGroups.menu) ?? sections[0];
      if (active) {
        active.cssClass = "active";
        this.tabGroups.menu = active.id;
      }
      return sections;
    }

    /** @inheritDoc */
    _assignScrollableIds(root = this.element) {
      super._assignScrollableIds(root);
      // A dumb hack for when the scroll position jumps to the bottom below the menu.
      // TODO: Do a real fix some day.
      if (this.window?.content) { this.window.content.dataset.scrollableId ??= "window-content"; }
    }

    /**
     * @inheritDoc
     * @param {ApplicationRenderOptions} options
     */
    _configureRenderOptions(options) {
      super._configureRenderOptions(options);
      if (this._tab !== "overview") { options.parts.findSplice(p => p === "menu"); }
    }

    /** @inheritDoc */
    async _prepareContext(options = {}) {
      const context = await super._prepareContext(options);
      await this._prepareDisplayFields(context);
      context.displayTags = this.#expandTags(this.document.system._displayTags);
      return context;
    }

    /**
     * Prepare display fields.
     * @param {object} context
     * @returns {Promise<void>}
     */
    async _prepareDisplayFields(context) {
      const expandedDisplayFields = this.#expandFields(this.document.system._displayFields);
      const [emptyFields, valueFields] = expandedDisplayFields.partition(f => Boolean(f.value));
      context.menuSections = this.#prepareMenuSections(emptyFields);
      context.displayFields = /** @type {Teriock.Display.EnrichedDisplayField[]} */ await Promise.all(
        valueFields.map(async f => {
          return {
            ...f,
            enriched: await TeriockTextEditor.enrichHTML(f.value, {
              relativeTo: this.document,
              secrets: this.document.isOwner,
            }),
          };
        }),
      );
      context.displayTips = this.document.system.getVisibleTips("sheets");
      context.bars = this._tab === "overview" ? this.constructor.BARS : [];
    }
  }

  return DisplaySheet;
}
