import TypedPseudoDocument from "../../abstract/typed-pseudo-document.mjs";

const { fields } = foundry.data;

/**
 * @extends {Teriock.Activations.BaseActivationData}
 */
export default class BaseActivation extends TypedPseudoDocument {
  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { documentName: "Activation", label: _loc("TERIOCK.ACTIVATIONS.Base.LABEL") });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      display: new fields.SchemaField({
        classes: new fields.SetField(new fields.StringField()),
        icon: new fields.StringField(),
        label: new fields.StringField(),
        tooltip: new fields.StringField(),
      }),
    });
  }

  /** @type {TeriockActor[]} */
  #actors;

  /** @type {PointerEvent} */
  #event;

  /** @type {TeriockActor[]} */
  #tokens;

  /**
   * Actors to affect when this button is activated.
   * @returns {TeriockActor[]}
   */
  get actors() {
    return this.#actors ?? this.selectedActors;
  }

  /**
   * Actors to affect when this button is activated.
   * @param {TeriockActor[]} actors
   */
  set actors(actors) {
    this.#actors = actors;
  }

  /**
   * Classes for a button made from this.
   * @returns {string}
   */
  get classes() {
    return Array.from(this.display.classes).join(" ");
  }

  /**
   * The event activating this.
   * @returns {PointerEvent|{}}
   */
  get event() {
    return this.#event ?? {};
  }

  /**
   * The event activating this.
   * @param {PointerEvent} event
   */
  set event(event) {
    this.#event = event;
  }

  /** @inheritDoc */
  get icon() {
    return this.display.icon || super.icon;
  }

  /** @inheritDoc */
  get label() {
    return this.display.label || super.label;
  }

  /**
   * Currently selected actors.
   * @returns {TeriockActor[]}
   */
  get selectedActors() {
    return game.actors.selected;
  }

  /**
   * Currently selected tokens.
   * @returns {TeriockToken[]}
   */
  get selectedTokens() {
    return game.canvas?.tokens.controlled ?? [];
  }

  /**
   * Currently targeted actors.
   * @returns {(TeriockActor|null)[]}
   */
  get targetedActors() {
    return this.targetedTokens.map(t => t.actor).filter(Boolean);
  }

  /**
   * Currently targeted tokens.
   * @returns {TeriockToken[]}
   */
  get targetedTokens() {
    return Array.from(this.user.targets);
  }

  /**
   * Token documents to affect when this button is activated.
   * @returns {TeriockTokenDocument[]}
   */
  get tokenDocuments() {
    return this.tokens.map(t => t.document).filter(Boolean);
  }

  /**
   * Tokens to affect when this button is activated.
   * @returns {TeriockToken[]}
   */
  get tokens() {
    return this.#tokens ?? this.selectedTokens;
  }

  /**
   * Tokens to affect when this button is activated.
   * @param {TeriockToken[]} tokens
   */
  set tokens(tokens) {
    this.#tokens = tokens;
  }

  /**
   * A tooltip for this activation's button to display.
   * @returns {string}
   */
  get tooltip() {
    return this.display.tooltip || "";
  }

  /**
   * The user that activated this button.
   * @returns {TeriockUser}
   */
  get user() {
    return game.user;
  }

  /**
   * Whether this activation should be visible to current user.
   * @returns {boolean}
   */
  get visible() {
    return true;
  }

  /**
   * Whether this activation has actors.
   * @returns {boolean}
   */
  checkActors() {
    return game.teriock.checkActors(this.actors);
  }

  /**
   * Whether this activation has tokens.
   * @returns {boolean}
   */
  checkTokens() {
    return game.teriock.checkTokens(this.tokens);
  }

  /**
   * Code that runs when this button is left-clicked.
   * @returns {Promise<void>}
   */
  async primaryAction() {}

  /**
   * Code that runs when this button is right-clicked.
   * @returns {Promise<void>}
   */
  async secondaryAction() {}
}
