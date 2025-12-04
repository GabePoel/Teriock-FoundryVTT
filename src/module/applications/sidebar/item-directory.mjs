import SidebarMixin from "./sidebar-mixin.mjs";

const { ItemDirectory } = foundry.applications.sidebar.tabs;

/**
 * @extends {ItemDirectory}
 * @mixes Sidebar
 */
export default class TeriockItemDirectory extends SidebarMixin(ItemDirectory) {}
