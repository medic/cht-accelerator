
let dsoTasks = [
    {
        name: 'test-patient-specimen',
        title: 'Test Patient Specimen',
        icon: 'lab-test',
        appliesTo: 'reports',
        appliesToType: ['cholera_verification'],
        appliesIf: function(contact, report){
            let confirmedCase = report.fields.danger_signs.confirm_case === 'yes';
            return confirmedCase && user.contact_type === 'area_health_facility_nurse';
        },
        actions: [{form: 'specimen_form', label:'Investigate'}],
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
module.exports = {dsoTasks};