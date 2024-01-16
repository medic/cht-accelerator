const extras = require('./nools-extras');
const allContactSummariesAndConditionCards = require('./contact_summaries');
const {
  householdMemberFields,
  householdContactFields,
  houseHoldFields,
  householdMemberCards,
  chpFields,
  communityHealthUnitFields,
  chaFields,
  diseaseSurveillanceFields,
  facilityFields,
  supervisorRegionFields,
} = allContactSummariesAndConditionCards;
const {
  pushFieldsToSingleArray,
} = extras;

// contact, reports, lineage are globally available for contact-summary.templated.js
let allFields = [];
let allCards = [];



allFields = pushFieldsToSingleArray(householdMemberFields, allFields);
allFields = pushFieldsToSingleArray(householdContactFields, allFields);
allFields = pushFieldsToSingleArray(houseHoldFields, allFields);
allFields = pushFieldsToSingleArray(facilityFields, allFields);
allFields = pushFieldsToSingleArray(diseaseSurveillanceFields, allFields);
allFields = pushFieldsToSingleArray(communityHealthUnitFields, allFields);
allFields = pushFieldsToSingleArray(chpFields, allFields);
allFields = pushFieldsToSingleArray(chaFields, allFields);
allFields = pushFieldsToSingleArray(supervisorRegionFields, allFields);
allCards = pushFieldsToSingleArray(householdMemberCards, allCards);

module.exports = {
  context: {},
  cards: allCards,
  fields: allFields,
};
