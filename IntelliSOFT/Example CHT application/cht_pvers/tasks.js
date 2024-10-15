
module.exports = [

  /*
   Create a Task when a new contact is created
   NOTE: Only show if the current user is a CHW  
   */
  /*Create a Task when chw submits an assessment form NOTE: Only the supervisor should get this task
   */
  {
    name: 'padr-after-assessment',
    icon: 'icon-healthcare',
    title: 'Household Member Visit',
    appliesTo: 'reports',
    appliesToType: ['assessment'],
    // actions: [{ form: 'padr' }],
    actions: [{
      type: 'report',
      form: 'padr',
      // Pass content that will be used within the task form
      modifyContent: function (content, contact, report) {

        var type = '';
        const reaction = Utils.getField(report, 'reporter.group_report.group_report_adr.reaction');
        if (reaction === 'Yes') {
          type = 'Reaction';
        }
        const quality = Utils.getField(report, 'reporter.group_report.group_report_quality.medicine');
        if (quality === 'Yes') {
          type = 'Medicine';
        }
        content.select = type;
      }
    }],
    events: [
      {
        id: 'padr-form',
        days: 7,
        start: 7,
        end: 2,
      }
    ],
    appliesIf: function (contact, report) {
      return (Utils.getField(report, 'reporter.group_report.group_report_adr.reaction') === 'Yes' && Utils.getField(report, 'reporter.group_report.group_report_death.death') === 'No' && user.role === 'chw_supervisor')
        || (Utils.getField(report, 'reporter.group_report.group_report_quality.medicine') === 'Yes' && Utils.getField(report, 'reporter.group_report.group_report_death.death') === 'No' && user.role === 'chw_supervisor');
    },
    resolvedIf: function (contact, report, event, dueDate) {
      return Utils.isFormSubmittedInWindow(
        contact.reports,
        'padr',
        Utils.addDate(dueDate, -event.start).getTime(),
        Utils.addDate(dueDate, event.end + 1).getTime()
      );
    }

  },
  {
    name: 'assessment-after-registration',
    icon: 'icon-healthcare',
    title: 'Household Member Assessment',
    appliesTo: 'contacts',
    appliesToType: ['persons'], //Don't show this task
    appliesIf: c => c.contact.role === 'patient' && user.role === 'chw', /*Todo: add check for CHW*/
    actions: [{ form: 'assessments' }],
    events: [
      {
        id: 'assessment-form',
        days: 7,
        start: 7,
        end: 2,
      }
    ],
    resolvedIf: function (contact, report, event, dueDate) {
      return Utils.isFormSubmittedInWindow(
        contact.reports,
        'assessment',
        Utils.addDate(dueDate, -event.start).getTime(),
        Utils.addDate(dueDate, event.end + 1).getTime()
      );
    }

  },
  // Create a CHW Task to ensure the Patient went to the hospital: :7 Days grace period 2
  {
    name: 'chw-follow-up',
    icon: 'icon-followup',
    title: 'CHP Referral Follow Up',
    appliesTo: 'reports',
    appliesToType: ['padr'],
    appliesIf: function (contact, report) {
      return (Utils.getField(report, 'form.outcome_details.group_outcome_details.outcome') === 'Not Recovered/Not Resolved' && user.role === 'chw' ||
        Utils.getField(report, 'form.outcome_details.group_outcome_details.outcome') === 'Unknown' && user.role === 'chw');
    },
    actions: [{ form: 'chw_follow' }],
    events: [
      {
        id: 'chw-follow-up-form',
        days: 7,
        start: 7,
        end: 2,
      }
    ],
    resolvedIf: function (contact, report, event, dueDate) {
      return Utils.isFormSubmittedInWindow(
        contact.reports,
        'chw_follow',
        Utils.addDate(dueDate, -event.start).getTime(),
        Utils.addDate(dueDate, event.end + 1).getTime()
      );
    }

  },

  // CREATE a death confirmation task for CHW Supervisor

  {
    name: 'supervisor-death-confirmation',
    icon: 'icon-death-coffin',
    title: 'Death Confirmation',
    appliesTo: 'reports',
    appliesToType: ['assessment'],
    appliesIf: function (contact, report) {
      return (Utils.getField(report, 'reporter.group_report.group_report_death.death') === 'Yes' && user.role === 'chw_supervisor');
    },
    actions: [{ form: 'death_confirmation' }],
    events: [
      {
        id: 'death-confirmation-form',
        days: 5,
        start: 5,
        end: 2,
      }
    ],
    resolvedIf: function (contact, report, event, dueDate) {
      return Utils.isFormSubmittedInWindow(
        contact.reports,
        'death_confirmation',
        Utils.addDate(dueDate, -event.start).getTime(),
        Utils.addDate(dueDate, event.end + 1).getTime()
      );
    }

  },
  {
    name: 'supervisor-death-confirmation-alt',
    icon: 'icon-death-coffin',
    title: 'Death Confirmation',
    appliesTo: 'reports',
    appliesToType: ['padr'],
    appliesIf: function (contact, report) {
      return (Utils.getField(report, 'form.outcome_details.group_outcome_details.outcome') === 'Death' && user.role === 'chw_supervisor');
    },
    actions: [{ form: 'death_confirmation' }],
    events: [
      {
        id: 'death-confirmation-form-alt',
        days: 5,
        start: 5,
        end: 2,
      }
    ],
    resolvedIf: function (contact, report, event, dueDate) {
      return Utils.isFormSubmittedInWindow(
        contact.reports,
        'death_confirmation',
        Utils.addDate(dueDate, -event.start).getTime(),
        Utils.addDate(dueDate, event.end + 1).getTime()
      );
    }

  },

  // Create a Task for Supervisor to follow up patient if not avaialable:: 5 days maximum
  {
    name: 'supervisor-padr-follow-up',
    icon: 'icon-followup',
    title: 'CHP Supervisor Follow Up',
    appliesTo: 'reports',
    appliesToType: ['padr'],
    appliesIf: function (contact, report) {
      return (Utils.getField(report, 'availability.availability_report.available') === 'No' && user.role === 'chw_supervisor');
    },
    // actions: [{ form: 'padr' }],
    actions: [{
      type: 'report',
      form: 'padr',
      // Pass content that will be used within the task form
      modifyContent: function (content, contact, report) {
        var type = Utils.getField(report, 'inputs.select');
        content.select = type;
      }
    }],
    events: [
      {
        id: 'padr-follow-up-report',
        days: 5,
        start: 5,
        end: 2,
      }
    ],
    resolvedIf: function (contact, report, event, dueDate) {
      // Check if the 'padr' form has been submitted within the specified window
      const formSubmittedInWindow = Utils.isFormSubmittedInWindow(
        contact.reports,
        'padr',
        Utils.addDate(dueDate, -event.start).getTime(),
        Utils.addDate(dueDate, event.end + 1).getTime()
      );

      // Check if the 'padr' form has a 'yes' submission
      const padrFormHasYes = contact.reports.some((rep) => {
        return rep.form === 'padr' && Utils.getField(rep, 'availability.availability_report.available') === 'Yes';
      });

      // Return true if both conditions are met
      return formSubmittedInWindow && padrFormHasYes;
    }

  },



  // Show Task for Supervisor when the patient is not recovered after visit
  {
    name: 'no-recovery-after-referral',
    icon: 'icon-followup',
    title: 'Post CHP Follow Up',
    appliesTo: 'reports',
    appliesToType: ['chw_follow'],
    actions: [{ form: 'follow' }],
    events: [
      {
        id: 'no-recovery-after-referral-open',
        days: 7,
        start: 7,
        end: 2,
      }
    ],
    priority: {
      level: 'high',
    },
    appliesIf: function (contact, report) {
      return (Utils.getField(report, 'reporter.group_report.status') === 'Patient has not recovered' && user.role === 'chw_supervisor') || (Utils.getField(report, 'reporter.group_report.fully_recovered') === 'No' && user.role === 'chw_supervisor');
    },
    resolvedIf: function (contact, report, event, dueDate) {
      return Utils.isFormSubmittedInWindow(
        contact.reports,
        'follow',
        Utils.addDate(dueDate, -event.start).getTime(),
        Utils.addDate(dueDate, event.end + 1).getTime()
      );
    }
  }

];