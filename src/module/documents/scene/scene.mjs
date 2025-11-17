import { BlankMixin } from "../mixins/_module.mjs";

const { Scene } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link Scene} implementation.
 * @extends {ClientDocument}
 * @extends {Scene}
 * @property {Collection<Teriock.UUID<TeriockTokenDocument>, TeriockTokenDocument>} tokens
 */
export default class TeriockScene extends BlankMixin(Scene) {}
