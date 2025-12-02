import BaseWorldCollectionMixin from "./base-world-collection-mixin.mjs";

const { Actors } = foundry.documents.collections;

//noinspection JSUnusedGlobalSymbols,JSClosureCompilerSyntax
/**
 * @extends {Actors}
 * @implements {Collection<ID<TeriockActor>, TeriockActor>}
 * @implements {WorldCollection<TeriockActor>}
 * @property {Record<ID<TeriockActor>, TeriockActor>} tokens
 */
export default class TeriockActors extends BaseWorldCollectionMixin(Actors) {
  get characters() {
    return this.contents.filter((a) => a.type === "character");
  }

  get creatures() {
    return this.contents.filter((a) => a.type === "creature");
  }
}
