const EventEmitter = require('events')
const spawn        = require('child_process').spawn

const ERRORS = {
  ArgumentError: new Error("Expected arguments to be an array"),
  SpawnError:    new Error("Unable to spawn the ffmpeg binary")
}

class FFmpeg extends EventEmitter {
  get ffmpegBinary ()          { return this._ffmpegBinary || 'ffmpeg' }
  set ffmpegBinary (newBinary) { this._ffmpegBinary = newBinary }
  
  get progress ()              {
    if (typeof this._duration === 'undefined' || typeof this._current === 'undefined') return null
    return Math.min(this._current / this._duration)
  }
  
  constructor(args) {
    if (!Array.isArray(args)) throw ERRORS.ArgumentError
    
    super()
    this._args = args
  }
  
  cancel() {
    if (this._child_process) {
      this._child_process.kill('SIGINT');
    }
  }
  
  spawn() {
    this._child_process = spawn(this.ffmpegBinary, this._args)

    this._child_process.stderr.on('data', (data)  => { this._processData(data) })
    this._child_process.on('error', (err)         => { this.emit('error', ERRORS.SpawnError) })
    this._child_process.on('exit', (code, signal) => { this.emit('exit', code, signal) })
    
    return this._child_process
  }
  
  _extractDuration(text) {
    if (typeof this._durationBuffer === 'undefined') this._durationBuffer = ""
    this._durationBuffer += text
    
    let durationMatcher = new RegExp(/Duration:\s+(\d{2}):(\d{2}):(\d{2}).(\d{1,2})/)
    let durationMatch = durationMatcher.exec(this._durationBuffer)

    if (durationMatch == null) return

    let hours = parseInt(durationMatch[1], 10),
        minutes = parseInt(durationMatch[2], 10),
        seconds = parseInt(durationMatch[3], 10)
    this._duration = hours * 3600 + minutes * 60 + seconds
    this._current = 0
    this.emit('progress', this.progress)
  }
  
  _extractProgress(text) {
    let timeMatcher = new RegExp(/time=(\d{2}):(\d{2}):(\d{2})/)
    let timeMatch = timeMatcher.exec(text)

    if (timeMatch == null) return
      
    let hours = parseInt(timeMatch[1], 10),
        minutes = parseInt(timeMatch[2], 10),
        seconds = parseInt(timeMatch[3], 10)
    let newCurrent = hours * 3600 + minutes * 60 + seconds

    if (newCurrent == this._current) return

    this._current = newCurrent
    this.emit('progress', this.progress)
  }
  
  _processData(data) {
    let text = data.toString()
    if (typeof this._duration === 'undefined') {
      this._extractDuration(text)
    } else {
      this._extractProgress(text)
    }
  }
}

module.exports = FFmpeg