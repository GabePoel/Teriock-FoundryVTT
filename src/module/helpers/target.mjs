import { systemPath } from "./path.mjs";

/**
 * Parse a target.
 * @param {Teriock.Models.RawTarget} target
 * @returns {Teriock.Models.Target}
 */
export function parseTarget(target) {
  let img = "";
  let name = "";
  /** @type {TeriockActor} */
  let actor;
  /** @type {TeriockTokenDocument} */
  let token;
  // Handling for token placeables
  if (target.document) {
    token = target.document;
    actor = target.actor;
  }
  // Handling for documents
  if (target.documentName === "TokenDocument") {
    token = target;
    actor ||= token.actor;
  } else if (target.documentName === "Actor") {
    token = target.token;
    actor ||= target;
  }
  // Prioritize name and image from the token over the actor
  if (actor) {
    img = actor.img;
    name = actor.name;
  }
  if (token) {
    img = token.img;
    name = token.name;
  }
  return {
    actorUuid: actor?.uuid || target.actorUuid || null,
    img: img || target?.img || systemPath("icons/documents/character.svg"),
    name: name || target?.name || "",
    tokenUuid: token?.uuid || target.tokenUuid || null,
  };
}

/**
 * Parse targets.
 * @param {Iterable<Teriock.Models.RawTarget>} [targets]
 * @returns {Teriock.Models.Target[]}
 */
export function parseTargets(targets = []) {
  return Array.from(targets ?? []).filter(Boolean).map(t => parseTarget(t));
}
