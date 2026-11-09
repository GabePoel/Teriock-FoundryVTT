import { makeIconClass } from "../../utils/_module.mjs";

const { Sidebar } = foundry.applications.sidebar;

/** @inheritDoc */
export default class TeriockSidebar extends Sidebar {
  /** @inheritDoc */
  static TABS = (() => {
    const entries = Object.entries(super.TABS);
    const world = {
      icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.ui.world, "solid"),
      tooltip: "TERIOCK.TRIGGERS.SIDEBAR.label",
    };
    entries.splice(entries.findIndex(([k]) => k === "settings"), 0, ["world", world]);
    return Object.fromEntries(entries);
  })();
}
