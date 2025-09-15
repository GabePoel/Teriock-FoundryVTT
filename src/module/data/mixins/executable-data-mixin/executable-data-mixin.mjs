const { fields } = foundry.data;

/**
 * Mixin that provides executable functionality.
 * @param {ChildTypeModel} Base
 */
export default (Base) => {
  return (/**
   * @implements {ExecutableDataMixinInterface}
   * @extends ChildTypeModel
   */
  class ExecutableDataMixin extends Base {
    /** @inheritDoc */
    static defineSchema() {
      const schema = super.defineSchema();
      Object.assign(schema, {
        macros: new fields.SetField(new fields.DocumentUUIDField()),
      });
      return schema;
    }

    /** @inheritDoc */
    async use(options) {
      await super.use(options);
      const macroPromises = Array.from(this.macros.map((uuid) => foundry.utils.fromUuid(uuid)));
      const macros = /** @type {TeriockMacro[]} */ await Promise.all(macroPromises);
      for (const macro of macros) {
        await macro.execute({
          actor: this.actor,
          document: this.parent,
        });
      }
    }

    /**
     * Unlink a macro.
     * @param {Teriock.UUID<TeriockMacro>} uuid
     * @returns {Promise<void>}
     */
    async unlinkMacro(uuid) {
      const macroUuids = new Set(Array.from(this.macros));
      macroUuids.delete(uuid);
      const updateData = {
        "system.macros": Array.from(macroUuids),
      };
      await this.parent.update(updateData);
    }
  });
}
