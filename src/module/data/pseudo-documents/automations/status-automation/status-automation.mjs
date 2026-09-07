import ChatStatusAutomation from "../chat-status-automation/chat-status-automation.mjs";

const { fields } = foundry.data;

export default class StatusAutomation extends ChatStatusAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Status"];

  /** @inheritDoc */
  static get _relationChoices() {
    return { ...super._relationChoices, include: _loc("TERIOCK.AUTOMATIONS.Status.FIELDS.relation.choices.include") };
  }

  /** @inheritDoc */
  static get _relationInitial() {
    return "include";
  }

  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { type: "status" });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      executor: new fields.BooleanField(),
      multi: new fields.BooleanField(),
      target: new fields.BooleanField(),
    });
  }

  /** @type {UUID<TeriockTokenDocument|TeriockActor>[]} */
  #trackedUuids = [];

  /**
   * Add the association between this status and the documents it is tracked with respect to.
   * @param {object} data
   * @returns {Promise<void>}
   */
  async #addAssociation(data) {
    const associations = foundry.utils.getProperty(data, "system.associations") ?? [];
    const association = await this.#getAssociation();
    const existing = associations.find(a => a.title === association.title);
    if (existing) {
      const uuids = new Set(existing.cards.map(c => c.documentUuid));
      existing.cards.push(...association.cards.filter(c => !uuids.has(c.documentUuid)));
    } else { associations.push(association); }
    foundry.utils.setProperty(data, "system.associations", associations);
  }

  /**
   * Add the changes that track which documents this status is applied with respect to.
   * @param {object} data
   */
  #addTrackers(data) {
    const changes = foundry.utils.getProperty(data, "changes") ?? [];
    const key = `system.conditionInformation.${this.status}.trackers`;
    const tracked = new Set(changes.filter(c => c.key === key).map(c => c.value));
    changes.push(
      ...this.#trackedUuids.filter(uuid => !tracked.has(uuid)).map(uuid => ({
        key,
        phase: "initial",
        priority: 10,
        type: "add",
        value: uuid,
      })),
    );
    foundry.utils.setProperty(data, "changes", changes);
  }

  /**
   * The association between this status and the documents it is tracked with respect to.
   * @returns {Promise<Teriock.Panels.PanelAssociation>}
   */
  async #getAssociation() {
    return {
      cards: await Promise.all(this.#trackedUuids.map(async uuid => {
        const doc = await fromUuid(uuid);
        return { documentUuid: uuid, img: doc.img, name: doc.name };
      })),
      icon: TERIOCK.config.document.creature.icon,
      title: _loc("TERIOCK.SYSTEMS.Ability.PANELS.statusWithRespectTo", {
        status: TERIOCK.reference.conditions[this.status],
      }),
    };
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = super._formPaths;
    if (this.relation === "include" && !this.isPassive) {
      paths.push(...["hr", "executor", "target"]);
      if (this.target) { paths.push("multi"); }
    }
    return paths;
  }

  /** @inheritDoc */
  async interactOnExecutionEffectData(execution) {
    this.#trackedUuids = [];
    if (this.target) { this.#trackedUuids.push(...(await this.selectVisibleTokens()).map(t => t.uuid)); }
    if (this.executor) {
      const uuid = execution.actor?.defaultToken?.document?.uuid || execution.actor?.uuid;
      if (uuid) { this.#trackedUuids.push(uuid); }
    }
  }

  /** @inheritDoc */
  async modifyExecutionEffectData(execution, data) {
    await super.modifyExecutionEffectData(execution, data);
    if (this.relation === "include") {
      const statuses = foundry.utils.getProperty(data, "statuses") ?? [];
      if (!statuses.includes(this.status)) { statuses.push(this.status); }
      foundry.utils.setProperty(data, "statuses", statuses);
    }
    if (!this.#trackedUuids.length) { return; }
    await this.#addAssociation(data);
    this.#addTrackers(data);
  }

  /**
   * Select visible tokens to associate this status with.
   * @param {Teriock.Select.SelectDocumentsDialogOptions} options
   * @returns {Promise<TeriockTokenDocument[]>}
   */
  async selectVisibleTokens(options = {}) {
    return game.user.selectVisibleTokens({
      hint: _loc("TERIOCK.AUTOMATIONS.Status.DIALOGS.SelectVisibleTokens.hint", {
        effect: this.document?.name || _loc("TERIOCK.AUTOMATIONS.Status.DIALOGS.SelectVisibleTokens.effect"),
        status: TERIOCK.reference.conditions[this.status],
      }),
      multi: this.multi,
      ...options,
    });
  }
}
