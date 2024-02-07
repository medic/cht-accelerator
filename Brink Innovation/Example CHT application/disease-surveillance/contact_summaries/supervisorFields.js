let thisContact = contact;
let thisLineage = lineage;

const supervisorRegionFields = [
  {
    appliesToType: ['area_supervisor_region'],
    label: 'Name',
    value: thisContact.name,
    width: 4,
  },
  {
    appliesToType: ['area_supervisor_region'],
    label: 'Additional Notes',
    value: thisContact.notes || 'Not Available',
    width: 4,
  },
  {
    appliesToType: ['area_supervisor_region'],
    label: 'Belongs To',
    appliesIf: () => thisContact.parent && thisLineage[0],
    value: thisLineage,
    filter: 'lineage',
    width: 8,
  },
];
module.exports = { supervisorRegionFields };
