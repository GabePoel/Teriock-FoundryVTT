import { DocumentSelector } from "../../../applications/dialogs/_module.mjs";
import { icons } from "../../../constants/display/_module.mjs";
import { mergeMetadata, mixClasses } from "../../../helpers/construction.mjs";
import AddDocumentsAutomation from "../automations/add-documents-automation/add-documents-automation.mjs";
import ConstructionNode from "../construction-node/construction-node.mjs";
import { ConstructNodesPseudoDocumentMixin } from "../mixins/_module.mjs";
import { AutomationActivationFactory } from "./abstract/_module.mjs";

export default class AddDocumentsActivation
  extends mixClasses(AutomationActivationFactory(AddDocumentsAutomation), ConstructNodesPseudoDocumentMixin)
{
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { icon: icons.manifest.ui.apply });

  /** @inheritDoc */
  static migrateData(source, options) {
    if (!source.constructionNodes && (source.primary || source.secondary)) {
      // Activation doesn't need migration. This is just left to avoid data corruption.
      delete source.primary;
      delete source.secondary;
    }
    return super.migrateData(source, options);
  }

  /** @inheritDoc */
  get label() {
    if (this.display.label) { return this.display.label; }
    const names = new Set(this.rootNodes.map(n => n.name));
    const name = names.size === 1 ? names.first() : null;
    return name && name !== _loc(ConstructionNode.typeLabel)
      ? _loc("TERIOCK.ACTIVATIONS.AddDocuments.BUTTON.named", { name })
      : _loc("TERIOCK.ACTIVATIONS.AddDocuments.BUTTON.generic");
  }

  /** @inheritDoc */
  async primaryAction() {
    if (!this.checkActors()) { return; }
    const nodes = await this.getNodes();
    if (!nodes.length) { return; }
    const operations = [];
    for (const actor of this.actors) {
      let targets = [actor];
      if (this.target === "armament") { targets = await DocumentSelector.selectMulti(actor.armaments); }
      if (this.target === "item") {
        targets = await DocumentSelector.selectMulti(actor.previewed.filter(c => c.documentName === "Item"));
      }
      if (!targets.length) { continue; }
      for (const node of nodes) {
        const ops = await node.getAddChildrenOperations(targets, {
          actor,
          data: { "flags.teriock.createdBy": this.uuid },
        });
        operations.push(...ops.filter(Boolean));
      }
    }
    if (!operations.length) { return; }
    const results = await foundry.documents.modifyBatch(operations);
    if (!results.length || results.some(r => !r?.length)) {
      ui.notifications.error("TERIOCK.ACTIVATIONS.AddDocuments.NOTIFICATIONS.notAdded", { localize: true });
      return;
    }
    ui.notifications.success("TERIOCK.ACTIVATIONS.AddDocuments.NOTIFICATIONS.added", { localize: true });
  }

  /** @inheritDoc */
  async secondaryAction() {
    if (!this.checkActors()) { return; }
    const toDelete = [];
    for (const a of this.actors) {
      const children = await a.children.getContents();
      if (this.target === "armament") {
        for (const armament of a.armaments) { children.push(...(await armament.children.getContents())); }
      }
      if (this.target === "item") {
        for (const item of a.items.contents) { children.push(...(await item.children.getContents())); }
      }
      toDelete.push(...children.filter(c => c.getFlag("teriock", "createdBy") === this.uuid));
    }
    const batches = new Map();
    for (const doc of toDelete) {
      if (!doc.parent?.getDeleteChildDocumentsOperation) { continue; }
      const key = `${doc.parent.uuid}.${doc.documentName}`;
      if (!batches.has(key)) {
        batches.set(key, { documentName: doc.documentName, ids: new Set(), parent: doc.parent });
      }
      batches.get(key).ids.add(doc.id);
    }
    const operations = Array.from(batches.values()).map(({ documentName, ids, parent }) =>
      parent.getDeleteChildDocumentsOperation(documentName, Array.from(ids))
    ).filter(Boolean);
    const results = await foundry.documents.modifyBatch(operations);
    if (!results.length || results.some(r => !r?.length)) {
      ui.notifications.error("TERIOCK.ACTIVATIONS.AddDocuments.NOTIFICATIONS.notRemoved", { localize: true });
      return;
    }
    ui.notifications.success("TERIOCK.ACTIVATIONS.AddDocuments.NOTIFICATIONS.removed", { localize: true });
  }
}
