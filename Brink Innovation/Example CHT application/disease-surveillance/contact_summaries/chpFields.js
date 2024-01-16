let thisContact = contact;
let thisLineage = lineage;
const chpFields = [
    {
      appliesToType: ['community_health_volunteer'],
      label: 'Name',
      value: thisContact.name,
      width: 4,
    },
    {
      appliesToType: ['community_health_volunteer'],
      label: 'Phone',
      value: thisContact.phone || 'Not Provided',
      width: 4,
    },
    {
      appliesToType: ['community_health_volunteer'],
      label: 'Belongs To',
      appliesIf: () => thisContact.parent && thisLineage[0],
      value: thisLineage,
      filter: 'lineage',
      width: 8,
    },
  ];
module.exports = {chpFields};   