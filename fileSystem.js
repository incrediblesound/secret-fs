const fs = require('fs')
const restoreFromJSON = require('./tree/tree').restoreFromJSON

const writeFileSystem = (node, encryption) => {
  const rootNode = node.getRoot()
  const data = rootNode.toJSON()
  const hiddenData = encryption.encrypt(data)
  const fileSystemName = encryption.encrypt(rootNode.name)
  fs.writeFileSync(`./contents/${fileSystemName}`, hiddenData)
}

const readFileSystem = (name, encryption) => {
  const fileSystemName = encryption.encrypt(name)
  const hiddenData = fs.readFileSync(`./contents/${fileSystemName}`).toString()
  const rawData = encryption.decrypt(hiddenData)
  const data = JSON.parse(rawData)
  const rootNode = restoreFromJSON(data)
  return rootNode
}

const removeFileSystem = (name, encryption) => {
  const fileSystemName = encryption.encrypt(name)
  fs.unlinkSync(`./contents/${fileSystemName}`)
}

module.exports = {
  writeFileSystem,
  readFileSystem,
  removeFileSystem}
