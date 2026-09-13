import { mergeMetadata, mixClasses } from "../../../../helpers/construction.mjs";
import { localizeChoices } from "../../../../helpers/localization.mjs";
import { omit } from "../../../../helpers/utils.mjs";
import {
  ApplyStatusActivation,
  RemoveStatusActivation,
  ToggleStatusActivation,
} from "../../activations/command-activations.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";
import { TriggerAutomationMixin } from "../mixins/_module.mjs";

const { fields } = foundry.data;

/** Every relationship a condition can have. */
const RELATION_CHOICES = {
  apply: "TERIOCK.AUTOMATIONS.Status.FIELDS.relation.choices.apply",
  include: "TERIOCK.AUTOMATIONS.Status.FIELDS.relation.choices.include",
  remove: "TERIOCK.AUTOMATIONS.Status.FIELDS.relation.choices.remove",
  toggle: "TERIOCK.AUTOMATIONS.Status.FIELDS.relation.choices.toggle",
};

/**
 * @mixes TriggerAutomation
 */
export default class StatusAutomation extends mixClasses(BaseAutomation, TriggerAutomationMixin) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Status"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { type: "status" });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      executor: new fields.BooleanField(),
      multi: new fields.BooleanField(),
      relation: new fields.StringField({
        choices: localizeChoices(RELATION_CHOICES),
        initial: "include",
        label: "TERIOCK.AUTOMATIONS.Base.FIELDS.relation.label",
        nullable: false,
        required: true,
      }),
      status: new fields.StringField({
        choices: TERIOCK.reference.conditions,
        initial: Object.keys(TERIOCK.reference.conditions)[0],
        label: "TERIOCK.COMMON.Condition",
        required: true,
      }),
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
    const paths = ["status", "relation"];
    if (this.relation !== "include") { paths.push(...super._formPaths); }
    else if (!this.isPassive) {
      paths.push(...["hr", "executor", "target"]);
      if (this.target) { paths.push("multi"); }
    }
    return paths;
  }

  /**
   * The relations that are available given what this belongs to.
   * @returns {Record<string, string>}
   */
  get _relationChoices() {
    return localizeChoices(this.hasEffectDataToModify ? RELATION_CHOICES : omit(RELATION_CHOICES, ["include"]));
  }

  /** @inheritDoc */
  get canModifyEffectData() {
    return this.relation === "include" || super.canModifyEffectData;
  }

  /** @inheritDoc */
  async _getActivations() {
    if (this.relation === "apply") { return [new ApplyStatusActivation({ options: { status: this.status } })]; }
    else if (this.relation === "remove") { return [new RemoveStatusActivation({ options: { status: this.status } })]; }
    else if (this.relation === "toggle") { return [new ToggleStatusActivation({ options: { status: this.status } })]; }
    return [];
  }

  /** @inheritDoc */
  _makeFormGroup(path, groupConfig = {}, inputConfig = {}, config = {}) {
    if (path === "relation") { inputConfig.choices = this._relationChoices; }
    return super._makeFormGroup(path, groupConfig, inputConfig, config);
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

  /** @inheritDoc */
  prepareData() {
    super.prepareData();
    if (!this.hasEffectDataToModify && this.relation === "include") { this.relation = "apply"; }
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
