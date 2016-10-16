const readline = require('readline')

module.exports = function processKey (key, doc) {
  if (key.name === 'return') {
    doc.content += '\n'
  } else if (key.ctrl && key.name == 'x') {
    return { shouldContinue: false, shouldSave: false }
  } else if (key.ctrl && key.name == 's') {
    return { shouldContinue: false, shouldSave: true }
  } else if (key.shift) {
    doc.content += key.sequence
  } else if (key.name === 'space') {
    doc.content += ' '
  } else if (key.name === 'backspace') {
    doc.content = doc.content.substring(0, doc.content.length - 1)
    readline.moveCursor(process.stdout, 0, 0)
  }else {
    doc.content += key.name || key.sequence
  }
  return { shouldContinue: true, shouldSave: false }
}
