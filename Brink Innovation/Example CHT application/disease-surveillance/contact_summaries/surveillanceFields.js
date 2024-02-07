let thisContact = contact;
let thisLineage = lineage;

const diseaseSurveillanceFields = [
  {
    appliesToType: ['area_health_facility_nurse'],
    label: 'Name',
    value: thisContact.name,
    width: 4,
  },
  {
    appliesToType: ['area_health_facility_nurse'],
    label: 'Phone',
    value: thisContact.phone || 'Not Provided',
    width: 4,
  },
  {
    appliesToType: ['area_health_facility_nurse'],
    label: 'Belongs To',
    appliesIf: () => thisContact.parent && thisLineage[0],
    value: thisLineage,
    filter: 'lineage',
    width: 4,
  },
];
module.exports = { diseaseSurveillanceFields };
