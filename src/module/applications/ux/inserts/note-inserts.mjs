/**
 * @import { ProseMirrorDropDownConfig } from "@common/prosemirror/_types.mjs";
 * @import ProseMirrorMenu from "@common/prosemirror/menu.mjs";
 */

/** @type {ProseMirrorInsert} */
const noteInserts = {
  action: "teriock.notes",
  children: ["info", "error", "warning", "success", "morganti"].map(level => {
    return {
      action: `teriock.note-${level}`,
      html: `<aside class="notification ${level} theme-dark"><selection>Add text here.</selection></aside>`,
      title: `TERIOCK.COMMON.${level.capitalize()}`,
    };
  }),
  title: "TERIOCK.COMMON.Notes",
};

export default noteInserts;

/**
 * Move note inserts to the top of the format menu.
 * @param {ProseMirrorMenu} _menu
 * @param {Record<string, ProseMirrorDropDownConfig>} menus
 * @see {getProseMirrorMenuDropDowns}
 */
function moveNoteInsertsMenu(_menu, menus) {
  const entries = menus.format?.entries ?? [];
  const index = entries.findIndex(e => e.action === "custom-inserts");
  if (index < 0) { return; }
  const custom = entries[index];
  const notes = custom.children.findSplice(c => c.action === "teriock.notes");
  if (notes) { entries.splice(index, custom.children.length ? 0 : 1, notes); }
}
Hooks.on("getProseMirrorMenuDropDowns", moveNoteInsertsMenu);
