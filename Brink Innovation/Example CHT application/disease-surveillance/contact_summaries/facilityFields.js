const extras = require('../nools-extras');
const {titleCaseLetters} = extras;
let thisContact = contact;

const facilityFields = [
{
    appliesToType: ['area_health_facility'],
    label: 'Facility Name',
    value: titleCaseLetters(thisContact.name),
    width: 6,
},
{
    appliesToType: ['area_health_facility'],
    label: 'Facility Manager',
    value: titleCaseLetters(thisContact.contact && thisContact.contact.name),
    width: 6,
},
{
    appliesToType: ['area_health_facility'],
    label: 'Belongs To',
    value: 'MOH Kenya',
    width: 6,
},
];
module.exports = {facilityFields};