const EventEmitter = require('events')

class FFmpeg extends EventEmitter {
  constructor(args) {
    if (!Array.isArray(args)) throw new Error("Expected arguments to be an array")
    
    super()
    this._args = args
  }
  
  spawn() {
  }
}

module.exports = FFmpeg