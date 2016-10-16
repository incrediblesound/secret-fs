const fs = require('fs')
const restoreFromJSON = require('./tree/tree').restoreFromJSON

const writeFileSystem = (node, encryption) => {
  const rootNode = node.getRoot()
  const data = rootNode.toJSON()
  const hiddenData = encryption.encrypt(data)
  const fileSystemName = encryption.encrypt(rootNode.name)
  fs.writeFileSync(`./contents/${fileSystemName}.sfs`, hiddenData)
}

const readFileSystem = (name, encryption) => {
  const fileSystemName = encryption.encrypt(name)
  const hiddenData = fs.readFileSync(`./contents/${fileSystemName}.sfs`).toString()
  const rawData = encryption.decrypt(hiddenData)
  const data = JSON.parse(rawData)
  const rootNode = restoreFromJSON(data)
  return rootNode
}

module.exports = {
  writeFileSystem,
readFileSystem}
