const { CONTACT_TYPES, FORMS } = require('./shared-extras');
const {DateTime} = require('luxon');
const { getField, getMostRecentReport,isFirstReportNewer } = require('cht-nootils')();
const { getMostRecentReportForm, ageInMonths, isPregnancyBeforeDelivery, isContactStillPregnant } = require('./nools-extras');

const thisContact = contact;
const thisLineage = lineage;
const allReports = reports;
const householdAssessmentReport = getMostRecentReportForm(reports, [FORMS.HOUSEHOLD_ASSESSMENT]);
const householdFollowUpReport = getMostRecentReportForm(reports, [FORMS.HOUSEHOLD_ASSESSMENT_FOLLOWUP]);
const under5AssessmentReport = getMostRecentReportForm(reports, [FORMS.CHILD_ASSESSMENT]);
const under5AssessmentFollowUpreport = getMostRecentReportForm(reports, [FORMS.CHILD_FOLLOW_UP]);
const memberAssessmentReport = getMostRecentReportForm(reports, [FORMS.HOUSEHOLD_MEMBER_ASSESSMENT]);
const u5MalariaConfirmed = !!under5AssessmentFollowUpreport 
                            && getField(under5AssessmentFollowUpreport, 'children_under_5_follow_up.malaria_confirmed') === 'yes'
                            || !!under5AssessmentFollowUpreport && getField(under5AssessmentFollowUpreport, 'children_under_5_follow_up.malaria_confirmed') === 'no';

const fields = [
  { appliesToType: CONTACT_TYPES.HOUSEHOLD, translate: true, label: 'contact.name', value: thisContact.contact && thisContact.contact.name, width: 4 },
  { appliesToType: CONTACT_TYPES.HOUSEHOLD, translate: true, label: 'contact.phone', value: thisContact.contact && thisContact.contact.phone, width: 4 },
  { appliesToType: CONTACT_TYPES.HOUSEHOLD, translate: true, label: 'Household Head', value: thisContact.contact && thisContact.contact.name, width: 4 },
  { appliesToType: CONTACT_TYPES.HOUSEHOLD, label: 'contact.sex', value: thisContact.contact && thisContact.contact.sex, width: 4 },
  { appliesToType: CONTACT_TYPES.HOUSEHOLD, label:'contact.age', value: thisContact.contact && thisContact.contact.date_of_birth, width: 4, filter: 'age'},
  { appliesToType: CONTACT_TYPES.HOUSEHOLD, label: 'contact.parent', value: thisLineage, filter: 'lineage' },
  { appliesToType: CONTACT_TYPES.HOUSEHOLD_MEMBER, label:'patient_id', value: thisContact.patient_id, width: 4 },
  { appliesToType: CONTACT_TYPES.HOUSEHOLD_MEMBER, label:'contact.age', value: thisContact.date_of_birth, width: 4, filter: 'age'},
  { appliesToType: CONTACT_TYPES.HOUSEHOLD_MEMBER, label: 'contact.sex', value: thisContact.sex, width: 4 },
  { appliesToType: CONTACT_TYPES.HOUSEHOLD_MEMBER, label: 'contact.phone', value: thisContact.phone, width: 4 },
  { appliesToType: CONTACT_TYPES.HOUSEHOLD_MEMBER, label: 'Relationship to Household Head', value: thisContact.relationship_to_primary_caregiver, width: 8 },
  { appliesToType: CONTACT_TYPES.HOUSEHOLD_MEMBER, label: 'contact.parent', value: thisLineage, filter: 'lineage' },
  { appliesToType: CONTACT_TYPES.AREA_HEALTH_FACILITY, translate: true, label: 'contact.name', value: thisContact.contact && thisContact.contact.name, width: 4 },
  { appliesToType: CONTACT_TYPES.AREA_HEALTH_FACILITY, translate: true, label: 'contact.phone', value: thisContact.contact && thisContact.contact.phone, width: 4 },
  { appliesToType: CONTACT_TYPES.AREA_HEALTH_FACILITY, label: 'Notes', value:  thisContact.contact && thisContact.notes, width: 12 },
  { appliesToType: CONTACT_TYPES.AREA_SUPERVISOR_REGION, label: 'contact.name', value: thisContact.contact && thisContact.contact.name, width: 4 },
  { appliesToType: CONTACT_TYPES.AREA_SUPERVISOR_REGION, label: 'contact.phone', value: thisContact.contact && thisContact.contact.phone, width: 4 },
  { appliesToType: CONTACT_TYPES.AREA_SUPERVISOR_REGION, label: 'contact.parent', value: thisLineage, filter: 'lineage' },
  { appliesToType: CONTACT_TYPES.AREA_SUPERVISOR_REGION, label: 'Notes', value: thisContact.contact && thisContact.contact.notes, width: 12 },
  { appliesToType: CONTACT_TYPES.AREA_COMMUNITY_HEALTH_SUPERVISOR, label: 'contact.phone', value: thisContact.phone, width: 4 },
  { appliesToType: CONTACT_TYPES.AREA_COMMUNITY_HEALTH_SUPERVISOR, label: 'contact.parent', value: thisLineage, filter: 'lineage' },
  { appliesToType: CONTACT_TYPES.AREA_COMMUNITY_HEALTH_SUPERVISOR, label: 'Notes', value: thisContact.notes, width: 12 },
  { appliesToType: CONTACT_TYPES.AREA_HEALTH_FACILITY_NURSE, label: 'contact.phone', value: thisContact.phone, width: 4 },
  { appliesToType: CONTACT_TYPES.AREA_HEALTH_FACILITY_NURSE, label: 'contact.parent', value: thisLineage, filter: 'lineage' },
  { appliesToType: CONTACT_TYPES.COMMUNITY_HEALTH_AREA, translate: true, label: 'Primary Contact', value: thisContact.contact && thisContact.contact.name, width: 4 },
  { appliesToType: CONTACT_TYPES.COMMUNITY_HEALTH_AREA, label: 'contact.phone', value: thisContact.contact && thisContact.contact.phone, width: 4 },
  { appliesToType: CONTACT_TYPES.COMMUNITY_HEALTH_AREA, label: 'contact.parent', value: thisLineage, filter: 'lineage' },
  { appliesToType: CONTACT_TYPES.COMMUNITY_HEALTH_VOLUNTEER, label: 'contact.phone', value: thisContact.phone, width: 4 },
  { appliesToType: CONTACT_TYPES.COMMUNITY_HEALTH_VOLUNTEER, label: 'contact.parent', value: thisLineage, filter: 'lineage' }

];

const cards = [
  {
    label: 'contact.profile.household',
    translate: true,
    icon: 'household-summary',
    appliesToType: 'report',
    appliesIf: function(report) {
      return report.form === FORMS.HOUSEHOLD_ASSESSMENT && report.reported_date === householdAssessmentReport.reported_date;
    },
    fields: [
      {
        label: 'contact.profile.malaria_prone',
        icon: 'household-summary',
        value: function() { 
          const assessmentValue = getField(householdAssessmentReport, 'malaria_prone');
          const followUpValue = householdFollowUpReport !== undefined ? getField(householdFollowUpReport, 'malaria_prone') : undefined;
          const isContactAvailable = householdFollowUpReport === undefined ? null : getField(householdFollowUpReport, 'follow_up_details.contact_available');

          if (assessmentValue === 'true' && followUpValue === 'false' && isContactAvailable === 'yes') {
            return 'Household is safe';
          } else if (assessmentValue === 'false' && isContactAvailable === null && followUpValue === undefined) {
            return 'No';
          } else if (assessmentValue === 'true' && followUpValue === undefined && isContactAvailable === null) {
            return 'Yes';
          } 
          else if (assessmentValue === 'true' && followUpValue === 'true') {
            return 'Yes';
          } 
          else if (assessmentValue === 'true' && followUpValue === 'false' && isContactAvailable === 'no') {
            return 'Yes';
          } 
          else {
            return 'This Household is safe';
          }
        }
      },
      {
        label: 'contact.profile.next_visit',
        translate: true,
        icon: 'next-visit',
        value: function() { 
          const assessmentValue = getField(householdAssessmentReport, 'malaria_prone');
          const followUpValue = householdFollowUpReport !== undefined ? getField(householdFollowUpReport, 'malaria_prone') : undefined;
          const ammendmentDate = getField(householdAssessmentReport, 'household_assessment.amendment_date');
          const ammendmentDateFollowUp = householdFollowUpReport !== undefined ? getField(householdFollowUpReport, 'referral_follow_up_date') : null;
          const isContactAvailable = householdFollowUpReport === undefined ? null : getField(householdFollowUpReport, 'follow_up_details.contact_available');
          if (assessmentValue === 'true' && followUpValue === 'false' && isContactAvailable === 'yes') {
            return 'Safe, no follow-up needed.';
          } else if (assessmentValue === 'false' && followUpValue === undefined) {
            return 'Safe, no follow-up needed.';
          } else if (assessmentValue === 'true' && followUpValue === undefined) {
            return DateTime.fromISO(ammendmentDate).isValid ? DateTime.fromISO(ammendmentDate).toFormat('d MMM yyyy') : null;
          }
          else if (assessmentValue === 'true' && followUpValue === 'true' && ammendmentDateFollowUp !== null) {
            return DateTime.fromISO(ammendmentDateFollowUp).isValid ? DateTime.fromISO(ammendmentDateFollowUp).toFormat('d MMM yyyy') : null;
          }
          else if (assessmentValue === 'true' && isContactAvailable === 'no' && ammendmentDateFollowUp !== null) {
            return DateTime.fromISO(ammendmentDateFollowUp).isValid ? DateTime.fromISO(ammendmentDateFollowUp).toFormat('d MMM yyyy') : null;
          }
          else if (followUpValue === 'false' && ammendmentDateFollowUp === '') {
            return 'Safe, no follow-up needed';
          }
          else {
            return 'This Household is safe';
          }
        }
      },
    ],
  },
  {
    label: 'contact.profile.child_health',
    appliesToType: [CONTACT_TYPES.HOUSEHOLD_MEMBER],
    appliesIf: function() {
      return ageInMonths(thisContact.date_of_birth) < 60 && !!under5AssessmentReport;
    },
    fields: [
      {
        label: 'contact.profile.sleeps_under_llin',
        icon: 'sleeps_under_llin',
        value: function() {
          return getField(under5AssessmentReport, 'children_under_assessment.nets_treated');
        },
      },
      {
        label: u5MalariaConfirmed ? 'Malaria confirmed' : 'contact.profile.suspected_malaria',
        icon: function() {
          return getField(under5AssessmentReport, 'children_under_assessment.suspected_of_malaria') === 'Yes' ? 'danger' : 'suspected_malaria';
        },
        value: function() {
          return u5MalariaConfirmed 
            ? getField(under5AssessmentFollowUpreport, 'children_under_5_follow_up.malaria_confirmed') 
            : getField(under5AssessmentReport, 'children_under_assessment.suspected_of_malaria');
        },
      }
    ],
  },
  {
    label: 'contact.profile.assessment_history',
    appliesToType: [CONTACT_TYPES.HOUSEHOLD_MEMBER],
    appliesIf: function() {
      return ageInMonths(thisContact.date_of_birth) > 60 && !!memberAssessmentReport;
    },
    fields: [
      {
        label: 'contact.profile.last_assessment_date',
        icon: 'date',
        value: function() {
          const assessDate = getField(memberAssessmentReport, 'referral_follow_up_date');
          return assessDate !== null ? assessDate : 'N/A';
        },
        filter: 'simpleDate',
      },
      {
        label: 'contact.profile.suspected_malaria',
        icon: 'suspected_malaria',
        value: function() {
          return getField(memberAssessmentReport, 'group_household_member_assessment.suspected_of_malaria');
        }
      },
      {
        label: 'contact.profile.symptoms_experienced',
        icon: 'symptoms',
        value: function() {
          return getField(memberAssessmentReport, 'group_household_member_assessment.symptoms');
        }
      }
    ],
  },
  {
    label: 'contact.profile.given_treatment',
    appliesToType: [CONTACT_TYPES.HOUSEHOLD_MEMBER],
    appliesIf: function() {
      return ageInMonths(thisContact.date_of_birth) > 60 && getMostRecentReportForm(reports, [FORMS.MEMBER_FOLLOW_UP]);
    },
    fields: [
      {
        label: 'contact.profile.patient_given_treatment',
        icon: 'treatment',
        value: function() {
          const memberFollowUpReport = getMostRecentReportForm(reports, [FORMS.MEMBER_FOLLOW_UP]);
          return memberFollowUpReport ? getField(memberFollowUpReport, 'group_household_member_follow_up.given_treatment') : 'N/A';
        }
      }
    ],
  },
  {
    label: 'contact.profile.pregnancy.active',
    appliesToType: CONTACT_TYPES.HOUSEHOLD_MEMBER,
    appliesIf: function() { 
      const report = getMostRecentReport(allReports, FORMS.PREGNANCY_REGISTRATION); 
      const followUpReport = getMostRecentReport(allReports, FORMS.PREGNANCY_REGISTRATION_FOLLOWUP);
      const malariaReport = getMostRecentReport(allReports, FORMS.MALARIA_ASSESSMENT_FOR_PREGNANT_MOTHERS);
      if(report !== null && thisContact.age_years > 12 && thisContact.age_years < 50 && thisContact.sex === 'female'){
        if(malariaReport && report && isFirstReportNewer(malariaReport, report)) {
          return isContactStillPregnant(allReports);
        }
        else if(followUpReport){
          const deliveryDate = getField(followUpReport, 'group_pregnancy_registration_followup_form.estimated_delivery_date');
          return DateTime.now() < DateTime.fromISO(deliveryDate);
        }
        else if(report){
          const deliveryDate = getField(report, 'group_pregnancy_registration_form.estimated_delivery_date');
          return DateTime.now() < DateTime.fromISO(deliveryDate);
        }
        return isPregnancyBeforeDelivery(report);
      }
    },
    fields: function () {
      const report = getMostRecentReport(allReports, FORMS.PREGNANCY_REGISTRATION); 
      const malariaReport = getMostRecentReport(allReports, FORMS.MALARIA_TREATMENT_FOLLOW_UP);
      const followUpReport = getMostRecentReport(allReports, FORMS.PREGNANCY_REGISTRATION_FOLLOWUP);

      const fields = [];
      let ancVisits = 0;

      if(followUpReport !== null || report !== null && 
        thisContact.age_years > 12 && thisContact.age_years < 50 && thisContact.sex === 'female'){

        let targetDate = null;

        if(followUpReport){
          targetDate = new Date(followUpReport.fields.group_pregnancy_registration_followup_form.estimated_delivery_date);
          fields.push({label: 'Number of ANC Visits', value : followUpReport.fields.group_pregnancy_registration_followup_form.no_of_antenatal_visits});
        }
        
        if(report && report.fields.group_pregnancy_registration_form.estimated_delivery_date !== null){
          targetDate = new Date(report.fields.group_pregnancy_registration_form.estimated_delivery_date);
          ancVisits = report.fields.group_pregnancy_registration_form.no_of_antenatal_visits;
        }

        if(followUpReport && followUpReport.fields.group_pregnancy_registration_followup_form.estimated_delivery_date !== null){
          targetDate = new Date(followUpReport.fields.group_pregnancy_registration_followup_form.estimated_delivery_date);
          ancVisits =  followUpReport.fields.group_pregnancy_registration_followup_form.no_of_antenatal_visits;
        }
        
      
        
        const today = new Date();

        const timeDifference = targetDate - today;
        const weeksDifference = timeDifference / (1000 * 60 * 60 * 24 * 7);
        const roundedWeeksDifference = Math.round(weeksDifference);

        if(malariaReport === null){
          fields.push(
            { label: 'Malaria Status', value: 'Not Tested' },
          );
        }else{
          
          if(malariaReport.fields.group_pregnant_referral_follow_up.confirmed_malaria === 'yes'){
            fields.push(
              { label: 'Malaria Status', value: 'Positive' },
            );
          }else if(malariaReport.fields.group_pregnant_referral_follow_up.confirmed_malaria === 'no'){
            fields.push(
              { label: 'Malaria Status', value: 'Negative' },
            );
          }else {
            fields.push(
              { label: 'Malaria Status', value: 'Not Tested' },
            );
          }
        }

        fields.push(
          {label: 'Number of ANC Visits', value : ancVisits}
        );
        fields.push(
          { label: 'Approximate Weeks before delivery', value: roundedWeeksDifference },
        );
      }
      

      return fields;
    },
    modifyContext: function (ctx){
      ctx.is_active_pregnancy = true;
    }
  },
];

module.exports = {
  fields,
  cards
};
