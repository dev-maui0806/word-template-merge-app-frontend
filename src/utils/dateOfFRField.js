/** Match backend `isDateOfFRVariableName` so country-default dates apply to every FR alias. */
export function isDateOfFRVariableName(name) {
  if (!name || typeof name !== 'string') return false;
  const letters = name.replace(/[^a-zA-Z]/g, '').toLowerCase();
  return letters === 'dateoffr';
}
