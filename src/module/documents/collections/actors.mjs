const { Actors } = foundry.documents.collections;

//noinspection JSUnusedGlobalSymbols,JSClosureCompilerSyntax
/**
 * @implements {Collection<Teriock.ID<TeriockActor>, TeriockActor>}
 * @implements {DocumentCollection<TeriockActor>}
 */
export default class TeriockActors extends Actors {
  get characters() {
    return this.contents.filter((a) => a.type === "character");
  }

  get creatures() {
    return this.contents.filter((a) => a.type === "creature");
  }
}
