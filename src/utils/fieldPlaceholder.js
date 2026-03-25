function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getKeywordPlaceholder(source, type) {
  const s = normalize(source);

  if (type === 'date') {
    if (s.includes('date of fr') || s.includes('date of f r')) return 'Select date of FR';
    if (s.includes('event date')) return 'Select event date';
    if (s.includes('pick up date') || s.includes('pickup date')) return 'Select pick-up date';
    return 'Select date';
  }

  if (type === 'time') {
    if (s.includes('event time')) return 'Select event time';
    if (s.includes('start time')) return 'Select start time';
    if (s.includes('end time')) return 'Select end time';
    if (s.includes('service time')) return 'Select service time';
    if (s.includes('report preparation')) return 'Select report preparation time';
    if (s.includes('pick up time') || s.includes('pickup time')) return 'Select pick-up time';
    return 'Select time';
  }

  if (s.includes('name')) return `Enter ${s}`;
  if (s.includes('address')) return 'Enter address';
  if (s.includes('email')) return 'Enter email address';
  if (s.includes('phone') || s.includes('mobile')) return 'Enter phone number';
  if (s.includes('distance') && s.includes('mile')) return 'Enter distance in miles';
  if (s.includes('distance') && s.includes('kilometre')) return 'Enter distance in kilometres';
  if (s.includes('distance') && s.includes('kilometer')) return 'Enter distance in kilometers';
  if (s.includes('number') || s.includes('no.')) return `Enter ${s}`;
  if (s.includes('location')) return `Enter ${s}`;
  if (s.includes('type')) return `Enter ${s}`;
  if (s.includes('colour') || s.includes('color')) return `Enter ${s}`;
  if (s.includes('venue')) return `Enter ${s}`;
  if (s.includes('claimant')) return `Enter ${s}`;
  if (s.includes('driver')) return `Enter ${s}`;
  if (s.includes('car')) return `Enter ${s}`;
  if (s.includes('total')) return `Enter ${s}`;

  return '';
}

export function resolveFieldPlaceholder(field) {
  const explicit = String(field?.placeholder || '').trim();
  if (explicit) return explicit;

  const type = String(field?.type || '').toLowerCase();
  const label = String(field?.label || '').trim();
  const name = String(field?.name || '').trim();
  const source = label || name;

  if (!source) {
    if (type === 'date') return 'Select date';
    if (type === 'time') return 'Select time';
    return 'Enter value';
  }

  const fromKeyword = getKeywordPlaceholder(source, type);
  if (fromKeyword) return fromKeyword;

  const pretty = normalize(source);
  if (type === 'date') return 'Select date';
  if (type === 'time') return 'Select time';
  if (type === 'textarea') return `Enter ${pretty}`;
  if (type === 'number') return `Enter ${pretty}`;
  if (type === 'text' || type === 'select') return `Enter ${pretty}`;
  return `Enter ${pretty}`;
}
