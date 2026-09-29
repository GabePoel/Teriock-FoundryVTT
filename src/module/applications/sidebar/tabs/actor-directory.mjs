import { mixClasses } from "../../../helpers/construction.mjs";
import DocumentDirectoryMixin from "../mixins/document-directory-mixin.mjs";

const { ActorDirectory } = foundry.applications.sidebar.tabs;

/**
 * @extends {ActorDirectory}
 * @mixes TeriockDocumentDirectory
 */
export default class TeriockActorDirectory extends mixClasses(ActorDirectory, DocumentDirectoryMixin) {}
