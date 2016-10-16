const fs = require('fs')
const c = require('../constants')

class Tree {
  constructor (options) {
    if (!options.name) {
      throw new Error('Attempted to create tree without name.')
    }
    this.name = options.name
    this.type = options.type || c.DIRECTORY
    this.contents = options.contents || null
    this.children = options.children || []
    this.parent = options.parent || null
  }
  viewChildren () {
    const names = this.children.map(child => {
      return child.type === c.DIRECTORY ? `${child.name}/` : child.name
    })
    console.log(names.join('\n'))
  }
  create (name) {
    const child = new Tree({name: name, parent: this})
    this.children.push(child)
    return child
  }
  insert (child) {
    this.children.push(child)
  }
  removeSelf () {
    if (this.type === c.DIRECTORY) {
      this.children.forEach(child => child.removeSelf())
      this.parent.deleteChild(this.name)
    } else {
      fs.unlinkSync(`./contents/${this.contents}`)
      this.parent.deleteChild(this.name)
    }
  }
  deleteChild (name) {
    let index = false
    for (let i = 0, l = this.children.length; i < l; i++) {
      if (this.children[i].name === name) {
        index = i
        break
      }
    }
    if (index !== false) {
      this.children.splice(index, 1)
    }
  }
  findChild (name) {
    for (let i = 0, l = this.children.length; i < l; i++) {
      if (this.children[i].name === name) {
        return this.children[i]
      }
    }
    return null
  }
  getPath () {
    let path = this.name
    let node = this
    while(node.parent){
      path = `${node.parent.name}/${path}`
      node = node.parent
    }
    return path
  }
  getRoot () {
    let rootNode = this
    while(rootNode.parent){
      rootNode = rootNode.parent
    }
    return rootNode
  }
  toJSON () {
    return JSON.stringify({
      name: this.name,
      type: this.type,
      contents: this.contents,
      children: this.children.map(child => child.toJSON())
    })
  }
}

const restoreFromJSON = (data, parent = null) => {
  if (typeof data === 'string') {
    data = JSON.parse(data)
  }
  const rootNode = new Tree({
    name: data.name,
    type: data.type,
    contents: data.contents,
    parent: parent
  })
  data.children.forEach(child => {
    rootNode.insert(restoreFromJSON(child, rootNode))
  })
  return rootNode
}

module.exports = {
  Tree,
restoreFromJSON}
