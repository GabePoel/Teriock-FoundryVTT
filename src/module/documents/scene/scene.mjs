import { mix } from "../../helpers/utils.mjs";
import * as mixins from "../mixins/_module.mjs";

const { Scene } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link Scene} implementation.
 * @extends {ClientDocument}
 * @extends {Scene}
 * @mixes BaseDocument
 * @property {Collection<UUID<TeriockTokenDocument>, TeriockTokenDocument>} tokens
 */
export default class TeriockScene extends mix(
  Scene,
  mixins.BaseDocumentMixin,
) {}
