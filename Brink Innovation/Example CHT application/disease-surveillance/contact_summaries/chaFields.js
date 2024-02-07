let thisContact = contact;
let thisLineage = lineage;
const chaFields = [
  {
    appliesToType: ['area_community_health_supervisor'],
    label: 'Name',
    value: thisContact.name,
    width: 4,
  },
  {
    appliesToType: ['area_community_health_supervisor'],
    label: 'Phone',
    value: thisContact.phone || 'Not Provided',
    width: 4,
  },
  {
    appliesToType: ['area_community_health_supervisor'],
    label: 'Belongs To',
    appliesIf: () => thisContact.parent && thisLineage[0],
    value: thisLineage,
    filter: 'lineage',
    width: 8,
  },
];
module.exports = { chaFields };
