import { BlankMixin } from "../mixins/_module.mjs";

const { TableResult } = foundry.documents;

/**
 * The Teriock {@link TableResult} implementation.
 * @extends {TableResult}
 * @extends {ClientDocument}
 */
export default class TeriockTableResult extends BlankMixin(TableResult) {}
