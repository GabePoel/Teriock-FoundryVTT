import { makeIconClass } from "../../utils/_module.mjs";

const { Sidebar } = foundry.applications.sidebar;

/** @inheritDoc */
export default class TeriockSidebar extends Sidebar {
  /** @inheritDoc */
  static TABS = (() => {
    const entries = Object.entries(super.TABS);
    const triggers = {
      gmOnly: true,
      icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.pseudoDocument.automation, "solid"),
      tooltip: "TERIOCK.TRIGGERS.SIDEBAR.label",
    };
    entries.splice(entries.findIndex(([k]) => k === "playlists") + 1, 0, ["triggers", triggers]);
    return Object.fromEntries(entries);
  })();
}
