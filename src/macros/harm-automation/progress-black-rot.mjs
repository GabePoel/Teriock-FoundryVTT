if (actor) {
  let found = 0;
  for (let i = 5; i > 0; i--) {
    const identifier = `consequence:stage-${i}-black-rot`;
    const consequence = await teriock.fromIdentifier(identifier, {
      localDocument: actor,
      localOnly: true,
    });
    if (!consequence) continue;
    found++;
    if (i >= 5) continue;
    await consequence.delete();
    await teriock.helpers.resolve.ensureChildren(actor, [`consequence:stage-${i + 1}-black-rot`]);
  }
  if (found === 0) {
    await teriock.helpers.resolve.ensureChildren(actor, [`consequence:stage-1-black-rot`]);
  }
}
