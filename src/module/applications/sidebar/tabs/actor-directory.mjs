import DocumentDirectoryMixin from "./document-directory-mixin.mjs";

const { ActorDirectory } = foundry.applications.sidebar.tabs;

/**
 * @extends {ActorDirectory}
 * @mixes TeriockDocumentDirectory
 */
export default class TeriockActorDirectory extends DocumentDirectoryMixin(ActorDirectory) {}
