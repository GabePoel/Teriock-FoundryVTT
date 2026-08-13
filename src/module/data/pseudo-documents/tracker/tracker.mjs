import { toKebabCase } from "../../../helpers/string.mjs";
import { objectMap } from "../../../helpers/utils.mjs";
import { BasePseudoDocument } from "../abstract/_module.mjs";

const { fields } = foundry.data;

export default class Tracker extends BasePseudoDocument {
  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      associateActor: new fields.BooleanField(),
      associatedDocumentUuids: new fields.SetField(new fields.DocumentUUIDField()),
      group: new fields.BooleanField(),
      status: new fields.StringField({
        choices: () => objectMap(TERIOCK.statuses.conditions, c => c.name, { localize: true, none: true }),
      }),
    });
  }

  /**
   * An id that designates the status group this corresponds to.
   * @return {string|null}
   */
  get groupId() {
    if (!this.group) { return null; }
    return `${this.trackedIdentifier}.${this.id}`;
  }

  /**
   * Whether this should be tracked in the status group registry.
   * @return {boolean}
   */
  get shouldTrackInRegistry() {
    return this.group && this.actor && !this.document.inCompendium;
  }

  /**
   * An identifier for the status this corresponds to.
   * @return {Identifier}
   */
  get trackedIdentifier() {
    if (this.status) { return toKebabCase(this.status); }
    return this.document.forcedIdentifier;
  }

  /**
   * Documents this is associated with.
   * @return {Promise<TeriockDocument[]>}
   */
  async getAssociatedDocuments() {
    const uuids = Array.from(this.associatedDocumentUuids);
    if (this.actor && this.associateActor) { uuids.push(this.actor.uuid); }
    if (this.group) { uuids.push(...game.teriock.statusGroups.get(this.groupId)); }
    const associatedDocuments = await Promise.all(Array.from(new Set(uuids)).map(uuid => fromUuid(uuid)));
    return associatedDocuments.filter(d => d?.name && d?.img);
  }
}
