const { titleCaseLetters } = require('../nools-extras');
let thisContact = contact;
let thisLineage = lineage;
const communityHealthUnitFields = [
  {
    appliesToType: ['community_health_area'],
    label: 'Community Health Unit',
    value: thisContact.name,
    width: 4,
  },
  {
    appliesToType: ['community_health_area'],
    label: 'County',
    value: titleCaseLetters(
      thisContact.selected_county || thisContact.parent.selected_county
    ),
    width: 4,
  },
  {
    appliesToType: ['community_health_area'],
    label: 'Sub-County',
    value: titleCaseLetters(
      thisContact.selected_sub_county || thisContact.parent.selected_sub_county
    ),
    width: 4,
  },
  {
    appliesToType: ['community_health_area'],
    label: 'Ward',
    value: titleCaseLetters(
      thisContact.selected_ward || thisContact.parent.selected_ward
    ),
    width: 4,
  },
  {
    appliesToType: ['community_health_area'],
    label: 'Belongs To',
    appliesIf: () => thisContact.parent && thisLineage[0],
    value: thisLineage,
    filter: 'lineage',
    width: 8,
  },
];
module.exports = { communityHealthUnitFields };
