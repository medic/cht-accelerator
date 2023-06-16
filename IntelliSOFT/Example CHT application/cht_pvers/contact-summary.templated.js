const thisContact = contact;
const thisLineage = lineage;
const allReports = reports;

const assessmentForms = ['padr'];

const getNewestReport = (reports = []) => {
  let results = null;
  reports.forEach(function (reports) {
    if (!results || reports.reported_date > results.reported_date) {
      results = reports;
    }
  });
  return results;
};



const fields = [ 
  { appliesToType: 'person', label: 'contact.age', value: thisContact.date_of_birth, width: 4, filter: 'age' },
  { appliesToType: 'person', label: 'contact.sex', value: 'contact.sex.' + thisContact.sex, translate: true, width: 4 },
  { appliesToType: 'person', label: 'person.field.phone', value: thisContact.phone, width: 4 },
  { appliesToType: 'person', label: 'contact.parent', value: thisLineage, filter: 'lineage' },
];

const cards = [
  {
    label: 'contact.profile.assessment_history',
    appliesToType: 'report',
    appliesIf: (report) => {
      const assessmentForm = getNewestReport(allReports, assessmentForms);
      return assessmentForm.reported_date >= report.reported_date;
    },
    fields: [
      {
        label: 'contact.profile.most_recent_assessment.date',
        value: (report) => {
          return report.reported_date;
        },
        filter: 'simpleDate',
        width: 6
      },
      {
        label: 'contact.profile.type',
        value: (report) => {
          return report.fields.type;
        },
        width: 6,
      }
    ]
  }
];

module.exports = {
  fields: fields,
  cards: cards
};

