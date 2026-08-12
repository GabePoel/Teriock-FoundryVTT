import * as documentMixins from "../mixins/_module.mjs";

const { Scene } = foundry.documents;

/**
 * The Teriock Scene implementation.
 * @mixes BaseDocument
 */
export default class TeriockScene extends documentMixins.BaseDocumentMixin(Scene) {}
