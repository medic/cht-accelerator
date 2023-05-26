function pojo2xml(json) {
  var content, k, xml;

  if(json == null) { // == checks for undefined too
    return '';
  } else if(Array.isArray(json)) {
    return json.map(pojo2xml).join('');
  } else if(typeof json === 'object') {
    xml = '';
    for(k in json) {
      if(!json.hasOwnProperty(k)) continue;
      if(/[^a-zA-Z0-9_:.]/.test(k)) throw new Error('Illegal characters in element name.');

      content = pojo2xml(json[k]);
      if(content === '') xml += '<' + k + '/>';
      else xml += '<' + k + '>' + content + '</' + k + '>';
    }
    return xml;
  } else if(typeof json === 'string') {
    return /[&<>"]/.test(json) ? json.replace(/[&<>"]/g, escapeSpecial) : json;
  } else return json.toString();
}

function escapeSpecial(c) {
  if(c === '"')   return '&quot;';
  if(c === '&')   return '&amp;';
  if(c === '<')   return '&lt;';
  /* c === '>' */ return '&gt;';
}

module.exports = pojo2xml;
