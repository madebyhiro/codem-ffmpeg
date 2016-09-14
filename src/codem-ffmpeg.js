const EventEmitter = require('events')
const spawn        = require('child_process').spawn

class FFmpeg extends EventEmitter {
  get ffmpegBinary ()          { return this._ffmpegBinary || 'ffmpeg' }
  set ffmpegBinary (newBinary) { this._ffmpegBinary = newBinary }
  
  constructor(args) {
    if (!Array.isArray(args)) throw new Error("Expected arguments to be an array")
    
    super()
    this._args = args
  }
  
  spawn() {
    return spawn(this.ffmpegBinary, this._args)
  }
}

module.exports = FFmpeg