describe('FFmpeg creation', () => {
  const FFmpeg = require('../src/codem-ffmpeg')

  beforeEach(() => {
    FFmpeg.config = new Map()
  })
  
  it('should accept an array of arguments', () => {
    let instance = new FFmpeg(['foo', 'bar'])
    expect(instance).toBeDefined()
  })
  
  it('should raise an error for anything else than an array', () => {
    expect(() => {
      new FFmpeg('foo')
    }).toThrowError('Expected arguments to be an array')
  })
  
  it('should assign the arguments', () => {
    let instance = new FFmpeg(['foo', 'bar'])
    expect(instance._args).toEqual(['foo', 'bar'])
  })
  
  it('should emit a warning if "-y" is not specified', (done) => {
    let instance = new FFmpeg(['-i', 'spec/support/fixtures/black.mp4', '-f', 'null', '-vcodec', 'libx264', '/dev/null'])
    
    instance.on('log', (level, msg) => {
      expect(level).toEqual('warn')
      expect(msg.includes("hang indefinitely")).toBe(true)
      done()
    })
  })
})

describe('FFmpeg config', () => {
  const FFmpeg = require('../src/codem-ffmpeg')

  beforeEach(() => {
    FFmpeg.config = new Map()
  })
  
  it('should reject a config that is not a map', () => {
    expect(() => {
      FFmpeg.config = 'foo'
    }).toThrowError('Expected config to be a map')
  })  
})

describe('FFmpeg spawning', () => {
  const FFmpeg = require('../src/codem-ffmpeg')

  beforeEach(() => {
    FFmpeg.config = new Map()
  })

  it('should spawn the default FFmpeg', () => {
    const childProcess = new FFmpeg([]).spawn()
    expect(childProcess.spawnfile).toEqual('ffmpeg')
  })
  
  describe('with a different FFmpeg', () => {
    it('should spawn the correct FFmpeg', () => {
      FFmpeg.config = new Map([['ffmpegBinary', '/usr/local/no/such/ffmpeg']])
      const instance = new FFmpeg([])
      instance.on('error', () => {})

      const childProcess = instance.spawn()
      expect(childProcess.spawnfile).toEqual(instance.ffmpegBinary)        
    })
  })
})

describe('FFmpeg cancelling', () => {
  const FFmpeg = require('../src/codem-ffmpeg')

  beforeEach(() => {
    FFmpeg.config = new Map()
  })

  it('should exit with the correct code', (done) => {
    const instance = new FFmpeg(['-i', 'spec/support/fixtures/black.mp4', '-f', 'null', '-vcodec', 'libx264', '/dev/null'])
    instance.on('exit', (code, signal) => {
      expect(signal).toEqual('SIGINT')
      done()
    })

    instance.spawn()
    instance.cancel()
  })
})

describe('Progress', () => {
  const FFmpeg = require('../src/codem-ffmpeg')
  let instance
  
  beforeEach(() => {
    FFmpeg.config = new Map()
    instance = new FFmpeg(['foo', 'bar'])    
  })
  
  it('should return null when there is no progress to report yet', () => {
    expect(instance.progress).toEqual(null)
  })
  
  it('should return the correct progress when it is available', () => {
    instance._duration = 10
    instance._current = 2.5
    expect(instance.progress).toEqual(0.25)
  })
})

describe('Output', () => {
  const FFmpeg = require('../src/codem-ffmpeg')
  let instance
  
  beforeEach(() => {
    FFmpeg.config = new Map()
    instance = new FFmpeg(['foo', 'bar'])
  })
  
  it('should return null when there is no output to report yet', () => {
    expect(instance.output).toEqual(null)
  })
  
  it('should return the FFmpeg output after spawning', (done) => {
    instance.on('exit', (code, signal) => {
      let output = instance.output
      
      expect(typeof output).toBe("string")
      expect(output.length).toBeGreaterThan(0)
      done()
    })

    instance.spawn()
  })
})

describe('Events', () => {
  const FFmpeg = require('../src/codem-ffmpeg')
  let instance
  
  beforeEach(() => {
    FFmpeg.config = new Map()
    instance = new FFmpeg([])
  })
  
  it('should emit the exit event with the code', (done) => {
    instance.spawn()

    instance.on('exit', (code) => {
      expect(code).toEqual(1)
      done()
    })    
  })
  
  it('should emit the correct error event when the binary can\'t launch', (done) => {
    FFmpeg.config = new Map([ ['ffmpegBinary', '/usr/local/no/such/ffmpeg']])
    instance.spawn()
    
    instance.on('error', (error) => {
      expect(error).toEqual(Error("Unable to spawn the ffmpeg binary"))
      done()
    })        
  })
  
  it('should emit progress events during transcoding', (done) => {
    // Fixture generated with:
    // ffmpeg -t 60 -s qcif -f rawvideo -pix_fmt rgb24 -r 25 -i /dev/zero -pix_fmt yuv420p -profile:v baseline -s 320x180 black.mp4
    instance = new FFmpeg(['-i', 'spec/support/fixtures/black.mp4', '-f', 'null', '-vcodec', 'libx264', '/dev/null'])
    let receivedProgress = false
    
    instance.on('exit', (code) => {
      if (receivedProgress) {
        done()
      } else {
        fail("No progress events received")
      }
    })
    
    instance.on('progress', (progress) => {
      receivedProgress = true
    })
    
    instance.spawn()
  })
})

describe('Custom attributes', () => {
  const FFmpeg = require('../src/codem-ffmpeg')
  let instance
  
  beforeEach(() => {
    FFmpeg.config = new Map()
    instance = new FFmpeg(['-i', 'spec/support/fixtures/black.mp4', '-f', 'null', '-vcodec', 'libx264', '/dev/null'])
  })
  
  it('should expose a map of custom attributes', () => {
    expect(instance.attributes instanceof Map).toEqual(true)
    expect(Array.from(instance.attributes.keys())).toEqual([ 'filesize', 'duration', 'inputFile', 'outputFile' ])
  })
  
  it('should set the duration when available', (done) => {
    instance.on('exit', (code, signal) => {
      expect(instance.attributes.get('duration')).toEqual(60)
      done()
    })

    instance.spawn()
  })
  
  it('should set the filesize when available', (done) => {
    instance.on('exit', (code, signal) => {
      expect(instance.attributes.get('filesize')).toEqual(25091)
      done()
    })

    instance.spawn()
  })

  it('should set the inputFile when available', (done) => {
    instance.on('exit', (code, signal) => {
      expect(instance.attributes.get('inputFile')).toEqual('spec/support/fixtures/black.mp4')
      done()
    })

    instance.spawn()
  })

  it('should set the outputFile when available', (done) => {
    instance.on('exit', (code, signal) => {
      expect(instance.attributes.get('outputFile')).toEqual('/dev/null')
      done()
    })

    instance.spawn()
  })  
})