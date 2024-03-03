const { DateTime } = require('luxon');

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
  getCurrentEDD, 
  getNewestANCAppointmentDate, 
  getDaysElapsedSinceLastReport,
  getMostRecentReportFromFormArray
};
