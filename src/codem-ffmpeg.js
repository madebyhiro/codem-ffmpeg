const EventEmitter = require('events')
const spawn        = require('child_process').spawn

const ERRORS = {
  ArgumentError: new Error("Expected arguments to be an array"),
  SpawnError:    new Error("Unable to spawn the ffmpeg binary")
}

class FFmpeg extends EventEmitter {
  get ffmpegBinary ()          { return this._ffmpegBinary || 'ffmpeg' }
  set ffmpegBinary (newBinary) { this._ffmpegBinary = newBinary }
  
  get progress ()              { return this._progress || null }
  
  constructor(args) {
    if (!Array.isArray(args)) throw ERRORS.ArgumentError
    
    super()
    this._args = args
  }
  
  spawn() {
    let child_process = spawn(this.ffmpegBinary, this._args)

    // child_process.stderr.on('data', (data) => { console.log(data) })
    child_process.on('error', (err)        => { this.emit('error', ERRORS.SpawnError) })
    child_process.on('exit', (code)        => { this.emit('exit', code) })
    
    return child_process
  }
}

module.exports = FFmpeg