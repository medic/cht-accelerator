const extras = require('../nools-extras');
const {capitalizeFirstLetter} = extras;

let thisContact = contact;
let thisLineage = lineage;

const householdContactFields = [
{
    appliesToType: ['household_contact'],
    label: 'Name',
    value: thisContact.name,
    width: 4,
},
{
    appliesToType: ['household_contact'],
    label: 'Age',
    value: thisContact.date_of_birth,
    filter: 'age',
    width: 4,
},
{
    appliesToType: ['household_contact'],
    label: 'Gender',
    value: capitalizeFirstLetter(thisContact.sex),
    width: 4,
},
{
    appliesToType: ['household_contact'],
    label: 'Phone',
    value: thisContact.phone || 'Not Provided',
    width: 4,
},
{
    appliesToType: ['household_contact'],
    label: 'Belongs To',
    appliesIf: () => thisContact.parent && thisLineage[0],
    value: thisLineage,
    filter: 'lineage',
    width: 8,
},
];

module.exports = {householdContactFields};