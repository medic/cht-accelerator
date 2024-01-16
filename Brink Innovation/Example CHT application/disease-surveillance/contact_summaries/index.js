const allHouseHoldFields = require('./householdFields');
const { houseHoldFields } = allHouseHoldFields;
const allHouseHoldContactFields = require('./householdContactFields');
const { householdContactFields } = allHouseHoldContactFields;
const allHouseHoldMemberFields = require('./householdMemberFields');
const { householdMemberFields } = allHouseHoldMemberFields;
const allHouseHoldCards = require('./householdConditionCards');
const { householdMemberCards } = allHouseHoldCards;
const allChpFields = require('./chpFields');
const { chpFields } = allChpFields;
const allChuFields = require('./chuFields');
const { communityHealthUnitFields } = allChuFields;
const allChaFields = require('./chaFields');
const { chaFields } = allChaFields;
const allSurveillanceFields = require('./surveillanceFields');
const { diseaseSurveillanceFields } = allSurveillanceFields;
const allFacilityFields = require('./facilityFields');
const { facilityFields } = allFacilityFields;
const allSupervisorFields = require('./supervisorFields');
const { supervisorRegionFields } = allSupervisorFields;

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
