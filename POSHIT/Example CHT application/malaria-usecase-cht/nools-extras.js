const isFormArraySubmittedInWindow = (reports, formsArray, startTime, endTime) => {
  if(typeof formsArray === 'string') { 
    formsArray = [ formsArray ];
  }
  return formsArray.some(f => Utils.isFormSubmittedInWindow(reports, f, startTime, endTime));
};

module.exports = {
  isFormArraySubmittedInWindow,
};
