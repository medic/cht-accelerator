const { CONTACT_TYPES, FORMS } = require('./shared-extras');
const {DateTime} = require('luxon');
const { getField } = require('cht-nootils')();

const thisContact = contact;
const thisLineage = lineage;

const fields = [
  { appliesToType: CONTACT_TYPES.HOUSEHOLD, translate: true, label: 'contact.name', value: thisContact.name, width: 4 },
  { appliesToType: CONTACT_TYPES.HOUSEHOLD, translate: true, label: 'contact.phone', value: thisContact.contact && thisContact.contact.primary_phone_number, width: 4 },
  { appliesToType: CONTACT_TYPES.HOUSEHOLD, label: 'contact.parent', value: thisLineage, filter: 'lineage' }
];

const cards = [
  {
    label: 'contact.profile.household',
    translate: true,
    icon: 'household-summary',
    appliesToType: 'report',
    appliesIf: function(report) {
      return report.form === FORMS.HOUSEHOLD_ASSESSMENT;
    },
    fields: [
      {
        label: 'contact.profile.malaria_prone',
        icon: 'household-summary',
        value: function(report) { 
          return getField(report, 'malaria_prone') ? 'Yes' : 'No';
        }
      },      
      {
        label: 'contact.profile.next_visit',
        translate: true,
        icon: 'next-visit',
        value: function(report) { 
          const ammendmentDate = getField(report, 'household_assessment.amendment_date');
          return DateTime.fromISO(ammendmentDate).isValid ? ammendmentDate : null;
        },
        filter: 'simpleDate',
      },
    ],
  },
  {
    label: 'contact.profile.household_prevention',
    appliesToType: 'report',
    appliesIf: function(report) {
      return report.form === FORMS.HOUSEHOLD_ASSESSMENT;
    },
    fields: [
      {
        label: 'contact.profile.household_prevention',
        icon: 'malaria-prone',
        translate: true,
        value: 'malaria.prevention.message'
      },      
    ],
  }
];

module.exports = {
  fields,
  cards
};
