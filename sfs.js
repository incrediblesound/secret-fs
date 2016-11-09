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
fileSystemName = encryption.encrypt(name)

let rootNode, input
try {
  const stats = fs.statSync(`./contents/${fileSystemName}`)
  if (stats.isFile()) {
    rootNode = fileSystem.readFileSystem(name, encryption)
  }
} catch (e) {
  rootNode = new tree.Tree({name})
  fileSystem.writeFileSystem(rootNode, encryption)
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
      fileSystem.writeFileSystem(rootNode, encryption)
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
        const child = new tree.Tree({
          name: title,
          type: c.FILE,
          contents: fileName,
          parent: rootNode
        })
        rootNode.insert(child)
        fileSystem.writeFileSystem(rootNode, encryption)
        sfsPrompt()
      }, () => {
        sfsPrompt()})
    /* OPEN */
    } else if (query[0] === 'open' && query[1]) {
      let file
      const fileNode = rootNode.findChild(query[1])
      if (!fileNode) {
        console.log(`No file named "${query[1]}"`)
        return sfsPrompt()
      }
      const fileName = fileNode.contents
      try {
        file = fs.readFileSync(`./contents/${fileName}`)
      } catch(e) {
        console.log(`The data for file "${query[1]}" is missing.`)
        return sfsPrompt()
      }
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
    /* RM */
    } else if (query[0] === 'rm' && query[1]) {
      const fileNode = rootNode.findChild(query[1])
      if (!fileNode) {
        console.log(`No file or directory named "${query[1]}"`)
        return sfsPrompt()
      }
      if (fileNode.type === c.DIRECTORY) {
        rl.question(`Are you sure you want to delete the directory "${query[1]}" and everything in it? (y/n):> `, (answer) => {
          if (answer === 'y' || answer === 'yes') {
            fileNode.removeSelf()
          }
          fileSystem.writeFileSystem(rootNode, encryption)
          return sfsPrompt()
        })
      } else {
        fileNode.removeSelf()
        fileSystem.writeFileSystem(rootNode, encryption)
      }
    /* VARIOUS UTIL */
    } else if (query[0] === 'delete-all') {
      rl.question('Are you sure you want to delete your entire file system? This action cannot be undone. (y/n):> ', (answer) => {
        if (answer === 'y' || answer === 'yes') {
          const parentNode = rootNode.getRoot()
          parentNode.children.forEach(child => {
            child.removeSelf()
          })
          fileSystem.removeFileSystem(name, encryption)
          process.exit()
        }
      })
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
