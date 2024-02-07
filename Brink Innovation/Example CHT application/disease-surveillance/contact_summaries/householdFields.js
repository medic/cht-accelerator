const { titleCaseLetters } = require('../nools-extras');

let thisContact = contact;
let thisLineage = lineage;
const houseHoldFields = [
  {
    appliesToType: ['household'],
    label: 'Household Head',
    value: titleCaseLetters(thisContact.contact && thisContact.contact.name),
    width: 6,
  },
  {
    appliesToType: ['household'],
    label: 'Belongs To',
    appliesIf: () => thisContact.parent && thisLineage[0],
    value: thisLineage,
    filter: 'lineage',
    width: 6,
  },
];

module.exports = { houseHoldFields };
