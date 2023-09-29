const thisContact = contact;
const thisLineage = lineage; 
const extras = require('./contact-summary-extras');
const { getField } = extras;


const fields = [
  { appliesToType: 'person', label: 'contact.age', value: thisContact.date_of_birth, width: 4, filter: 'age' },
  { appliesToType: 'person', label: 'contact.sex', value: 'contact.sex.' + thisContact.sex, translate: true, width: 4 },
  { appliesToType: 'person', label: 'person.field.phone', value: thisContact.phone, width: 4 },
  { appliesToType: 'person', label: 'contact.parent', value: thisLineage, filter: 'lineage' },
  // { appliesToType: 'person', label: 'contact.role', value: thisContact.role,},
  { appliesToType: 'household_member', label: 'contact.age', value: thisContact.date_of_birth, width: 4, filter: 'age' },
  { appliesToType: 'household_member', label: 'contact.sex', value: 'contact.sex.' + thisContact.sex, translate: true, width: 4 },
  { appliesToType: 'household_member', label: 'person.field.phone', value: thisContact.phone, width: 4 },
  { appliesToType: 'household_member', label: 'contact.parent', value: thisLineage, filter: 'lineage' },
  // { appliesToType: 'household_member', label: 'contact.role', value: thisContact.role },
];

const cards = [
  {
    label: 'contact.profile.assessment_history',
    appliesToType: 'report',
    appliesIf: function (r) {
      if (thisContact.type !== 'person' || thisContact.contact_type !== 'household_member') { return false; }
      return r.form === 'padr';
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
          return getField(report, 'form.reporter.group_report.type');
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


module.exports = {
  fields: fields,
  cards: cards
};

