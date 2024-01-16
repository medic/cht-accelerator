const extras = require('../nools-extras');
const {
    getField,
} = extras;

let chpTasks = [
{
    name: 'follow-up-household-member',
    title: 'Follow Up Household Member',
    icon: 'icon-healthcare-assessment',
    appliesTo: 'reports',
    appliesToType: ['household_member_assessment'],
    appliesIf: function(contact, report){
        let userHasDangerSigns = getField(report, 'household_member_assessment.initial_symptoms') === 'yes';
        return userHasDangerSigns && user.contact_type === 'community_health_volunteer';
    },
    actions: [{form: 'cholera_suspicion_follow_up', label:'Follow Up'}],
    events: [{
        start: 3,
        end: 3,
        dueDate: function(event, contact, report){
            return new Date(report.reported_date + (event.start * 24 * 60 * 60 * 1000));
        }
    }],
    priority: {level: 'high', label: 'High Priority'},
},
{
    name:'chp-verify-cholera-case',
    title: 'Verify Cholera Case',
    icon: 'cholera-verification',
    appliesTo: 'reports',
    appliesToType: ['cha_verify_case'],
    appliesIf: function(contact, report){
        let shouldVerify = report.fields.danger_signs.confirm_case === 'yes';
        return shouldVerify && user.contact_type === 'community_health_volunteer';
    },
    actions: [{form: 'cholera_verification', label: 'Verify Case'}],
    events: [{
        start: 3,
        end: 3,
        dueDate: function(event, contact, report){
            return new Date(report.reported_date + (event.start * 24 * 60 * 60 * 1000));
        }
    }],
    priority: {level: 'high', label: 'High Priority'},
},
{
    name: 'chp-undo-death-report',
    title: 'Undo Death Report',
    icon: 'undo-death',
    appliesTo: 'reports',
    appliesToType: ['cha_verify_death'],
    appliesIf: function(contact, report){
        let confirmDeath = report.fields.death_report.confirm_death;
        return confirmDeath === 'no' && user.contact_type === 'community_health_volunteer';
    },
    actions: [{form: 'undo_death_report', label: 'Undo Death Report'}],
    events: [{
        start: 3,
        end: 3,
        dueDate: function(event, contact, report){
            return new Date(report.reported_date + (event.start * 24 * 60 * 60 * 1000));
        }
    }],
    priority: {level: 'high', label: 'High Priority'},
}
];
module.exports = {chpTasks};