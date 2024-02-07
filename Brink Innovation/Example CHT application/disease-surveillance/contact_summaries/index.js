const { houseHoldFields } = require('./householdFields');
const { householdContactFields } = require('./householdContactFields');
const { householdMemberFields } = require('./householdMemberFields');
const { householdMemberCards } = require('./householdConditionCards');
const { chpFields } = require('./chpFields');
const { communityHealthUnitFields } = require('./chuFields');
const { chaFields } = require('./chaFields');
const { diseaseSurveillanceFields } = require('./surveillanceFields');
const { facilityFields } = require('./facilityFields');
const { supervisorRegionFields } = require('./supervisorFields');

module.exports = {
  houseHoldFields,
  householdContactFields,
  householdMemberFields,
  householdMemberCards,
  chpFields,
  chaFields,
  communityHealthUnitFields,
  diseaseSurveillanceFields,
  facilityFields,
  supervisorRegionFields,
};
