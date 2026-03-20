import dayjs from 'dayjs';

const REF_DATE = '2000-01-01';
const HH_MM_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const BOOKING_DURATION_MINUTES = 15;
const REPORT_DURATION_MINUTES = 5;

/**
 * Mirrors backend timeAutomation for live UI preview (arrange-venue only).
 */
export function runTimeAutomationClient(startTime) {
  const s = String(startTime || '').trim();
  if (!HH_MM_REGEX.test(s)) return {};

  const startBooking = dayjs(`${REF_DATE} ${s}`);
  const endBooking = startBooking.add(BOOKING_DURATION_MINUTES, 'minute');
  const startReport = endBooking;
  const endReport = startReport.add(REPORT_DURATION_MINUTES, 'minute');

  const totalMinutes = BOOKING_DURATION_MINUTES + REPORT_DURATION_MINUTES;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const totalTimeFormatted = `${hours}h${minutes}m`;

  return {
    Start_Time_For_Booking_Venue: startBooking.format('HH:mm'),
    End_Time_For_Booking_Venue: endBooking.format('HH:mm'),
    Start_Time_For_Report_Preparation: startReport.format('HH:mm'),
    End_Time_For_Report_Preparation: endReport.format('HH:mm'),
    Total_Time: totalTimeFormatted,
    Service_Time: totalTimeFormatted,
  };
}

export function convertKmToMilesClient(km) {
  const num = Number(km);
  if (Number.isNaN(num) || num < 0) return '';
  const miles = Math.round(num * 0.621371 * 100) / 100;
  return miles.toFixed(2);
}

/** Design-friendly date preview for Date of FR (numeric). */
export function formatDateOfFRPreview(isoOrDate) {
  if (!isoOrDate) return '';
  const d = dayjs(isoOrDate);
  if (!d.isValid()) return '';
  return d.format('MM/DD/YYYY');
}

export function deriveEventDayPreview(isoOrDate) {
  if (!isoOrDate) return '';
  const d = dayjs(isoOrDate);
  if (!d.isValid()) return '';
  return d.format('dddd');
}
