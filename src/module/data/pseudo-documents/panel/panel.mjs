import { TeriockTextEditor } from "../../../applications/ux/_module.mjs";
import { icons } from "../../../constants/display/icons.mjs";
import { createElement } from "../../../helpers/html.mjs";
import { makeIcon } from "../../../helpers/icon.mjs";
import { toId } from "../../../helpers/string.mjs";
import { associationsField, blocksField, nullString } from "../../fields/tools/builders.mjs";
import { BasePseudoDocument } from "../abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * @import { EnrichmentOptions } from "@client/applications/ux/text-editor.mjs";
 */

export default class Panel extends BasePseudoDocument {
  /**
   * Wrap bare tables in a collapsible HTML block.
   * @param {string} html
   * @param {string} rootId
   * @param {object} [options]
   * @param {boolean} [options.collapsed=true]
   * @returns {string}
   */
  static #wrapPanelTables(html, rootId, options = {}) {
    const { collapsed = true } = options;
    if (!html || !html.includes("<table")) { return html; }
    const container = document.createElement("div");
    container.innerHTML = html;
    let index = 0;
    for (const table of [...container.querySelectorAll("table")]) {
      if (table.closest(".teriock-panel-table")) { continue; }
      const tableId = `${rootId}-table-${index++}`;
      const wrap = createElement("div", {
        className: `teriock-panel-table collapsible${collapsed ? " collapsed" : ""}`,
        dataset: { collapsibleId: tableId },
      });
      const title = createElement("div", {
        className: "teriock-panel-table-title",
        dataset: { action: "toggleCollapse" },
        innerHTML: `
        <div class="teriock-panel-table-icon">${makeIcon(TERIOCK.display.icons.document.table, "light")}</div>
        <div class="teriock-panel-table-name">${_loc("EDITOR.Table")}</div>
        <div class="teriock-panel-table-expander">${makeIcon(TERIOCK.display.icons.ui.menuOpen, "light")}</div>`,
      });
      const content = createElement("div", { className: "teriock-panel-table-content" });
      const spacer = createElement("div", {
        className: "teriock-panel-table-spacer",
        dataset: { scrollableId: tableId },
      });
      table.replaceWith(wrap);
      spacer.append(table);
      content.append(spacer);
      wrap.append(title, content);
    }
    return container.innerHTML;
  }

  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { documentName: "Panel" });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      associations: associationsField(),
      bars: new fields.ArrayField(
        new fields.SchemaField({
          icon: new fields.StringField({ initial: "", required: false }),
          label: new fields.StringField({ blank: true, nullable: true, required: false }),
          wrappers: new fields.ArrayField(new fields.StringField(), { initial: [], required: false }),
        }),
        { initial: [], required: false },
      ),
      blocks: blocksField(),
      classes: new fields.SetField(new fields.StringField(), { initial: [] }),
      color: new fields.ColorField({ blank: true, initial: null, nullable: true, required: false }),
      documentUuid: new fields.DocumentUUIDField({ blank: true, initial: null, nullable: true }),
      icon: nullString(),
      img: new fields.FilePathField({ categories: ["IMAGE"] }),
      name: nullString(),
    });
  }

  /**
   * Wrap Documents as a Panel association.
   * @param {TeriockDocument[]} documents
   * @param {string} title
   * @param {string} [icon]
   * @param {object} [options]
   * @param {boolean} [options.draggable]
   * @param {boolean} [options.makeTooltip]
   * @returns {Teriock.Panels.PanelAssociation}
   */
  static toAssociation(documents, title, icon = icons.ui.document, options = {}) {
    return { cards: documents.map(d => this.toAssociationCard(d, options)), icon, title: _loc(title) };
  }

  /**
   * Wrap a Document as a Panel association card.
   * @param {TeriockDocument} document
   * @param {object} [options]
   * @param {boolean} [options.draggable]
   * @param {boolean} [options.makeTooltip]
   * @returns {Teriock.Panels.PanelAssociationCard}
   */
  static toAssociationCard(document, options = {}) {
    return {
      color: document.system?.color,
      documentUuid: document.uuid,
      draggable: options.draggable,
      icon: document.system?.tagIcon,
      img: document.img,
      makeTooltip: options.makeTooltip,
      name: document.fullName || document.name,
    };
  }

  /**
   * Enriched panel context.
   * @param {Teriock.Panels.EnrichmentOptions & EnrichmentOptions} [options]
   * @returns {Promise<Teriock.Panels.PanelParts>}
   */
  async prepareContext(options = {}) {
    const context = Object.assign(this.toObject(), { color: this.color });
    const { collapseTables = true, keepId = true, usePanelRelativeTo = true } = options;
    if (options.noAssociations) { context.associations = []; }
    if (options.noBars) { context.bars = []; }
    if (options.noBlocks) { context.blocks = []; }
    const bars = [];
    for (const bar of context.bars) {
      const wrappers = (bar?.wrappers || []).filter(Boolean);
      if (!wrappers.length) { continue; }
      bars.push({ icon: bar?.icon, label: bar?.label, wrappers });
    }
    for (const association of context.associations) {
      for (const card of association.cards) {
        if (card.documentUuid) {
          const doc = await fromUuid(card.documentUuid);
          Object.assign(card, {
            draggable: doc?.isViewer,
            id: doc?.id,
            makeTooltip: doc?.isViewer,
            pack: doc?.pack,
            type: doc?.documentName,
          });
        }
      }
    }
    context.bars = bars;
    if (!context._id || !keepId) {
      context._id = toId(`${this.documentUuid}-${this.name}-${this.img}-${this.icon}`, { hash: true });
    }
    options.relativeTo ??= usePanelRelativeTo ? fromUuid(this.documentUuid) : null;
    options.secrets ??= options.relativeTo?.isOwner;
    context.blocks = await Promise.all(
      context.blocks.filter(b => game.user.isGM || !b.gmOnly).map(async (b, i) => {
        b.text = await TeriockTextEditor.enrichHTML(b.text, options);
        b.text = Panel.#wrapPanelTables(b.text, `panel-${context._id}-block-${i}`, { collapsed: collapseTables });
        return b;
      }),
    );
    console.log(context);
    return context;
  }

  /**
   * Render a panel as an HTML element.
   * @param {Teriock.Panels.EnrichmentOptions & EnrichmentOptions} [options]
   * @returns {Promise<HTMLDivElement>}
   */
  async renderElement(options = {}) {
    return foundry.utils.parseHTML(await this.renderHTML(options));
  }

  /**
   * Render a panel as HTML.
   * @param {Teriock.Panels.EnrichmentOptions & EnrichmentOptions} [options]
   * @returns {Promise<string>}
   */
  async renderHTML(options = {}) {
    return TeriockTextEditor.renderTemplate("teriock/ui/panel", await this.prepareContext(options));
  }
}
