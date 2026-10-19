import { icons, thumbnails } from "../../../static/display/_module.mjs";
import { mergeMetadata } from "../../../utils/_module.mjs";
import BaseGroupSystem from "./base-group-system/base-group-system.mjs";

/**
 * Get the words shared by several names.
 * @param {string[][]} lists
 * @returns {string[]}
 */
function getSharedWords(lists) {
  const end = lists[0].findIndex((word, i) => lists.some(l => l[i] !== word));
  return lists[0].slice(0, end < 0 ? undefined : end);
}

/**
 * A bunch of guys that share the same turn.
 */
export default class MobSystem extends BaseGroupSystem {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    icon: icons.manifest.document.mob,
    img: thumbnails.manifest.document.mob,
    type: "mob",
  });

  /** @inheritDoc */
  static defaultName({ members = [] }) {
    if (!members.length) { return null; }
    // Ignore the automatic incrementing numbers that Foundry can be configured to add to tokens
    const words = members.map(m => m.name.trim().split(/\s+/).filter(w => !/^\(?\d+\)?$/.test(w)));
    const shared = getSharedWords(words).join(" ")
      || getSharedWords(words.map(w => w.toReversed())).toReversed().join(" ");
    return shared ? _loc("TERIOCK.COMBAT.Group.mob", { name: shared }) : null;
  }
}
