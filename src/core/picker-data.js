// Canonical option datasets for the spread editors. Every picker uses the
// same roster, learnset, and nature sources; callers may still narrow moves
// for a specific job such as choosing a damaging attack.
export function pokemonOptions(ctx) {
  return ctx.species.map(p => ({
    value: p.name,
    label: p.name,
    subtitle: p.types.join(' / '),
    search: [p.name, ...p.types, ...Object.values(p.abilities||{}),
      ...(ctx.learnsets[p.id]||[]).map(id=>ctx.gen.moves.get(id)?.name||id)].join(' '),
    pokemon: p
  }));
}

export function natureOptions(ctx) {
  return ctx.natures.map(name=>({name,...(ctx.gen.natures.get(ctx.id(name))||{})}));
}

export function learnableMoveOptions(ctx, species) {
  return [...new Map((ctx.learnsets[ctx.id(species)]||[])
    .map(id=>ctx.gen.moves.get(id))
    .filter(move=>move&&['Physical','Special','Status'].includes(move.category))
    .map(move=>[move.name,{...move,...(ctx.moveText?.[ctx.id(move.name)]||{}),name:move.name,type:move.type,category:move.category,basePower:move.basePower}]))
    .values()].sort((a,b)=>a.name.localeCompare(b.name));
}
