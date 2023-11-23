const thisContact = contact;
const thisLineage = lineage;
const extras = require('./contact-summary-extras');
const {
  isHouseholdMember, buildAssessmentCard
} = extras;


const fields = [
  { appliesToType: 'person', label: 'contact.age', value: thisContact.date_of_birth, width: 4, filter: 'age' },
  { appliesToType: 'person', label: 'contact.sex', value: 'contact.sex.' + thisContact.sex, translate: true, width: 4 },
  { appliesToType: 'person', label: 'person.field.phone', value: thisContact.phone, width: 4 },
  { appliesToType: 'person', label: 'contact.parent', value: thisLineage, filter: 'lineage' },
  { appliesToType: 'household_member', label: 'contact.age', value: thisContact.date_of_birth, width: 4, filter: 'age' },
  { appliesToType: 'household_member', label: 'contact.sex', value: 'contact.sex.' + thisContact.sex, translate: true, width: 4 },
  { appliesToType: 'household_member', label: 'person.field.phone', value: thisContact.phone, width: 4 },
  { appliesToType: 'household_member', label: 'contact.parent', value: thisLineage, filter: 'lineage' },
];
const context = {};
let cards = [
  {
    label: 'Assessment Details',
    appliesToType: 'household_member',
    appliesIf: function (report) {
      if (isHouseholdMember(contact)) { return true; }
      if (report.form === 'assessement') { return true; }
      if (report.form === 'padr') { return true; }
    },
    fields: () => {
      const fields = [];
      const assessmentCard = buildAssessmentCard(contact, reports);
      return fields.concat(assessmentCard.fields);
    },

  },
];


module.exports = {
  fields,
  cards,
  context
};

