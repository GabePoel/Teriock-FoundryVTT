const { TypeDataModel } = foundry.abstract;

const { fields } = foundry.data;

// noinspection JSClosureCompilerSyntax
/**
 * Data model to represent chat buttons.
 * @implements {BaseChatButtonInterface}
 */
export default class BaseChatButton extends TypeDataModel {
  constructor() {
    super();
    this.commonRollOptions = {
      advantage: false,
      disadvantage: false,
    };
    this.critRollOptions = {
      crit: false,
    };
    this.targeted = false;
    /** @type {MouseEvent} */
    this.event = undefined;
  }

  /** @inheritDoc */
  static defineSchema() {
    return {
      _id: new fields.DocumentIdField({
        initial: () => foundry.utils.randomID(),
      }),
      classList: new fields.SetField(new fields.StringField()),
      color: new fields.ColorField(),
      data: new fields.ObjectField(),
      icon: new fields.StringField(),
      label: new fields.StringField(),
    };
  }

  /**
   * @returns {TeriockActor[]}
   */
  get actors() {
    if (this.targeted) {
      return this.targetedActors;
    }
    return this.selectedActors;
  }

  /**
   * @returns {TeriockActor[]}
   */
  get selectedActors() {
    return this.selectedTokens.filter((t) => t.actor).map((t) => t.actor);
  }

  /**
   * @returns {TeriockToken[]}
   */
  get selectedTokens() {
    const tokenLayer = /** @type {TokenLayer} */ game.canvas.tokens;
    return /** @type {TeriockToken[]} */ tokenLayer.controlled;
  }

  /**
   * @returns {TeriockActor[]}
   */
  get targetedActors() {
    return this.targetedTokens.filter((t) => t.actor).map((t) => t.actor);
  }

  /**
   * @returns {TeriockToken[]}
   */
  get targetedTokens() {
    const user = /** @type {TeriockUser} */ game.user;
    return /** @type {TeriockToken[]} */ Array.from(user.targets);
  }

  /**
   * @returns {TeriockToken[]}
   */
  get tokens() {
    if (this.targeted) {
      return this.targetedTokens;
    }
    return this.selectedTokens;
  }

  /**
   * @param {MouseEvent} event
   * @private
   */
  _setup(event) {
    this.event = event;
    this.commonRollOptions.advantage = event.altKey;
    this.commonRollOptions.disadvantage = event.shiftKey;
    this.critRollOptions.crit = event.altKey;
    this.targeted = event.ctrlKey;
  }

  /**
   * Double-click action.
   * @returns {Promise<void>}
   */
  async doubleClickAction() {
  }

  /**
   * Handle events.
   * @param {MouseEvent} event
   * @returns {Promise<void>}
   */
  async handleEvent(event) {
    this._setup(event);
    if (event.type === "click") {
      await this.primaryAction();
    } else if (event.type === "contextmenu") {
      await this.secondaryAction();
    } else if (event.type === "auxclick") {
      await this.secondaryAction();
    } else if (event.type === "dblclick") {
      await this.doubleClickAction();
    }
  }

  /**
   * Left-click action.
   * @returns {Promise<void>}
   */
  async primaryAction() {
  }

  /**
   * Right-click action.
   * @returns {Promise<void>}
   */
  async secondaryAction() {
  }

  /**
   * Middle-click action.
   * @returns {Promise<void>}
   */
  async tertiaryAction() {
  }
}