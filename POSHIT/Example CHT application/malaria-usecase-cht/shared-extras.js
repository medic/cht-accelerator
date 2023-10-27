const CONTACT_TYPES = {
  HOUSEHOLD: 'household',
  HOUSEHOLD_MEMBER: 'household_member',
  COMMUNITY_HEALTH_AREA: 'community_health_area',
  COMMUNITY_HEALTH_VOLUNTEER: 'community_health_volunteer',
  AREA_HEALTH_FACILITY: 'area_health_facility',
  AREA_SUPERVISOR_REGION: 'area_supervisor_region',
  AREA_HEALTH_FACILITY_NURSE: 'area_health_facility_nurse',
  AREA_COMMUNITY_HEALTH_SUPERVISOR: 'area_community_health_supervisor'
};
const TASKS = {
  HOUSEHOLD_ASSESSMENT: 'task.household_assessment_followup.title',
  HOUSEHOLD_MEMBER_FOLLOW_UP: 'task.household_member_follow_up.title',
  CHILD_ASSESSMENT_FOLLOW_UP: 'task.children_under_5_follow_up.title',
  PREGNANT_REGISTRATION_FOLLOW_UP: 'task.pregnancy.registration.follow_up.title',
  PREGNANT_MOTHER_TREATMENT_FOLLOW_UP: 'task.pregnant_mother_treatment_follow_up.title',
  PREGNANT_MOTHER_TREATMENT_REFERAL_FOLLOW_UP: 'task.pregnant_mother_referal_follow_up.title',
};
const FORMS = {
  MUTE_HOUSEHOLD: 'mute_household',
  HOUSEHOLD_ASSESSMENT: 'household_assessment',
  HOUSEHOLD_ASSESSMENT_FOLLOWUP: 'household_assesment_follow_up',
  CHILD_ASSESSMENT: 'children_under_assessment',
  CHILD_FOLLOW_UP: 'children_under_5_follow_up',
  MEMBER_ASSESSMENT: 'household_member_assessment',
  MEMBER_FOLLOW_UP: 'household_member_follow_up',
  UNMUTE_HOUSEHOLD_MEMBER: 'unmute_household_member',
  UNMUTE_HOUSEHOLD: 'unmute_household',
  MUTE_HOUSEHOLD_MEMBER: 'mute_household_member',
  PREGNANCY_REGISTRATION: 'pregnancy_registration',
  MALARIA_ASSESSMENT_FOR_PREGNANT_MOTHERS: 'malaria_assessment_for_pregnant_mothers',
  MALARIA_TREATMENT_FOLLOW_UP: 'malaria_assessment_treatment_followup',
  PREGNANCY_REGISTRATION_FOLLOWUP: 'pregnancy_registration_followup'
};

const TARGETS = {
  HOUSEHOLDS_GTE_2_LLIN: 'household-with-atleast-two-lln',
  MEMBERS_WITH_MALARIA: 'household-members-with-malaria',
  UNDER5_MEMBERS_WITH_MALARIA: 'u5_members_with_malaria_symptoms',
  ALL_MEMBERS_WITH_MALARIA: 'all-members-with-malaria'
};

module.exports = {
  CONTACT_TYPES,
  TASKS,
  FORMS,
  TARGETS
};
