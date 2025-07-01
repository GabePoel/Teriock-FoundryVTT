import TeriockRoll from "./roll.mjs";

/**
 * A specialized roll class for harm-related rolls.
 * Uses a custom chat template for displaying harm roll results.
 *
 * @extends {TeriockRoll}
 */
export default class TeriockHarmRoll extends TeriockRoll {
  static CHAT_TEMPLATE = "systems/teriock/templates/chat/harm.hbs";
}
