import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { Scene } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock Scene implementation.
 * @implements {Teriock.Documents.SceneInterface}
 * @extends {ClientDocument}
 * @extends {Scene}
 * @mixes BaseDocument
 */
export default class TeriockScene extends BaseDocumentMixin(Scene) {}
