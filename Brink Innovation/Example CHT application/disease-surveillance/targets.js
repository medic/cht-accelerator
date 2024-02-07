const { chpTargets, chaTargets, dsoTargets } = require('./app_targets');
module.exports = [...chpTargets, ...chaTargets, ...dsoTargets];
