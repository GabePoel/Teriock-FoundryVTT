import ConstructDocumentsAutomation from "../../automations/construct-documents-automation/construct-documents-automation.mjs";
import { ConstructNodesPseudoDocumentMixin } from "../../mixins/_module.mjs";
import { AutomationActivationFactory } from "../abstract/_module.mjs";

export default class ConstructDocumentsActivation
  extends ConstructNodesPseudoDocumentMixin(AutomationActivationFactory(ConstructDocumentsAutomation))
{
  /** @inheritDoc */
  async primaryAction() {
    if (!this.checkActors()) { return; }
    const operations = [];
    for (const node of this.rootNodes) {
      for (const actor of this.actors) {
        const ops = await node.getAddChildrenOperations([actor], {
          actor,
          data: { "flags.teriock.createdBy": this.uuid },
        });
        operations.push(...ops);
      }
    }
    await foundry.documents.modifyBatch(operations);
  }

  /** @inheritDoc */
  async secondaryAction() {
    if (!this.checkActors()) { return; }
    await Promise.all(this.actors.map(async a => {
      const children = await a.children.getContents();
      if (this.target === "armament") {
        for (const armament of a.armaments) { children.push(...(await armament.children.getContents())); }
      }
      if (this.target === "item") {
        for (const item of a.items.contents) { children.push(...(await item.children.getContents())); }
      }
      const toDelete = children.filter(c => c.getFlag("teriock", "createdBy") === this.uuid);
      if (this.target === "armament") { await Promise.all(toDelete.map(d => d.delete())); }
      else {
        const effectsToDelete = toDelete.filter(d => d.documentName === "ActiveEffect");
        const itemsToDelete = toDelete.filter(d => d.documentName === "Item");
        const operations = [];
        if (effectsToDelete.length > 0) {
          const ids = Array.from(new Set(effectsToDelete.map(e => e.id)));
          operations.push(a.getDeleteChildDocumentsOperation("ActiveEffect", ids));
        }
        if (itemsToDelete.length > 0) {
          const ids = Array.from(new Set(itemsToDelete.map(i => i.id)));
          operations.push(a.getDeleteChildDocumentsOperation("Item", ids));
        }
        await foundry.documents.modifyBatch(operations.filter(Boolean));
      }
    }));
    ui.notifications.success("TERIOCK.ACTIVATIONS.AddDocuments.NOTIFICATIONS.removed", { localize: true });
  }
}
