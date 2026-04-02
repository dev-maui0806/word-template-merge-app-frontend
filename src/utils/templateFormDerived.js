import dayjs from 'dayjs';
import { convertKmToMilesClient, deriveEventDayPreview, runTimeAutomationClient } from './arrangeVenueClientDerived.js';

/**
 * Preferred order for time-automation seed (align with backend).
 * Any other field whose name starts with `Start_Time` (case-insensitive) is tried after this list.
 * `Event_Time` is not used as a seed — automation runs only when a start-time field is set.
 */
const TIME_SEED_PRIORITY = [
  'Start_Time_For_Booking_Venue',
  'Start_Time_For_Cancel_Venue',
  'Start_Time_For_Cancel_Notary',
  'Start_Time_For_Cancel_Transportation',
  'Start_Time_For_Cancel_Accommodation',
  'Start_Time_For_Arrange_Transportation',
  'Start_Time_For_Arrange_Accommodation',
  'Start_Time_For_Arrange_accommodation',
  'Start_Time_For_Booking_Transportation',
  'Start_Time_For_Booking_Accommodation',
];

function nonEmptyTrimmed(v) {
  if (v == null) return null;
  const s = String(v).trim();
  return s || null;
}

export function pickTimeAutomationSeed(input) {
  if (!input || typeof input !== 'object') return null;
  for (const key of TIME_SEED_PRIORITY) {
    const v = nonEmptyTrimmed(input[key]);
    if (v) return v;
  }
  const startKeys = Object.keys(input).filter((k) => k.toLowerCase().startsWith('start_time'));
  startKeys.sort();
  for (const key of startKeys) {
    const v = nonEmptyTrimmed(input[key]);
    if (v) return v;
  }
  return null;
}

/**
 * Live UI preview for computed template variables (all action types).
 */
export function computeTemplateFormDerived(data) {
  const d = {};
  const dataObj = data && typeof data === 'object' ? data : {};
  const normalizeKey = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const eventDateKey = Object.keys(dataObj).find((k) => normalizeKey(k) === 'EVENTDATE');
  const ev = eventDateKey ? dataObj[eventDateKey] : dataObj?.Event_Date;
  if (ev && dayjs(ev).isValid()) {
    d.Event_Day = deriveEventDayPreview(ev);
  }
  const km = data?.Distance_In_Kilometres;
  if (km !== '' && km != null && String(km).trim() !== '') {
    const miles = convertKmToMilesClient(km);
    if (miles) d.Distance_In_Miles = miles;
  }
  const seed = pickTimeAutomationSeed(data);
  if (seed) {
    Object.assign(d, runTimeAutomationClient(seed));
  }
  return d;
}
