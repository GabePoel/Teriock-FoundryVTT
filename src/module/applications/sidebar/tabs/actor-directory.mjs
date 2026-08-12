import DocumentDirectoryMixin from "./document-directory-mixin.mjs";

const { ActorDirectory } = foundry.applications.sidebar.tabs;

/**
 * @mixes TeriockDocumentDirectory
 */
export default class TeriockActorDirectory extends DocumentDirectoryMixin(ActorDirectory) {}
