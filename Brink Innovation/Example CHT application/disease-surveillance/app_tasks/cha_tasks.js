const extras = require('../nools-extras');
const {
    getField,
} = extras;

let chaTasks = [
{
    name: 'let-chp-verify-case',
    title: 'Ask CHP To Verify Case',
    icon: 'cholera-verification',
    appliesTo: 'reports',
    appliesToType: ['household_member_assessment'],
    appliesIf: function(contact, report){
        let userHasDangerSigns = getField(report, 'household_member_assessment.initial_symptoms') === 'yes';
        return userHasDangerSigns && user.contact_type === 'area_community_health_supervisor';
    },
    actions: [{form: 'cha_verify_case', label: 'Ask Verification'}],
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
    name: 'let-cha-verify-death',
    title: 'Verify Death Report',
    icon: 'icon-death-general',
    appliesTo: 'reports',
    appliesToType: ['death_report'],
    appliesIf: function(contact, report){
        return report.form === 'death_report' && user.contact_type === 'area_community_health_supervisor';
    },
    actions: [{form: 'cha_verify_death', label: 'Verify Death'}],
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

module.exports = {chaTasks};