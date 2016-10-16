const editor = require('./editor/editor')
const readline = require('readline')
const fs = require('fs')
const tree = require('./tree/tree')
const fileSystem = require('./fileSystem')
const c = require('./constants')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

if (process.stdin.isTTY) {
  process.stdin.setRawMode(true)
}

const name = process.argv[2]
const secret = process.argv[3]
FILE_INDEX = 0

if (!name || !secret) {
  throw new Error('Sfs requires a name and a secret.')
}

const encryption = require('./encryption')(secret)

let rootNode, input
try {
  const stats = fs.statSync(`./contents/${name}.sfs`)
  if (stats.isFile()) {
    rootNode = fileSystem.readFileSystem(name, encryption)
  }
} catch (e) {
  rootNode = new tree.Tree({name})
  fileSystem.writeFileSystem(rootNode, name, encryption)
}

function sfsPrompt () {
  rl.question(`${rootNode.getPath()}:> `, (input) => {
    const query = input.split(' ')
    /* LS */
    if (query[0] === 'ls') {
      rootNode.viewChildren()
      sfsPrompt()
    /* MKDIR */
    } else if (query[0] === 'mkdir' && query[1].length) {
      rootNode.create(query[1])
      fileSystem.writeFileSystem(rootNode, name, encryption)
      sfsPrompt()
    /* CD */
    } else if (query[0] === 'cd') {
      if (query[1] === '..') {
        if (rootNode.parent) {
          rootNode = rootNode.parent
        }
      } else {
        const child = rootNode.findChild(query[1])
        if (child) {
          rootNode = child
        } else {
          console.log(`No directory found with name "${query[1]}"`)
        }
      }
      sfsPrompt()
    /* TOUCH */
    } else if (query[0] === 'touch' && query[1]) {
      editor(rl, { content: '' }, (doc) => {
        const path = rootNode.getPath()
        const title = query[1]
        const fileName = encryption.encrypt(`${path}/${title}`)
        const contents = encryption.encrypt(doc.content)
        fs.writeFileSync(`./contents/${fileName}`, contents)
        const child = new tree.Tree({ name: title, type: c.FILE, contents: fileName })
        rootNode.insert(child)
        fileSystem.writeFileSystem(rootNode, name, encryption)
        sfsPrompt()
      }, () => {
        sfsPrompt()})
    /* OPEN */
    } else if (query[0] === 'open' && query[1]) {
      let file
      const fileNode = rootNode.findChild(query[1])
      const fileName = fileNode.contents
      try {
        file = fs.readFileSync(`./contents/${fileName}`)
      } catch(e) { console.log(`No file named ${query[1]}`) }
      if (file) {
        file = file.toString()
        const data = encryption.decrypt(file)
        editor(rl, { content: data }, (doc) => {
          const contents = encryption.encrypt(doc.content)
          fs.writeFileSync(`./contents/${fileName}`, contents)
          sfsPrompt()
        }, () => {
          sfsPrompt()})
      }
    } else if (query[0] === 'tree') {
      console.log(rootNode)
      sfsPrompt()
    } else if (query[0] === 'exit') {
      process.exit()
    } else {
      sfsPrompt()
    }
  })
}

sfsPrompt()
// const result = editor({ content: '' }, (doc) => {
// })
