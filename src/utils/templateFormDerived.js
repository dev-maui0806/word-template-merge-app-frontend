import dayjs from 'dayjs';

const REF_DATE = '2000-01-01';
const HH_MM_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const BOOKING_DURATION_MINUTES = 15;
const REPORT_DURATION_MINUTES = 5;

const TIME_SEED_PRIORITY = [
  'Start_Time_For_Booking_Venue',
  'Start_Time_For_Cancel_Venue',
  'Start_Time_For_Cancel_Notary',
  'Start_Time_For_Cancel_Transportation',
  'Start_Time_For_Arrange_Transportation',
  'Start_Time_For_Booking_Transportation',
  'Start_Time_For_Arrange_Accommodation',
  'Start_Time_For_Cancel_Accommodation',
  'Start_Time_For_Arrange_Notary',
];

export function isHiddenFromFormUiClient(name) {
  if (!name || typeof name !== 'string') return true;
  const u = name.toUpperCase();
  if (u === 'COUNTRY') return true;
  if (u.startsWith('COUNTRY_')) return true;
  if (u.includes('CURRENCY') && u.includes('COUNTRY')) return true;
  if (/^Country_(Standard_Time|Code|Standard_Time_Short|Currency)/i.test(name)) return true;
  return false;
}

function pickTimeSeedKeyValue(input) {
  if (!input || typeof input !== 'object') return null;

  for (const key of TIME_SEED_PRIORITY) {
    const v = input[key];
    if (v != null && String(v).trim()) return { key, value: String(v).trim() };
  }

  for (const [key, v] of Object.entries(input)) {
    if (key.startsWith('Start_Time_') && v != null && String(v).trim()) return { key, value: String(v).trim() };
  }

  const et = input.Event_Time;
  if (et != null && String(et).trim()) return { key: 'Event_Time', value: String(et).trim() };

  return null;
}

function convertKmToMilesClient(km) {
  const num = Number(km);
  if (Number.isNaN(num) || num < 0) return '';
  const miles = Math.round(num * 0.621371 * 100) / 100;
  return miles.toFixed(2);
}

function formatDateOfFRPreview(isoOrDate) {
  if (!isoOrDate) return '';
  const d = dayjs(isoOrDate);
  if (!d.isValid()) return '';
  return d.format('MM/DD/YYYY');
}

function deriveEventDayPreview(isoOrDate) {
  if (!isoOrDate) return '';
  const d = dayjs(isoOrDate);
  if (!d.isValid()) return '';
  return d.format('dddd');
}

function runTimeAutomationClientGeneric(startTime) {
  const s = String(startTime || '').trim();
  if (!HH_MM_REGEX.test(s)) return null;

  const startBooking = dayjs(`${REF_DATE} ${s}`);
  const endBooking = startBooking.add(BOOKING_DURATION_MINUTES, 'minute');
  const startReport = endBooking;
  const endReport = startReport.add(REPORT_DURATION_MINUTES, 'minute');

  const totalMinutes = BOOKING_DURATION_MINUTES + REPORT_DURATION_MINUTES;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const totalTimeFormatted = `${hours}h${minutes}m`;

  return {
    start: startBooking.format('HH:mm'),
    end: endBooking.format('HH:mm'),
    reportStart: startReport.format('HH:mm'),
    reportEnd: endReport.format('HH:mm'),
    total: totalTimeFormatted,
  };
}

/**
 * Live UI preview for computed template variables (all action types).
 * Mirrors backend common automation: Event_Date → Date_of_FR / Event_Day, km → miles, time chain.
 */
export function computeTemplateFormDerived(data) {
  const d = {};

  const ev = data?.Event_Date;
  if (ev && dayjs(ev).isValid()) {
    d.Date_of_FR = formatDateOfFRPreview(ev);
    d.Event_Day = deriveEventDayPreview(ev);
  }

  const km = data?.Distance_In_Kilometres;
  if (km !== '' && km != null && String(km).trim() !== '') {
    const miles = convertKmToMilesClient(km);
    if (miles) d.Distance_In_Miles = miles;
  }

  const seed = pickTimeSeedKeyValue(data);
  if (seed) {
    const res = runTimeAutomationClientGeneric(seed.value);
    if (res) {
      // Always fill shared computed fields used across templates
      d.Start_Time_For_Report_Preparation = res.reportStart;
      d.End_Time_For_Report_Preparation = res.reportEnd;
      d.Total_Time = res.total;
      d.Service_Time = res.total;

      // If the template uses a "Start_Time_For_X" field, fill its matching "End_Time_For_X"
      if (seed.key && seed.key.startsWith('Start_Time_')) {
        const endKey = seed.key.replace(/^Start_Time_/, 'End_Time_');
        d[endKey] = res.end;
      }

      // Keep arrange-venue canonical outputs too (some templates reuse them)
      d.Start_Time_For_Booking_Venue = res.start;
      d.End_Time_For_Booking_Venue = res.end;
    }
  }

  return d;
}

