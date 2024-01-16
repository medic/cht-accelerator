const appTargetExtras = require('./app_targets');
const {chpTargets, chaTargets, dsoTargets} = appTargetExtras;
module.exports = [
    ...chpTargets,
    ...chaTargets,
    ...dsoTargets
];