import { mixClasses } from "../../../helpers/construction.mjs";
import DocumentDirectoryMixin from "./document-directory-mixin.mjs";

const { ActorDirectory } = foundry.applications.sidebar.tabs;

/**
 * @mixes TeriockDocumentDirectory
 */
export default class TeriockActorDirectory extends mixClasses(ActorDirectory, DocumentDirectoryMixin) {}
