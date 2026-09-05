import { TeriockActor, TeriockFolder } from "../../../documents/_module.mjs";
import { resolveDocument } from "../../../helpers/resolve.mjs";
import { toId } from "../../../helpers/string.mjs";
import { omit } from "../../../helpers/utils.mjs";
import { SelectionPseudoDocumentMixin } from "../mixins/_module.mjs";
import { BaseActivation } from "./abstract/_module.mjs";

/**
 * @typedef {"unknown" | "ready" | "unowned" | "packed"} ActorState
 */

/**
 * @typedef SummonNode
 * @property {TeriockActor} actor
 * @property {ActorState} state
 */

/**
 * @mixes SelectionPseudoDocument
 */
export default class SummonActivation extends SelectionPseudoDocumentMixin(BaseActivation) {
  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { icon: TERIOCK.display.icons.document.token, type: "summon" });
  }

  /** @inheritDoc */
  static defineSchema() {
    return omit(super.defineSchema(), [
      "expandFolders",
      "expandTables",
      "localIdentifiers",
      "localQualifier",
      "localUuids",
      "makeSeparateActivations",
      "selectInExecution",
    ]);
  }

  /** @type {SummonNode[]} */
  #nodes = [];

  /** @returns {TeriockFolder|null} */
  get #summonsFolder() {
    return game.folders.get(this.#summonsFolderId) ?? null;
  }

  /** @returns {ID<TeriockFolder>} */
  get #summonsFolderId() {
    return toId("Summons Folder", { hash: true });
  }

  /**
   * Update existing summons that are needed but the current user doesn't have ownership over.
   * @returns {Promise<void>}
   */
  async #claimOwnership() {
    const toUpdate = [];
    for (const n of this.#nodes) {
      if (n.state === "unowned" && n.actor.folder?.id === this.#summonsFolderId) {
        toUpdate.push({ _id: n.actor.id, [`ownership.${game.user.id}`]: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER });
        n.state = "ready";
      }
    }
    await TeriockActor.updateDocuments(toUpdate, { asGM: true });
  }

  /**
   * Ensure that the summons folder exists.
   * @returns {Promise<TeriockFolder>}
   */
  async #createSummonsFolder() {
    return TeriockFolder.create({
      _id: this.#summonsFolderId,
      name: _loc("TERIOCK.ACTIVATIONS.Summon.FOLDER"),
      type: "Actor",
    }, { asGM: true, keepId: true });
  }

  /**
   * Determine the state of each actor we'd like to place tokens for.
   */
  #determineActorStates() {
    for (const n of this.#nodes) {
      if (n.actor.inCompendium) {
        const summon = this.#findBestSummon(n.actor.uuid);
        if (!summon) { n.state = "packed"; }
        else if (summon.isOwner) { n.state = "ready"; }
        else { n.state = "unowned"; }
      } else if (n.actor.isOwner) { n.state = "ready"; }
      else { n.state = "unowned"; }
    }
  }

  /**
   * Find the best existing summon to use if there is one.
   * @param {UUID<TeriockActor>} uuid
   * @returns {TeriockActor|null}
   */
  #findBestSummon(uuid) {
    const candidates = this.#findSummons(uuid);
    const owned = candidates.find(a => a.isOwner);
    if (owned) { return owned; }
    else if (candidates.length) { return candidates[0]; }
    return null;
  }

  /**
   * Find all summons for a given actor from its UUID.
   * @param {UUID<TeriockActor>} uuid
   * @returns {TeriockActor[]}
   */
  #findSummons(uuid) {
    return game.actors.filter(a =>
      a.folder?.id === this.#summonsFolderId
      && a.getFlag("teriock", "summonFor") === uuid
      && a._stats.compendiumSource === uuid
    );
  }

  /**
   * Import all summons for actors in compendiums.
   * @returns {Promise<void>}
   */
  async #import() {
    const toCreate = [];
    const packNodes = this.#nodes.filter(n => n.state === "packed");
    for (const n of packNodes) {
      if (n.state === "packed") {
        const data = foundry.utils.mergeObject(
          game.actors.fromCompendium(n.actor, { clearFolder: true, clearOwnership: true }),
          { flags: { teriock: { summonFor: n.actor.uuid } }, folder: this.#summonsFolderId },
        );
        toCreate.push(data);
      }
    }
    const actors = await TeriockActor.createDocuments(toCreate, { asGM: true });
    for (let i = 0; i < packNodes.length; i++) {
      packNodes[i].actor = actors[i];
      packNodes[i].state = "ready";
    }
  }

  /**
   * Place all the tokens on the canvas.
   * @returns {Promise<TeriockTokenDocument[]>}
   */
  async #placeTokens() {
    const actors = await this.#prepareActors();
    const tokenDocuments = await Promise.all(actors.map(a => a.getTokenDocument()));
    const tokenData = tokenDocuments.map(t =>
      foundry.utils.mergeObject(t?.toObject(), {
        flags: { teriock: { createdBy: this.uuid, placedBy: game.user.id } },
        ownership: { [game.user.id]: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER },
      })
    );
    return canvas.tokens.placeTokens(tokenData, { createOptions: { asGM: true } });
  }

  /**
   * Prepare all relevant actors for token placement.
   * @returns {Promise<TeriockActor[]>}
   */
  async #prepareActors() {
    this.#nodes = [];
    const srcPromises = [];
    for (const uuid of (await this.selectDocuments()).map(d => d.uuid)) {
      if (!uuid.startsWith("Compendium")) { srcPromises.push(uuid); }
      else {
        const summon = this.#findBestSummon(uuid);
        if (summon) { srcPromises.push(summon); }
        else { srcPromises.push(resolveDocument(uuid)); }
      }
    }
    const srcActors = (await Promise.all(srcPromises)).filter(Boolean);
    const needsSummonFolder = srcActors.some(a => a?.inCompendium) && !this.#summonsFolder;
    if (needsSummonFolder) { await this.#createSummonsFolder(); }
    this.#nodes = srcActors.map(a => {
      return { actor: a, state: "unknown" };
    });
    this.#determineActorStates();
    await this.#claimOwnership();
    await this.#import();
    const actors = this.#nodes.filter(n => n.state === "ready" && n.actor?.isOwner).map(n => n.actor);
    this.#nodes = [];
    return actors;
  }

  /** @inheritDoc */
  get _selectionRelativeTo() {
    return this.document?.speakerActor ?? null;
  }

  /** @inheritDoc */
  get _selectionTitle() {
    return this.label;
  }

  /** @inheritDoc */
  get visible() {
    return game.user.hasPermission("TOKEN_CREATE") && game.user.hasPermission("QUERY_USER");
  }

  /** @inheritDoc */
  _isSelectable(document) {
    return document?.documentName === "Actor";
  }

  /**
   * @inheritDoc
   * @returns {Promise<TeriockTokenDocument[]>}
   */
  async primaryAction() {
    if (!game.teriock.checkScene()) { return []; }
    await game.teriock.minimizeStart();
    const tokens = await this.#placeTokens();
    await game.teriock.minimizeEnd();
    return tokens;
  }

  /** @inheritDoc */
  async secondaryAction() {
    if (!game.teriock.checkScene()) { return []; }
    await canvas.scene.deleteEmbeddedDocuments(
      "Token",
      canvas.scene.tokens.contents.filter(t =>
        t.getFlag("teriock", "createdBy") === this.uuid
        && t.getFlag("teriock", "placedBy") === game.user.id
        && t.isOwner
      ).map(t => t.id),
      { asGM: true },
    );
  }
}
