const Nootils = require('cht-nootils/src/nootils');
global.Utils = Nootils();
const { DateTime } = require('luxon');

function isChildUnder5(c, report) {
  if (report) {
    return Utils.getField(report, 'patient_age_in_years') <= 5;
  }
  if (!c.contact.date_of_birth) { return; }

  const birthDate = DateTime.fromFormat(c.contact.date_of_birth, 'yyyy-MM-dd');
  const reportedDate = DateTime.fromMillis(c.contact.reported_date);
  return reportedDate.diff(birthDate, 'years').years <= 5;
}

function isPersonAbove50(c) {
  if (!c.contact.date_of_birth) { return; }

  const birthDate = DateTime.fromFormat(c.contact.date_of_birth, 'yyyy-MM-dd');
  const currentDate = DateTime.now();
  return currentDate.diff(birthDate, 'years').years > 50;
}



function receivedTreatment(report) {
  return receivedCoughTreatment(report) || receivedDiarrhoeaTreatment(report) || receivedFeverTreatment(report);
}

function receivedCoughTreatment(report) {
  return Utils.getField(report, 'group_patient_summary.cough_treatment_given') === 'yes';
}

function receivedDiarrhoeaTreatment(report) {
  return Utils.getField(report, 'group_patient_summary.diarrhoea_treatment_given') === 'yes';
}

function receivedFeverTreatment(report) {
  return Utils.getField(report, 'group_patient_summary.fever_treatment_given') === 'yes';
}

function reportHasReferralFollowUp(report) {
  return (report.form === 'assessment' && Utils.getField(report, 'referral_follow_up') === 'yes') ||
    (report.form === 'treatment_follow_up' && Utils.getField(report, 'trigger_referral_follow_up') === 'yes');
}
function isDead(report) {
  return Utils.getField(report, 'death_details.place_of_death') === 'health_facility' || 'home' || 'other';
}

function getNumFemaleBelow18(report) {
  const numFemaleBelow18 = Utils.getField(report, 'home_visits.num_female_below_18');
  return numFemaleBelow18;
}



function isActiveVht(contact) {
  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const numberOfAssessmentForms = contact.reports.filter((report) => {
    if (report.type === 'assessment') {
      const reportDate = new Date(report.reported_date);
      return reportDate >= firstDayOfMonth && reportDate <= currentDate;
    }
    return false;
  }).length;

  return numberOfAssessmentForms >= 1; // VHT is considered active if they have submitted at least two assessment forms in the current month
}
function isVHT() {
  return user.parent.type === 'health_center';
}


module.exports = {
  isChildUnder5,
  isPersonAbove50,
  receivedTreatment,
  receivedCoughTreatment,
  receivedDiarrhoeaTreatment,
  receivedFeverTreatment,
  reportHasReferralFollowUp,
  isDead,
  isActiveVht,
  isVHT,
  getNumFemaleBelow18,
  //countVHTsUnderSupervisorHealthFacility
  //isVHTUnderSupervisor
};
