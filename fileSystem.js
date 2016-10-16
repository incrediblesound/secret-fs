const fs = require('fs')
const restoreFromJSON = require('./tree/tree').restoreFromJSON

const writeFileSystem = (node, encryption) => {
  const rootNode = node.getRoot()
  const data = rootNode.toJSON()
  const hiddenData = encryption.encrypt(data)
  fs.writeFileSync(`./contents/${rootNode.name}.sfs`, hiddenData)
}

const readFileSystem = (name, encryption) => {
  const hiddenData = fs.readFileSync(`./contents/${name}.sfs`).toString()
  const rawData = encryption.decrypt(hiddenData)
  const data = JSON.parse(rawData)
  const rootNode = restoreFromJSON(data)
  return rootNode
}

module.exports = {
  writeFileSystem,
readFileSystem}
