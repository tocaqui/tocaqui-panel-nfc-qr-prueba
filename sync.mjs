export function changes(before,after) {
  const old = new Map(before.map(x=>[x.id,JSON.stringify(x)]));
  const ids = new Set(after.map(x=>x.id));
  return {upserts:after.filter(x=>old.get(x.id)!==JSON.stringify(x)),deletes:before.filter(x=>!ids.has(x.id)).map(x=>x.id)};
}
