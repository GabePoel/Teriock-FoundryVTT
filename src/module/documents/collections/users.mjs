import { BlankMixin } from "../mixins/_module.mjs";

const { Users } = foundry.documents.collections;

//noinspection JSClosureCompilerSyntax
/**
 * @implements {Collection<Teriock.ID<TeriockUser>, TeriockUser>}
 * @implements {DocumentCollection<TeriockUser>}
 * @property {Readonly<TeriockUser|null>} activeGM
 */
export default class TeriockUsers extends BlankMixin(Users) {}
