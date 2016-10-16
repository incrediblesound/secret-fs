const readline = require('readline')
const processKey = require('./processKey')

const editor = function (rl, doc, save, exit) {
  readline.emitKeypressEvents(process.stdin, rl)
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true)
  }
  rl.write('EDITOR\nsave: ctrl-s\nexit: ctr-x\n\n')
  rl.write(doc.content)
  const keyListener = (function (doc) {
    return function (chunk, key) {
      if (key) {
        const data = processKey(key, doc)
        if (data.shouldSave) {
          process.stdin.removeListener('keypress', keyListener)
          rl.write('\nsaving...\n')
          return save(doc)
        }
        if (!data.shouldContinue) {
          process.stdin.removeListener('keypress', keyListener)
          rl.write('\nexiting...\n')
          return exit()
        }
      }
    }
  })(doc)
  process.stdin.on('keypress', keyListener)
}

module.exports = editor
