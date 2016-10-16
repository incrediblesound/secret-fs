const crypto = require('crypto')

const encryption = (secret) => {
  return {
    encrypt: (data) => {
      const cipher = crypto.createCipher('aes192', secret)
      data = cipher.update(data, 'utf8', 'hex')
      data += cipher.final('hex')
      return data
    },
    decrypt: (data) => {
      const decipher = crypto.createDecipher('aes192', secret)
      data = decipher.update(data, 'hex', 'utf8')
      data += decipher.final('utf8')
      return data
    }
  }
}

module.exports = encryption
