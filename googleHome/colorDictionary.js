
function LightenDarkenColor(col, amt) {
  // src: https://css-tricks.com/snippets/javascript/lighten-darken-color/
  var usePound = false;

  if (col[0] === "#") {
      col = col.slice(1);
      usePound = true;
  }

  var num = parseInt(col,16);

  var r = (num >> 16) + amt;

  if (r > 255) r = 255;
  else if  (r < 0) r = 0;

  var b = ((num >> 8) & 0x00FF) + amt;

  if (b > 255) b = 255;
  else if  (b < 0) b = 0;

  var g = (num & 0x0000FF) + amt;

  if (g > 255) g = 255;
  else if (g < 0) g = 0;

  return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);

}

function extractPercentage(string){
  const percentageExtractRegex = /([0-9]{1,3})(?:%| ?Prozent)/;
  const matches = percentageExtractRegex.exec(string);
  if(matches && matches.length >= 2){
    return parseInt(matches[1], 10);
  }
  if(string.includes("etwas")){
    return 30;
  }
  if(string.includes("viel")){
    return 100;
  }
  if(string.includes("doppelt")){
    return 150;
  }
  if(string.includes("halb")){
    return -150;
  }
  return 75;
}

function lighten(currentColor, requestString){
  return LightenDarkenColor(currentColor, extractPercentage(requestString));
}

function darken(currentColor, requestString){
  return LightenDarkenColor(currentColor, -extractPercentage(requestString));
}


exports.list = [
  {"name":"rot", "value":"#ff0000"},
  {"name":"orange", "value":"#ff9900"},
  {"name":"grün", "value":"#00ff00"},
  {"name":"blau", "value":"#0000ff"},
  {"name":"schwarz", "value":"#000000"},
  {"name":"aus", "value":"#000000"},
  {"name":"weiß", "value":"#ffffff"},
  {"name":"an", "value":"#ffffff"},
  {"name":"türkis", "value":"#00ffff"},
  {"name":"lila", "value":"#b90cff"},
  {"name":"pink", "value":"#ff00ff"},
  {"name":"gelb", "value":"#ffff00"},
  {"name":"hell", "value": lighten},
  {"name":"dunkel", "value": darken},
  {"name":"dunkler", "value": darken},
]
