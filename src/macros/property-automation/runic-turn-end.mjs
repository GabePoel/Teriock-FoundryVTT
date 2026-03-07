if (
  scope.item.type === "equipment" &&
  scope.item.system.shattered &&
  !scope.item.system.destroyed &&
  scope.item.system.isAttuned
) {
  const content = await TextEditor.implementation.enrichHTML(
    teriock.helpers.string.dedent(`
      <p>${game.i18n.format("TERIOCK.COMMANDS.Repair.prompt", { name: `@UUID[${scope.item.uuid}]` })}</p>
      <p>@EMBED[${scope.effect.uuid} panel cite=false]</p>`),
  );
  const proceed = await teriock.applications.api.TeriockDialog.confirm({
    window: {
      title: game.i18n.format("TERIOCK.MODELS.Duration.PREREQUISITES.text", {
        start: scope.effect.nameString,
        end: scope.item.nameString,
      }),
      icon: teriock.helpers.utils.makeIconClass(
        TERIOCK.display.icons.break.repair,
        "title",
      ),
    },
    content,
    yes: {
      label: game.i18n.format("TERIOCK.ROLLS.Base.name", {
        value: game.i18n.localize("TERIOCK.SYSTEMS.Equipment.MENU.repair"),
      }),
      icon: teriock.helpers.utils.makeIconClass(
        TERIOCK.display.icons.ui.dice,
        "title",
      ),
    },
  });
  if (proceed) {
    const roll = new game.teriock.Roll(
      "2d4kh1",
      {},
      {
        flavor: game.i18n.format("TERIOCK.ROLLS.Base.name", {
          value: game.i18n.localize("TERIOCK.SYSTEMS.Equipment.MENU.repair"),
        }),
        threshold: 4,
      },
    );
    await roll.evaluate();
    await roll.toMessage(
      {
        speaker: ChatMessage.getSpeaker({ actor: scope.item.actor }),
      },
      {
        rollMode: game.settings.get("core", "rollMode"),
      },
    );
    if (roll.total === 4) {
      await scope.item.system.repair();
    }
  }
}
