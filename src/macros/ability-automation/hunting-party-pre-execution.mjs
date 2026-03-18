const flankingButton = scope.execution.buttons.find(
  (b) => b.dataset.action === "apply-effect",
);
if (flankingButton) {
  const snareButton = foundry.utils.deepClone(flankingButton);
  const flankingSub = scope.ability.abilities.find(
    (s) => s.system?.identifier === "flanking",
  );
  const snareSub = scope.ability.abilities.find(
    (s) => s.system?.identifier === "snare",
  );
  if (flankingSub) {
    flankingButton.dataset.bonusSubs = JSON.stringify([flankingSub.uuid]);
    flankingButton.label = game.i18n.format(
      "TERIOCK.COMMANDS.Status.applyNamed",
      { name: flankingSub.name },
    );
  }
  if (snareSub) {
    snareButton.dataset.bonusSubs = JSON.stringify([snareSub.uuid]);
    snareButton.label = game.i18n.format("TERIOCK.COMMANDS.Status.applyNamed", {
      name: snareSub.name,
    });
  }
  scope.execution.buttons.push(snareButton);
}
