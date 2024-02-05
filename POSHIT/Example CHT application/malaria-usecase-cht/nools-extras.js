const { DateTime } = require('luxon');
const { FORMS } = require('./shared-extras');
const { getField, isFirstReportNewer } = require('cht-nootils')();

const isFormArraySubmittedInWindow = (reports, formsArray, startTime, endTime) => {
  if(typeof formsArray === 'string') { 
    formsArray = [ formsArray ];
  }
  return formsArray.some(form => Utils.isFormSubmittedInWindow(reports, form, startTime, endTime));
};
function ageInMonths(dateOfBirth) {
  const dob = DateTime.fromISO(dateOfBirth);
  const now = DateTime.now();
  return now.diff(dob, 'months').months;
}

function getMostRecentReportForm(reports, form) {
  let result;
  reports.forEach(function (report) {
    if (form.includes(report.form) &&
      !report.deleted &&
      (!result || report.reported_date > result.reported_date)) {
      result = report;
    }
  });
  return result;
}
const isAlive = (contact) => contact && contact.contact && !contact.contact.date_of_death;

const isPregnancyTreatmentFollowUpForm = (report) => {
  return FORMS.MALARIA_ASSESSMENT_FOR_PREGNANT_MOTHERS === report.form;
};
const isPregnancyTaskMuted = (contact) => {
  const latestVisit = getMostRecentReportForm(contact.reports, [FORMS.MALARIA_ASSESSMENT_FOR_PREGNANT_MOTHERS]);
  return latestVisit && isPregnancyTreatmentFollowUpForm(latestVisit) && getField(latestVisit, 'treatment_referral_follow_up_date') === '';
};

const isPregnancyBeforeDelivery = (report) => {
  DateTime.now() < DateTime.fromISO(getField(report, 'group_pregnancy_registration_form.estimated_delivery_date'));
};

const isPregnancyBeforeDeliveryFollowUp = (report) => {
  DateTime.now() < DateTime.fromISO(getField(report, 'group_pregnancy_registration_followup_form.estimated_delivery_date'));
};

const isFollowUpForm = (reports) => {
  return isFirstReportNewer(getMostRecentReportForm(reports, FORMS.MALARIA_ASSESSMENT_FOR_PREGNANT_MOTHERS, getMostRecentReportForm(reports, FORMS.PREGNANCY_REGISTRATION)));
};

const isContactStillPregnant = (records) => {
  const latestReport = getMostRecentReportForm(records, FORMS.MALARIA_ASSESSMENT_FOR_PREGNANT_MOTHERS);
  return latestReport && getField(latestReport, 'group_malaria_assessment_for_pregnant_mothers.pregnancy_state') === 'yes'?true:false;
};

const isContactValid = (contact) => contact.contact && !contact.contact.date_of_death && !contact.contact.muted;
module.exports = {
  isFormArraySubmittedInWindow,
  isContactValid,
  ageInMonths,
  getMostRecentReportForm,
  isAlive,
  isPregnancyTaskMuted, 
  isPregnancyBeforeDelivery,
  isContactStillPregnant, 
  isFollowUpForm,
  isPregnancyBeforeDeliveryFollowUp
};
