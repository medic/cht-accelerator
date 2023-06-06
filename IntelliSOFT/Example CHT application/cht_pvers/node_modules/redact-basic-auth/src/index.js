module.exports = url => url && url.replace(/(http[s]?:\/\/[^:\s]*):[^@\s]*@/g, '$1:****@');
