import { resolveDocument } from "../../../helpers/resolve.mjs";
import { toId } from "../../../helpers/string.mjs";
import { BaseActivation } from "./abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * @typedef {"unknown" | "ready" | "unowned" | "packed"} ActorState
 */

/**
 * @typedef SummonNode
 * @property {TeriockActor} actor
 * @property {ActorState} state
 */

/**
 * @property {Set<UUID<AnyActor>>} uuids
 */
export default class SummonActivation extends BaseActivation {
  /** @inheritDoc */
  static get ICON() {
    return TERIOCK.display.icons.document.token;
  }

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.ACTIVATIONS.Summon.BUTTON";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "summon";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      uuids: new fields.SetField(
        new fields.DocumentUUIDField({ type: "Actor" }),
      ),
    });
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

  /** @inheritDoc */
  get visible() {
    return (
      game.user.hasPermission("TOKEN_CREATE") &&
      game.user.hasPermission("QUERY_USER")
    );
  }

  async #claimOwnership() {
    const toUpdate = [];
    for (const n of this.#nodes) {
      if (
        n.state === "unowned" &&
        n.actor.folder?.id === this.#summonsFolderId
      ) {
        toUpdate.push({
          _id: n.actor.id,
          [`ownership.${game.user.id}`]: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER,
        });
        n.state = "ready";
      }
    }
    await Actor.implementation.updateDocuments(toUpdate, { asGM: true });
  }

  /** @returns {Promise<TeriockFolder>} */
  async #createSummonsFolder() {
    return Folder.implementation.create(
      {
        _id: this.#summonsFolderId,
        name: _loc("TERIOCK.ACTIVATIONS.Summon.FOLDER"),
        type: "Actor",
      },
      { keepId: true, asGM: true },
    );
  }

  /**
   * Determine the state of each actor we'd like to place tokens for.
   */
  #determineActorStates() {
    for (const n of this.#nodes) {
      if (n.actor.inCompendium) {
        const summon = this.#findBestSummon(n.actor.uuid);
        if (!summon) n.state = "packed";
        else if (summon.isOwner) n.state = "ready";
        else n.state = "unowned";
      } else if (n.actor.isOwner) n.state = "ready";
      else n.state = "unowned";
    }
  }

  /**
   * Find the best existing summon to use if there is one.
   * @param {UUID<TeriockActor>} uuid
   * @returns {TeriockActor|null}
   */
  #findBestSummon(uuid) {
    const candidates = this.#findSummons(uuid);
    const owned = candidates.find((a) => a.isOwner);
    if (owned) return owned;
    else if (candidates.length) return candidates[0];
    else return null;
  }

  /**
   * @param {UUID<TeriockActor>} uuid
   * @returns {TeriockActor[]}
   */
  #findSummons(uuid) {
    return game.actors.filter(
      (a) =>
        a.folder?.id === this.#summonsFolderId &&
        a.getFlag("teriock", "summonFor") === uuid &&
        a._stats.compendiumSource === uuid,
    );
  }

  async #import() {
    const toCreate = [];
    const packNodes = this.#nodes.filter((n) => n.state === "packed");
    for (const n of packNodes) {
      if (n.state === "packed") {
        const data = foundry.utils.mergeObject(
          game.actors.fromCompendium(n.actor, {
            clearOwnership: true,
            clearFolder: true,
          }),
          {
            flags: { teriock: { summonFor: n.actor.uuid } },
            folder: this.#summonsFolderId,
          },
        );
        toCreate.push(data);
      }
    }
    const created = await Actor.implementation.createDocuments(toCreate, {
      asGM: true,
    });
    for (let i = 0; i < packNodes.length; i++) {
      packNodes[i].actor = created[i];
      packNodes[i].state = "ready";
    }
  }

  /** @returns {Promise<TeriockActor[]>} */
  async #prepareActors() {
    this.#nodes = [];
    const srcPromises = [];
    for (const uuid of Array.from(this.uuids)) {
      if (!uuid.startsWith("Compendium")) srcPromises.push(uuid);
      else {
        const summon = this.#findBestSummon(uuid);
        if (summon) srcPromises.push(summon);
        else srcPromises.push(resolveDocument(uuid));
      }
    }
    const srcActors = (await Promise.all(srcPromises)).filter((_) => _);
    const needsSummonFolder =
      srcActors.some((a) => a?.inCompendium) && !this.#summonsFolder;
    if (needsSummonFolder) await this.#createSummonsFolder();
    this.#nodes = srcActors.map((a) => {
      return { actor: a, state: "unknown" };
    });
    this.#determineActorStates();
    await this.#claimOwnership();
    await this.#import();
    const actors = this.#nodes
      .filter((n) => n.state === "ready" && n.actor?.isOwner)
      .map((n) => n.actor);
    this.#nodes = [];
    return actors;
  }

  /** @returns {Promise<TeriockTokenDocument[]>} */
  async placeTokens() {
    const actors = await this.#prepareActors();
    const tokenDocuments = await Promise.all(
      actors.map((a) => a.getTokenDocument()),
    );
    const tokenData = tokenDocuments.map((t) =>
      foundry.utils.mergeObject(t?.toObject(), {
        ownership: { [game.user.id]: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER },
        flags: { teriock: { createdBy: this.puuid, placedBy: game.user.id } },
      }),
    );
    return await canvas.tokens.placeTokens(tokenData);
  }

  /**
   * @inheritDoc
   * @returns {Promise<TeriockTokenDocument[]>}
   */
  async primaryAction() {
    const toMinimize = Array.from(
      foundry.applications.instances.values(),
    ).filter((a) => a.hasFrame && !a.minimized);
    await Promise.all((toMinimize || []).map((s) => s?.minimize()));
    const tokens = await this.placeTokens();
    await Promise.all((toMinimize || []).map((s) => s?.maximize()));
    return tokens;
  }

  /** @inheritDoc */
  async secondaryAction() {
    await canvas.scene.deleteEmbeddedDocuments(
      "Token",
      canvas.scene.tokens.contents
        .filter(
          (t) =>
            t.getFlag("teriock", "createdBy") === this.puuid &&
            (t.getFlag("teriock", "placedBy") === game.user.id ||
              game.user.isGM) &&
            t.isOwner,
        )
        .map((t) => t.id),
      { asGM: true },
    );
  }
}
