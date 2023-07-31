const isFormArraySubmittedInWindow = (reports, formsArray, startTime, endTime) => {
  if(typeof formsArray === 'string') { 
    formsArray = [ formsArray ];
  }
  return formsArray.some(f => Utils.isFormSubmittedInWindow(reports, f, startTime, endTime));
};

const isContactValid = (contact) => contact.contact && !contact.contact.date_of_death && !contact.contact.muted;

module.exports = {
  isFormArraySubmittedInWindow,
  isContactValid
};
