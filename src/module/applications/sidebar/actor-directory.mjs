import { SidebarMixin } from "./_module.mjs";

const { ActorDirectory } = foundry.applications.sidebar.tabs;

/**
 * @extends {ActorDirectory}
 * @mixes Sidebar
 */
export default class TeriockActorDirectory extends SidebarMixin(
  ActorDirectory,
) {}
