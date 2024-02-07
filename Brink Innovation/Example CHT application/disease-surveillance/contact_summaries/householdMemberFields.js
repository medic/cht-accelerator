const { capitalizeFirstLetter } = require('../nools-extras');

let thisContact = contact;
let thisLineage = lineage;

const householdMemberFields = [
  {
    appliesToType: ['household_member'],
    label: 'Name',
    value: thisContact.display_name,
    width: 4,
  },
  {
    appliesToType: ['household_member'],
    label: 'Age',
    value: thisContact.date_of_birth,
    filter: 'age',
    width: 4,
  },
  {
    appliesToType: ['household_member'],
    label: 'Gender',
    value: capitalizeFirstLetter(thisContact.sex),
    width: 4,
  },
  {
    appliesToType: ['household_member'],
    label: 'Phone',
    value: thisContact.phone || 'Not Provided',
    width: 4,
  },
  {
    appliesToType: ['household_member'],
    label: 'Belongs To',
    appliesIf: () => thisContact.parent && thisLineage[0],
    value: thisLineage,
    filter: 'lineage',
    width: 8,
  },
];

module.exports = { householdMemberFields };
