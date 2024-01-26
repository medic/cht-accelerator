const { DateTime } = require('luxon');

const FAMILY_PLANNING_FORMS = ['fp_registration', 'fp_follow_up'];
const FAMILY_PLANNING_METHODS = {
  combined_oral_contraceptives: 'Combined Oral Contraceptive Pills- COCs',
  progestreone_only_pills: 'Progesterone Only Pills (POPs)',
  dmpa_im: 'DMPA-IM',
  dmpa_sc: 'DMPA-SC (for e.g. Sayana Press)',
  implant: 'Implants',
  iud: 'IUD',
  condoms: 'Condoms',
  tubal_ligation: 'Tubal Ligation'
};

const FUTURE_DELIVERY_DATE_WARNING = 'The latest delivery can not be in the future, device date may be wrong';

const IMMUNIZATIONS = {
  bcg: 'BCG',
  polio: 'Polio',
  dpt1: 'DPT-HEPB-HIB 1',
  pcv1: 'PCV1',
  rv1: 'Rotavirus Vaccine 1'
};

const isUnder5 = (contact) => {
  if (!contact.date_of_birth) {
    console.warn(`Invalid Contact: Does not have Date of Birth: ${contact._id}`);
    return false;
  }
  const dob = DateTime.fromFormat(contact.date_of_birth, 'yyyy-MM-dd');
  const ageInYears = DateTime.now().diff(dob, ['years']).toObject().years;
  return ageInYears < 5;
};

const getMostRecentReportFromFormArray = (reports, forms, fields) => {
  let result = null;
  reports.forEach(function (report) {
    if (forms.includes(report.form) &&
      !report.deleted && (!result || (report.reported_date > result.reported_date)) &&
      (!fields || (report.fields && Utils.fieldsMatch(report, fields)))
    ) {
      result = report;
    }
  });
  return result;
};

const getCurrentEDD = (reports) => {
  const latestReport = getMostRecentReportFromFormArray(reports, [
    'pregnancy', 'anc_visit_follow_up'
  ]);

  return latestReport && Utils.getField(latestReport, 'edd_std');
};

const getNewestANCAppointmentDate = (reports) => {
  const latestReport = getMostRecentReportFromFormArray(reports, [
    'pregnancy', 'anc_visit_follow_up'
  ]);
  if (!latestReport) { return; }
  if (latestReport.form === 'anc_visit_follow_up') {
    return Utils.getField(latestReport, 'group_upcoming_anc_visits.anc_appointment_date');
  } else {
    return Utils.getField(latestReport, 'group_scheduled_anc_visits.anc_appointment_date');
  }
};

const getDaysElapsedSinceLastReport = (reports, form, fields) => {
  const latestReportDate = Utils.getMostRecentTimestamp(reports, form, fields);
  if (!latestReportDate) { return; }

  const daysElapsed = DateTime.fromMillis(latestReportDate).diffNow('days').days;
  if (daysElapsed > 0) {
    console.warn('The latest report date can not be in the future, device date may be wrong');
    return;
  }

  return Math.abs(daysElapsed);
};

module.exports = {
  isUnder5,
  FAMILY_PLANNING_FORMS,
  FAMILY_PLANNING_METHODS,
  FUTURE_DELIVERY_DATE_WARNING,
  IMMUNIZATIONS,
  getCurrentEDD, 
  getNewestANCAppointmentDate, 
  getDaysElapsedSinceLastReport,
  getMostRecentReportFromFormArray
};
