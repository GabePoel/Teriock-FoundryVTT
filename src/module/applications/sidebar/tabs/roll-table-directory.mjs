import DocumentDirectoryMixin from "./document-directory-mixin.mjs";

const { RollTableDirectory } = foundry.applications.sidebar.tabs;

/**
 * @extends {RollTableDirectory}
 * @mixes TeriockDocumentDirectory
 */
export default class TeriockRollTableDirectory extends DocumentDirectoryMixin(RollTableDirectory) {}
