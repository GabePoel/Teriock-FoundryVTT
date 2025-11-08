const { Users } = foundry.documents.collections;

//noinspection JSClosureCompilerSyntax
/**
 * @implements {Collection<Teriock.ID<TeriockUser>, TeriockUser>}
 * @implements {DocumentCollection<TeriockUser>}
 */
export default class TeriockUsers extends Users {}
