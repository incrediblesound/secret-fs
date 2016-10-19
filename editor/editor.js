const readline = require('readline')
const processKey = require('./processKey')

const CLEAR_SCREEN = '\033c'
const EDITOR_HEADER =
`EDITING FILE
save: ctrl-s
exit: ctr-x
==============

`

const editor = function (rl, doc, save, exit) {
  readline.emitKeypressEvents(process.stdin, rl)
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true)
  }
  resetScreen(rl, doc)
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
        } else {
          resetScreen(rl, doc)
        }
      }
    }
  })(doc)
  process.stdin.on('keypress', keyListener)
}

function resetScreen(rl, doc){
  rl.write(CLEAR_SCREEN)
  rl.write(EDITOR_HEADER)
  rl.write(doc.content)
}

module.exports = editor
