import dayjs from 'dayjs';
import { convertKmToMilesClient, deriveEventDayPreview, runTimeAutomationClient } from './arrangeVenueClientDerived.js';

/**
 * Preferred order for time-automation seed (align with backend).
 * Any other `Start_Time_*` with a value is tried after this list, then `Event_Time`.
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
  const startKeys = Object.keys(input).filter((k) => k.startsWith('Start_Time_'));
  startKeys.sort();
  for (const key of startKeys) {
    const v = nonEmptyTrimmed(input[key]);
    if (v) return v;
  }
  return nonEmptyTrimmed(input.Event_Time);
}

/**
 * Live UI preview for computed template variables (all action types).
 */
export function computeTemplateFormDerived(data) {
  const d = {};
  const ev = data?.Event_Date;
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
