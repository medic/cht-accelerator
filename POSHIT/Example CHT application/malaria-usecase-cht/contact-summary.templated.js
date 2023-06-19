const { CONTACT_TYPES } = require('./shared-extras');

const thisContact = contact;
const thisLineage = lineage;

const fields = [
  { appliesToType: CONTACT_TYPES.HOUSEHOLD, translate: true, label: 'contact.name', value: thisContact.name  , width: 4 },
  { appliesToType: CONTACT_TYPES.HOUSEHOLD, translate: true, label: 'contact.contact.household_no_of_members', value: thisContact.no_of_members  , width: 4 },
  { appliesToType: CONTACT_TYPES.HOUSEHOLD, translate: true, label: 'contact.parent.name', value: !thisLineage[0]?null:thisLineage[0].name, width: 4 }
];

module.exports = {
  fields,
};
