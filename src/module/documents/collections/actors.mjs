import { TeriockActor, TeriockChatMessage } from "../_module.mjs";

const { Actors } = foundry.documents.collections;

/**
 * @property {Record<ID<TeriockActor>, TeriockActor>} tokens
 */
export default class TeriockActors extends Actors {
  /**
   * Get the default actor for the current user.
   * @returns {TeriockActor|null}
   */
  get default() {
    const speaker = TeriockChatMessage.getSpeaker();
    const candidates = [
      game.scenes.get(speaker.scene)?.tokens.get(speaker.token)?.actor,
      this.get(speaker.actor),
      game.user.character,
      ...(game.canvas?.tokens?.controlled.map(t => t.actor) ?? []),
      ui.activeWindow?.document?.actor,
      ...foundry.applications.instances.values().map(app => app?.document).filter(d => d instanceof TeriockActor),
    ];
    return candidates.find(a => a?.isOwner) ?? null;
  }

  /**
   * All the actors which are designated as characters.
   * @returns {TeriockActor[]}
   */
  get pcs() {
    return Array.from(
      new Set([...this.filter(a => a.type === "pc"), ...game.users.map(u => u.character)].filter(Boolean)),
    );
  }

  /**
   * All the currently relevant actors. They are either visible or PCs.
   * @returns {TeriockActor[]}
   */
  get relevant() {
    return Array.from(new Set([...this.pcs, ...this.visible]));
  }

  /**
   * Selected actors.
   * @returns {TeriockActor[]}
   */
  get selected() {
    const controlled = game.canvas.tokens.controlled.map(t => t?.actor).filter(Boolean);
    if (controlled.length) { return controlled; }
    return this.default ? [this.default] : [];
  }

  /**
   * All the actors visible in the current scene.
   * @returns {TeriockActor[]}
   */
  get visible() {
    return Array.from(new Set(game.scenes.viewed?.tokens.map(token => token.actor).filter(Boolean) ?? []));
  }

  /**
   * Convenient alias for {@link TeriockManager.checkActors}.
   * @param {Teriock.System.Existable<TeriockActor>} actors
   * @returns {boolean}
   */
  check(actors) {
    return game.teriock.checkActors(actors);
  }
}
