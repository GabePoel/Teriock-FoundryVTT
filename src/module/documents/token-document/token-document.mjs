import DocumentSelector from "../../applications/dialogs/document-selector.mjs";
import { migrateThumbnails } from "../../data/fields/tools/migrations.mjs";
import { mixClasses } from "../../utils/_module.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { TokenDocument } = foundry.documents;

/**
 * @import { ContextMenuEntry } from "@client/applications/ux/context-menu.mjs";
 */

/**
 * The Teriock TokenDocument implementation.
 * @extends {TokenDocument}
 * @mixes BaseDocument
 */
export default class TeriockTokenDocument extends mixClasses(TokenDocument, BaseDocumentMixin) {
  /**
   * @inheritDoc
   * @version 369
   */
  static async createCombatants(tokens, { combat } = {}) {
    combat ??= game.combats.viewed;
    if (!combat) {
      if (!game.user.isGM) { throw new Error(_loc("COMBAT.NoneActive")); }
      combat = await Combat.implementation.create({ active: true }, { render: false });
    }
    const addToCombat = t => t.getFlag("teriock", "addToCombat") === true;
    const summons = [...new Set(tokens.flatMap(t => t.getAllSummons(addToCombat)))].filter(s =>
      s.isOwner && (!s.hidden || game.user.isGM) && !tokens.includes(s) && !combat.getCombatantsByToken(s).length
    );
    if (summons.length) {
      const selected = game.settings.get("teriock", "confirmSummonsAddToCombat")
        ? await DocumentSelector.selectMulti(summons, {
          checked: summons.map(s => s.uuid),
          hint: _loc("TERIOCK.DIALOGS.AddSummons.hint"),
          textKey: "summoner.name",
          title: _loc("TERIOCK.DIALOGS.AddSummons.title"),
        })
        : summons;
      if (!selected) { return []; }
      tokens = [...tokens, ...selected];
    }
    return combat.addCombatants(
      [...new Set(tokens)].filter(t => !combat.getCombatantsByToken(t).length).map(t => ({
        actorId: t.actorId,
        hidden: t.hidden,
        sceneId: t.parent.id,
        tokenId: t.id,
      })),
    );
  }

  /**
   * @inheritDoc
   * @version 369
   */
  static async deleteCombatants(tokens, { combat } = {}) {
    combat ??= game.combats.viewed;
    const tokenIds = new Set(tokens.map(t => t.id));
    return combat.removeCombatants(combat.combatants.filter(c => tokenIds.has(c.tokenId)));
  }

  /** @inheritDoc */
  static migrateData(source, options) {
    migrateThumbnails(source, "texture.src", "ring.subject.texture");
    return super.migrateData(source, options);
  }

  /**
   * The color that represents this token's disposition.
   * @version 369
   * @returns {Color}
   */
  get color() {
    const colors = CONFIG.Canvas.dispositionColors;
    const key = Object.keys(CONST.TOKEN_DISPOSITIONS).find(k => CONST.TOKEN_DISPOSITIONS[k] === this.disposition);
    if (key === "FRIENDLY" && this.actor?.type === "pc" && this.actor?.hasPlayerOwner) { return colors.PARTY; }
    return colors[key] ?? colors.INACTIVE;
  }

  /**
   * The image that should be used to represent this token.
   * @returns {string}
   */
  get img() {
    // Non-ring textures are preferred over ring ones because of sizing issues.
    // No special handling is needed if this doesn't have a dynamic ring.
    if (!this.ring.enabled) { return this.texture.src; }
    // If texture is being modified, assume it is intentional and use that.
    if (this.texture.src && this._source.texture.src !== this.texture.src) { return this.texture.src; }
    // If ring texture is being modified, assume it is intentional and use that.
    if (
      this.ring.enabled && this.ring.subject.texture && this._source.ring.subject.texture !== this.ring.subject.texture
    ) { return this.ring.subject.texture; }
    // If this has an actor, additional validation is needed.
    const actor = this.actor;
    if (actor) {
      // If this is using the original texture given by the actor, use the actor's art.
      if (actor.constructor.getDefaultImageForType(actor.type) === this.texture.src) { return actor.img; }
      // If this is using the default token art, use the actor's art.
      if (this.texture.src === CONST.DEFAULT_TOKEN) { return actor.img; }
      // If there is no token art, use the actor's art.
      if (!this.texture.src) { return actor.img; }
    }
    // If token texture has been intentionally set, assume it's safe to use.
    if (this.texture.src !== CONST.DEFAULT_TOKEN) { return this.texture.src; }
    // Only use the ring texture if it really is the best one.
    if (this.ring.subject.texture) { return this.ring.subject.texture; }
    // Fall back to default.
    return CONST.DEFAULT_TOKEN;
  }

  /**
   * The token that summoned this one.
   * @returns {TeriockTokenDocument|null}
   */
  get summoner() {
    const tokens = this.parent?.tokens;
    const token = tokens?.get(this.getFlag("teriock", "summonerTokenId"));
    if (token && token !== this) { return token; }
    const actorId = this.getFlag("teriock", "summonerActorId");
    if (typeof actorId !== "string") { return null; }
    return tokens?.find(t => t !== this && t.actorLink && t.actorId === actorId) ?? null;
  }

  /**
   * Other tokens that were summoned by this one.
   * @returns {TeriockTokenDocument[]}
   */
  get summons() {
    return this.parent?.tokens.filter(t => t.summoner === this) ?? [];
  }

  /** @inheritDoc */
  _onUpdate(changed, options, userId) {
    super._onUpdate(changed, options, userId);
    if (this.inCombat && "disposition" in changed) { game.combat.debounceSetup(); }
  }

  /**
   * @inheritDoc
   * @see {InfiniteNumberField}
   * @category Perception
   */
  _prepareDetectionModes() {
    super._prepareDetectionModes();
    const actor = this.actor;
    if (!actor) { return; }
    // Detection modes and range can't be changes since NumberField has no way to be set to null/Infinity via change.
    const autoDetectionMode = actor.system.settings.getSetting("autoDetectionModes");
    const autoVisionRange = actor.system.settings.getSetting("autoVisionRange");
    if (autoDetectionMode || autoVisionRange) {
      this.sight.range = 0;
      for (const [id, config] of Object.entries(TERIOCK.CONFIG.character.sense)) {
        const range = actor.system.senses[id];
        if (autoDetectionMode) {
          const mode = config?.detectionMode;
          if (mode) { this.detectionModes[mode] = { enabled: range > 0, range }; }
        }
        if (autoVisionRange && config?.grantsSight) { this.sight.range = Math.max(this.sight.range, range); }
      }
    }
    if (this.detectionModes.basicSight) { this.detectionModes.basicSight.enabled = false; }
  }

  /**
   * Tokens summoned by this one or by its summons. Chains only continue through summons that pass the filter.
   * @param {(token: TeriockTokenDocument) => boolean} [filter]
   * @returns {TeriockTokenDocument[]}
   */
  getAllSummons(filter = () => true) {
    const allTokens = new Set();
    let remainingTokens = [this];
    while (remainingTokens.length) {
      remainingTokens = remainingTokens.flatMap(t => t.summons).filter(s =>
        s !== this && !allTokens.has(s) && filter(s)
      );
      for (const summon of remainingTokens) { allTokens.add(summon); }
    }
    return [...allTokens];
  }

  /**
   * Perform all updates needed to synchronize this with {@link TeriockActor} data.
   * @returns {Promise<void>}
   */
  async postActorUpdate() {
    const updateData = {};
    const updateOptions = {};
    if (this.actor) {
      if (this.actor.system.settings.getSetting("autoScale")) {
        if (this.width !== this.actor.system.size.length) { updateData.width = this.actor.system.size.length; }
        if (this.height !== this.actor.system.size.length) { updateData.height = this.actor.system.size.length; }
      }
    }
    if (Object.keys(updateData).length > 0 && this.id) { await this.update(updateData, updateOptions); }
  }

  /** @inheritDoc */
  prepareEmbeddedDocuments() {
    if (this.isLazyDelta) { return; }
    super.prepareEmbeddedDocuments();
    this.applyActiveEffects(TERIOCK.CONFIG.change.defaultPhase);
  }
}
