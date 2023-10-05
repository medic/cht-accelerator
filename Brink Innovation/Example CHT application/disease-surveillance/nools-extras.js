// Constants
//const MS_IN_DAY = 24 * 60 * 60 * 1000;
//const MAX_DAYS_IN_SUSPICION = 7; // 1 week = 7 days

const isSuspicionFormsArray = ['patient.suspicion_followup'];

// Helper functions
function isAlive(contact) {
  return contact && contact.contact && !contact.contact.date_of_death;
}

function getField(report, fieldPath) {
  return fieldPath
    .split('.')
    .reduce((prev, fieldName) => {
      if (prev === undefined) {
        return undefined;
      }
      return prev[fieldName];
    }, report);
}

function isFormArraySubmittedInWindow(reports, formArray, start, end, count) {
  let found = false;
  let reportCount = 0;
  reports.forEach(function (report) {
    if (formArray.includes(report.form)) {
      if (report.reported_date >= start && report.reported_date <= end) {
        found = true;
        if (count) {
          reportCount++;
        }
      }
    }
  });

  if (count) {
    return reportCount >= count;
  }
  return found;
}

function isSuspicionForm(report) {
  return isSuspicionFormsArray.includes(report.form);
}

function isFormArraySubmittedInWindowExcludingThisReport(reports, formArray, start, end, exReport, count) {
  let found = false;
  let reportCount = 0;
  reports.forEach(function (report) {
    if (formArray.includes(report.form)) {
      if (report.reported_date >= start && report.reported_date <= end && report._id !== exReport._id) {
        found = true;
        if (count) {
          reportCount++;
        }
      }
    }
  });
  if (count) {
    return reportCount >= count;
  } else {
    return found;
  }
}

function getMostRecentReport(reports, form) {
  let result;
  reports.forEach(function (report) {
    if (form.includes(report.form) && !report.deleted && (!result || report.reported_date > result.reported_date)) {
      result = report;
    }
  });
  return result;
}

function getNewestSuspicionTimestamp(contact) {
  if (!contact.contact) {
    return 0;
  }
  const newestSuspicion = getMostRecentReport(contact.reports, 'patient.suspicion_followup');
  return newestSuspicion ? newestSuspicion.reported_date : 0;
}

function countReportsSubmittedInWindow(reports, form, start, end, condition) {
  let reportsFound = 0;
  reports.forEach(function (report) {
    if (form.includes(report.form)) {
      if (report.reported_date >= start && report.reported_date <= end) {
        if (!condition || condition(report)) {
          reportsFound++;
        }
      }
    }
  });
  return reportsFound;
}

function getReportsSubmittedInWindow(reports, form, start, end, condition) {
  const reportsFound = [];
  reports.forEach(function (report) {
    if (form.includes(report.form)) {
      if (report.reported_date >= start && report.reported_date <= end) {
        if (!condition || condition(report)) {
          reportsFound.push(report);
        }
      }
    }
  });
  return reportsFound;
}

function getDateISOLocal(s) {
  if (!s) {
    return new Date();
  }
  const b = s.split(/\D/);
  const d = new Date(b[0], b[1] - 1, b[2]);
  if (isValidDate(d)) {
    return d;
  }
  return new Date();
}

function getTimeForMidnight(d) {
  const date = new Date(d);
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
}

function getDateMS(d) {
  if (typeof d === 'string') {
    if (d === '') {
      return null;
    }
    d = getDateISOLocal(d);
  }
  return getTimeForMidnight(d).getTime();
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

function addDays(date, days) {
  const result = getTimeForMidnight(new Date(date));
  result.setDate(result.getDate() + days);
  return result;
}

const getNewestReport = function (reports, forms) {
  let result;
  reports.forEach(function (report) {
    if (!forms.includes(report.form)) {
      return;
    }
    if (!result || report.reported_date > result.reported_date) {
      result = report;
    }
  });
  return result;
};

const getLMPDateFromSuspicionFollowUp = function (report) {
  return isSuspicionForm(report) && getDateMS(getField(report, 'lmp_date_8601'));
};

function isCholeraTaskMuted(contact) {
  const latestVisit = getNewestReport(contact.reports, isSuspicionFormsArray);
  return latestVisit && isSuspicionForm(latestVisit) && getField(latestVisit, 'suspicion_ended.clear_option') === 'clear_all';
}

// Exported functions
module.exports = {
  addDays,
  isAlive,
  getTimeForMidnight,
  isFormArraySubmittedInWindow,
  isFormArraySubmittedInWindowExcludingThisReport,
  getDateMS,
  getDateISOLocal,
  isSuspicionForm,
  getMostRecentReport,
  getNewestSuspicionTimestamp,
  getReportsSubmittedInWindow,
  countReportsSubmittedInWindow,
  getLMPDateFromSuspicionFollowUp,
  getNewestReport,
  isCholeraTaskMuted,
  getField,
};
