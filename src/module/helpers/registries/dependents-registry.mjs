import BaseRegistryLifecycle from "./abstract/base-registry-lifecycle.mjs";

const { Document } = foundry.abstract;

/**
 * Registry of documents that are dependent on other documents but don't have an elder/child relationship. Based on
 * the implementation in D&D 5E with some Teriock-specific modifications.
 * @implements {Teriock.Registries.MultiRegistry<
 *   ID<AnyChildDocument>|UUID<AnyChildDocument>,
 *   AnyChildDocument,
 *   AnyChildDocument|UUID<AnyChildDocument>
 * >}
 */
export default class DependentsRegistry extends BaseRegistryLifecycle {
  /**
   * Registration of documents that are dependent on some other document but don't have an elder/child
   * relationship. The map is keyed by the UUID of the document, which has dependents and contains a set of UUIDs for
   * that document's dependents. All UUIDs are expected to be world UUIDs or UUIDs of documents with the same
   * ancestor document as the one they are dependent on.
   * @type {Map<ID<AnyChildDocument>|UUID<AnyChildDocument>, Set<UUID<AnyChildDocument>>>}
   */
  #dependents = new Map();

  /**
   * Safely fetch a document given its UUID and a reference document.
   * @param {AnyChildDocument} ref
   * @param {UUID<AnyChildDocument>} uuid
   * @return {AnyChildDocument|null}
   */
  fetchFromUuid(ref, uuid) {
    if (!this.initialized) { return null; }

    // Special handling for documents that share a parent with the reference document. We only need two levels for
    // active effects embedded within items.
    const parent = ref.parent || ref.actor;
    if (parent && uuid.startsWith(parent.uuid)) {
      const embeddedPath = uuid.substring(parent.uuid.length + 1);
      const parts = embeddedPath.split(".");
      if (parts.length === 2) { return parent.getEmbeddedDocument(parts[0], parts[1]); }
      else if (parts.length === 4) {
        const intermediateDocument = parent.getEmbeddedDocument(parts[0], parts[1]);
        return intermediateDocument?.getEmbeddedDocument(parts[2], parts[3]);
      }
    }

    // TODO: Remove this special casing once https://github.com/foundryvtt/foundryvtt/issues/11214 is resolved
    if (ref.parent?.pack && uuid.includes(ref.parent?.uuid)) {
      const [, embeddedName, id] = uuid.replace(ref.parent.uuid, "").split(".");
      return ref.parent.getEmbeddedDocument(embeddedName, id);
    }
    return foundry.utils.fromUuidSync(uuid, { strict: false });
  }

  /**
   * Fetch documents dependent on some other document.
   * @param {AnyChildDocument|UUID<AnyChildDocument>} doc - Document or UUID for which to get dependent documents.
   * @returns {AnyChildDocument[]}
   */
  get(doc) {
    if (!this.initialized) { return []; }
    doc = doc instanceof Document ? doc : foundry.utils.fromUuidSync(doc);
    return Array.from(this.#dependents.get(doc?.uuid) ?? []).map(uuid => this.fetchFromUuid(doc, uuid)).filter(Boolean);
  }

  /**
   * Resolve a document ID into an absolute UUID.
   * @param {ID<AnyChildDocument>|UUID<AnyChildDocument>} idOrUuid - ID or UUID of a document.
   * @param {AnyChildDocument} dependent - Document to track as a dependent.
   * @returns {UUID<AnyChildDocument>}
   */
  resolveDependentID(idOrUuid, dependent) {
    if (idOrUuid.length > 16) { return foundry.utils.parseUuid(idOrUuid, { relative: dependent })?.uuid; }
    if (dependent.parent) {
      return (dependent.parent.effects.get(idOrUuid)
        || dependent.actor?.effects.get(idOrUuid)
        || dependent.actor?.items.get(idOrUuid))?.uuid;
    }
  }

  /**
   * Add a dependent document to the registry.
   * @param {ID<AnyChildDocument>|UUID<AnyChildDocument>} idOrUuid - ID or UUID of a document.
   * @param {AnyChildDocument} dependent - Document to track as a dependent.
   */
  track(idOrUuid, dependent) {
    const uuid = this.resolveDependentID(idOrUuid, dependent);
    if (!uuid) { return; }
    if (!this.#dependents.has(uuid)) { this.#dependents.set(uuid, new Set()); }
    this.#dependents.get(uuid).add(dependent.uuid);
  }

  /**
   * Remove a dependent document from the registry.
   * @param {ID<AnyChildDocument>|UUID<AnyChildDocument>} idOrUuid - ID or UUID of a document.
   * @param {AnyChildDocument} dependent - Dependent document to stop tracking.
   */
  untrack(idOrUuid, dependent) {
    const uuid = this.resolveDependentID(idOrUuid, dependent);
    this.#dependents.get(uuid)?.delete(dependent.uuid);
  }
}
