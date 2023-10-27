const { FORMS } = require('./shared-extras');


const MAX_DAYS_IN_PREGNANCY = 42 * 7;

const isPregnancyForm = report => {
  return report && [FORMS.PREGNANCY_REGISTRATION].includes(report.form);
};

const isActivePregnancy = (thisContact, allReports, report) => {
  if (thisContact.type !== 'person' || !isPregnancyForm(report)) { return false; }
};

const isPregnant = (allReports)  => {
  return allReports.some(report => isActivePregnancy(report));
};


module.exports = {

  MAX_DAYS_IN_PREGNANCY,
  isPregnant,
  isActivePregnancy,
  isPregnancyForm
};
