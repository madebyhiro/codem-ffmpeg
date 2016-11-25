const EventEmitter = require('events')
const spawn        = require('child_process').spawn
const fs           = require('fs')

const ERRORS = {
  ArgumentError: new Error("Expected arguments to be an array"),
  ConfigError:   new Error("Expected config to be a map"),
  SpawnError:    new Error("Unable to spawn the ffmpeg binary")
}

const WARNINGS = {
  NoOverwriteOptionFound: "The job arguments did not include the output overwrite option (\"-y\"). " +
                           "This can potentially cause a job to hang indefinitely. We recommend you add this " +
                           "option unless you're absolutely sure the output file does not already exist."
}

let _config = new Map()

class FFmpeg extends EventEmitter {
  static get config () { return _config }
  static set config (newConfig) {
    if (!(newConfig instanceof Map)) throw ERRORS.ConfigError
    _config = newConfig
  }
  
  get ffmpegBinary ()          { return _config.get('ffmpegBinary') || 'ffmpeg' }
  
  get attributes () {
    return new Map([
      ['filesize', this._filesize || null],
      ['duration', this._duration],
      ['inputFile', this._inputFile],
      ['outputFile', this._outputFile]
    ])
  }

  get output () {
    return this._output || null
  }
  get progress () {
    if (typeof this._duration === 'undefined' || typeof this._current === 'undefined') return null
    return Math.min(this._current / this._duration)
  }

  get _inputFile () {
    return this._findFirstMatchInOutput(new RegExp(/^Input #\d+,.*, from '(.*)':$/))
  }

  get _outputFile () {
    return this._findFirstMatchInOutput(new RegExp(/^Output #\d+,.*, to '(.*)':$/))
  }
  
  constructor(args) {
    if (!Array.isArray(args)) throw ERRORS.ArgumentError

    super()
    this._args = args
    
      if (!args.includes("-y")) setImmediate(() => { this.emit('log', 'warn', WARNINGS.NoOverwriteOptionFound) })
  }
  
  cancel() {
    if (this._childProcess) {
      this._childProcess.kill('SIGINT');
    }
  }
  
  spawn() {
    this._childProcess = spawn(this.ffmpegBinary, this._args)

    this._childProcess.stderr.on('data', (data)  => { this._processData(data) })
    this._childProcess.on('error', (err)         => { this.emit('error', ERRORS.SpawnError) })
    this._childProcess.on('exit', (code, signal) => { this.emit('exit', code, signal) })
    
    this._output = ""
    return this._childProcess
  }
  
  _extractDuration(text) {
    if (typeof this._durationBuffer === 'undefined') this._durationBuffer = ""
    this._durationBuffer += text
    
    let durationMatcher = new RegExp(/Duration:\s+(\d{2}):(\d{2}):(\d{2})\.\d+/)
    let durationMatch = durationMatcher.exec(this._durationBuffer)

    if (durationMatch == null) return

    let [,hours, minutes, seconds] = durationMatch.map(t => parseInt(t, 10))
      
    this._duration = hours * 3600 + minutes * 60 + seconds
    this._current = 0
    this.emit('progress', this.progress)
  }
  
  _extractFilesize() {
    if (this._isStatRunning) return
      
    this._isStatRunning = true
      
    fs.stat(this._inputFile, (err, stats) => {
      if (err) {
        this._filesize = Number.NaN
      } else {
        this._filesize = (stats.isFile() ? stats.size : Number.NaN)
      }
      
      this.isStatRunning = false
    })
  }
  
  _extractProgress(text) {
    let timeMatcher = new RegExp(/time=(\d{2}):(\d{2}):(\d{2})/)
    let timeMatch = timeMatcher.exec(text)

    if (timeMatch == null) return
    
    let [,hours, minutes, seconds] = timeMatch.map(t => parseInt(t, 10))
    let newCurrent = hours * 3600 + minutes * 60 + seconds

    if (newCurrent == this._current) return

    this._current = newCurrent
    this.emit('progress', this.progress)
  }
  
  _findFirstMatchInOutput(regexp) {
    if (this.output === null) return null
  
    const lines = this.output.split("\n")
    const inputMatcher = regexp

    for (let line of lines) {
      let inputMatch = inputMatcher.exec(line)
      if (inputMatch && inputMatch[1]) {
        return inputMatch[1]
      }
    }

    return null
  }
  
  _processData(data) {
    let text = data.toString()
    this._output += text
    if (typeof this._duration === 'undefined') {
      this._extractDuration(text)
    } else {
      this._extractProgress(text)
    }
    
    if (typeof this._filesize === 'undefined' && this._inputFile != null) {
      this._extractFilesize()
    }
  }
}

module.exports = FFmpeg