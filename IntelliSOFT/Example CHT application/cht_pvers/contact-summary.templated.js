const thisContact = contact;
const thisLineage = lineage;
const allReports = reports;
const assessmentForms = ['padr'];


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
      if (thisContact.type !== 'person') { return false; }
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
        label: 'contact.profile.report_type',
        value: (report) => {
          var type = getField(report, 'form.reporter.group_report.type');
          if (type === 'reaction') {
            type = 'Adverse Drug Reaction';

          }
          if (type === 'medicine') {
            type = 'Poor Quality Medicine';
          }
          return type;
        },
        width: 6,
      },
      {
        label: 'contact.profile.most_recent_assessment.outcome',
        value: (report) => {
          return getField(report, 'form.outcome_details.group_outcome_details.outcome');
        },
        width: 6
      }

    ]
  }
];
const getField = (report, fieldPath) => ['fields', ...(fieldPath || '').split('.')]
  .reduce((prev, fieldName) => {
    if (prev === undefined) { return undefined; }
    return prev[fieldName];
  }, report);

  const getNewestReport = (reports = ['padr']) => {
    return reports.reduce((newestReport, report) => {
      if (!newestReport || report.reported_date > newestReport.reported_date) {
        return report;
      }
      return newestReport;
    }, null);
  };
  


module.exports = {
  fields: fields,
  cards: cards
};

