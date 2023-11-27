const Nootils = require('cht-nootils/src/nootils');
global.Utils = Nootils();

const formInSubmittedWindowMatchesFields = (contact, event, dueDate, form, fields) => {
  let result = false;
  const start = Utils.addDate(dueDate, -event.start).getTime();
  const end = Utils.addDate(dueDate, event.end + 1).getTime();
  contact.reports.forEach(function (report) {
    if (!result && report.form === form) {
      if (report.reported_date >= start && report.reported_date <= end &&
        (!fields || (report.fields && Utils.fieldsMatch(report, fields)))) {
        result = true;
      }
    }
  });
  return result;
};

const isSomeReportInWindow = (reports, formsArray, startTime, endTime, count) => {
  if (typeof formsArray === 'string') {
    formsArray = [formsArray];
  }
  if (formsArray) {
    return formsArray.some(form => Utils.isFormSubmittedInWindow(reports, form, startTime, endTime, count));
  }
};

const resolveIfClosure_isReportInEventWindow = (formTitle) => (contact, report, event, dueDate) => isSomeReportInWindow(
  contact.reports,
  formTitle,
  Utils.addDate(dueDate, -event.start).getTime(),
  Utils.addDate(dueDate, event.end + 1).getTime()
);

const getLatestReferralStatus = function (c, r) {
  let latestReferralStatus = Utils.getField(r, 'referral_follow_up');
  if (latestReferralStatus === 'no') {
    const latestTreatmentFollowUp = Utils.getMostRecentReport(c.reports, 'treatment_follow_up');
    if (latestTreatmentFollowUp) {
      if (Utils.getField(latestTreatmentFollowUp, 'inputs.source_id') === r._id &&
        latestTreatmentFollowUp.reported_date > r.reported_date) {
        latestReferralStatus = Utils.getField(latestTreatmentFollowUp, 'trigger_referral_follow_up');
      }
    }
  }

  return latestReferralStatus;
};

const isSupervisor = () => user.parent.type === 'district_hospital';
const isVHT = () => user.parent.type === 'health_center';

const toDate = (val, plusDays = 0) => {
  let parsedDate = new Date(val);
  if (!Utils.isDateValid(parsedDate)) {
    return undefined;
  }

  /*
  Most date formats are interpretted as local time, but this specific date form is UTC
  new Date('2000-01-02').getDate() west of UTC returns 1 and east of UTC returns 2
  This code adjusts new Date() to ignore this
  */
  const isIsoInput = typeof val === 'string' && val.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/);
  if (isIsoInput) {
    const timezoneOffset = parsedDate.getTimezoneOffset() * 60 * 1000;
    parsedDate = new Date(parsedDate.getTime() + timezoneOffset);
  }

  return Utils.addDate(parsedDate, plusDays);
};

const pregnancyEndedInSubsequentVisit = (contact, report) => {
  const latestANCVisit = Utils.getMostRecentReport(contact.reports, 'anc_visit_follow_up');
  if (!latestANCVisit) { return; }
  const pregnancyEnded = Utils.getField(latestANCVisit, 'pregnancy_ended');
  return pregnancyEnded === 'yes' && Utils.isFirstReportNewer(latestANCVisit, report);
};

const pregnancyEnded = (contact, report) => {
  return pregnancyEndedInSubsequentVisit(contact, report) ||
    report.reported_date < Utils.getMostRecentTimestamp(contact.reports, 'delivery');
};

const isMuted = function (contact) {
  return contact.contact.muted;
};

const ANC_VISITS = [12, 20, 26, 30, 34, 36, 38, 40];

const getDaysToNextANCVisit = (index, visitWeeks) => {
  const nextVisitWeeks = ANC_VISITS[index + 1];
  if (!nextVisitWeeks) { return; }
  return (nextVisitWeeks - visitWeeks) * 7;
};

module.exports = {
  resolveIfClosure_isReportInEventWindow,
  getLatestReferralStatus,
  isSupervisor,
  isVHT,
  toDate,
  pregnancyEnded,
  isMuted,
  formInSubmittedWindowMatchesFields,
  ANC_VISITS,
  getDaysToNextANCVisit
};
