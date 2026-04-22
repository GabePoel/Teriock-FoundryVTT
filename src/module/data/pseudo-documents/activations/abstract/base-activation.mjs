import TypedPseudoDocument from "../../abstract/typed-pseudo-document.mjs";

const { fields } = foundry.data;

/**
 * @extends {Teriock.Activations.BaseActivationData}
 */
export default class BaseActivation extends TypedPseudoDocument {
  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      display: new fields.SchemaField({
        classes: new fields.SetField(new fields.StringField()),
        icon: new fields.StringField(),
        label: new fields.StringField(),
      }),
    });
  }

  /** @type {PointerEvent} */
  event;

  /**
   * Actors to affect when this button is activated.
   * @returns {TeriockActor[]}
   */
  get actors() {
    return this.selectedActors;
  }

  /**
   * Classes for a button made from this.
   * @returns {string}
   */
  get classes() {
    return Array.from(this.display.classes).join(" ");
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
    return game.canvas.tokens.controlled;
  }

  /**
   * Currently targeted actors.
   * @returns {(TeriockActor|null)[]}
   */
  get targetedActors() {
    return this.targetedTokens.map((t) => t.actor).filter((_) => _);
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
    return this.tokens.map((t) => t.document).filter((_) => _);
  }

  /**
   * Tokens to affect when this button is activated.
   * @returns {TeriockToken[]}
   */
  get tokens() {
    return this.selectedTokens;
  }

  /**
   * The user that activated this button.
   * @returns {TeriockUser}
   */
  get user() {
    return game.user;
  }

  /**
   * Whether this activation has actors.
   * @returns {boolean}
   */
  checkActors() {
    const pass = this.actors.length > 0;
    if (!pass) {
      ui.notifications.error(
        "TERIOCK.ACTIVATIONS.Base.NOTIFICATIONS.noActors",
        { localize: true },
      );
    }
    return pass;
  }

  /**
   * Whether this activation has tokens.
   * @returns {boolean}
   */
  checkTokens() {
    const pass = this.tokens.length > 0;
    if (!pass) {
      ui.notifications.error(
        "TERIOCK.ACTIVATIONS.Base.NOTIFICATIONS.noTokens",
        { localize: true },
      );
    }
    return pass;
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
