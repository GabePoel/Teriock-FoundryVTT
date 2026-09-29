import { mixClasses } from "../../../helpers/construction.mjs";
import DocumentDirectoryMixin from "../mixins/document-directory-mixin.mjs";

const { RollTableDirectory } = foundry.applications.sidebar.tabs;

/**
 * @extends {RollTableDirectory}
 * @mixes TeriockDocumentDirectory
 */
export default class TeriockRollTableDirectory extends mixClasses(RollTableDirectory, DocumentDirectoryMixin) {}
