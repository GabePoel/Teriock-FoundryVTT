import * as documentMixins from "../mixins/_module.mjs";

const { Scene } = foundry.documents;

/**
 * The Teriock Scene implementation.
 * @extends {Scene}
 * @extends {ClientDocument}
 * @mixes BaseDocument
 * @implements {Teriock.Documents.SceneInterface}
 */
export default class TeriockScene extends documentMixins.BaseDocumentMixin(Scene) {}
