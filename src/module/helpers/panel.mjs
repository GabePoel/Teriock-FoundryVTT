import { createElement } from "./html.mjs";
import { makeIcon } from "./icon.mjs";

/**
 * Wrap bare tables in a collapsible HTML block.
 * @param {string} html
 * @param {string} rootId
 * @param {object} [options]
 * @param {boolean} [options.collapsed=true]
 * @returns {string}
 */
export function wrapPanelTables(html, rootId, options = {}) {
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

/**
 * Quickly turn a {@link TeriockDocument} array into an association.
 * @param {TeriockDocument[]} docs
 * @param {string} title
 * @param {string} icon
 * @param {Array} associations
 * @param {object} options
 * @param {boolean} [options.makeTooltip=true]
 * @returns {Teriock.Panels.PanelAssociation[]}
 */
export function quickAddAssociation(docs, title, icon, associations, options = { makeTooltip: true }) {
  if (docs.length > 0) {
    const association = {
      cards: docs.map(d => {
        return {
          color: d.system?.color,
          icon: d.system?.tagIcon,
          id: d._id,
          img: d.img,
          makeTooltip: options.makeTooltip,
          name: d.system?.fullName || d.name,
          pack: d.pack,
          type: d.documentName,
          uuid: d.uuid,
        };
      }),
      icon,
      title,
    };
    associations.push(association);
  }
  return associations;
}

/**
 * Strip panel bars that have no content.
 * @param {Teriock.Panels.PanelBar[]} [bars]
 * @returns {Teriock.Panels.PanelBar[]}
 */
export function cleanBars(bars = []) {
  const out = [];
  for (const bar of bars) {
    const wrappers = (bar?.wrappers || []).filter(Boolean);
    if (!wrappers.length) { continue; }
    out.push({ icon: bar?.icon, label: bar?.label, wrappers });
  }
  return out;
}

/**
 * Simplify a tag.
 * @param {Teriock.Display.DisplayTag} tag
 * @returns {string}
 */
export function simplifyTag(tag) {
  if (typeof tag === "string") { return _loc(tag); }
  if (typeof tag.label === "string") { return _loc(tag.label); }
  return "";
}

/**
 * Simplify multiple tags.
 * @param {Teriock.Display.DisplayTag[]} tags
 * @returns {string[]}
 */
export function simplifyTags(tags) {
  return tags.map(t => simplifyTag(t));
}
