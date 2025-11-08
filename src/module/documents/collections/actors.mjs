import { BlankMixin } from "../mixins/_module.mjs";

const { Actors } = foundry.documents.collections;

//noinspection JSUnusedGlobalSymbols,JSClosureCompilerSyntax
/**
 * @implements {DocumentCollection<TeriockActor>}
 * @property {Record<Teriock.ID<TeriockActor>, TeriockActor>} tokens
 */
export default class TeriockActors extends BlankMixin(Actors) {
  get characters() {
    return this.contents.filter((a) => a.type === "character");
  }

  get creatures() {
    return this.contents.filter((a) => a.type === "creature");
  }
}
