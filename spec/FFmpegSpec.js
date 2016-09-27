describe('FFmpeg creation', () => {
  const FFmpeg = require('../src/codem-ffmpeg')

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
})

describe('FFmpeg spawning', () => {
  const FFmpeg = require('../src/codem-ffmpeg')

  it('should spawn the default FFmpeg', () => {
    const child_process = new FFmpeg([]).spawn()
    expect(child_process.spawnfile).toEqual('ffmpeg')
  })
  
  describe('with a different FFmpeg', () => {
    it('should spawn the correct FFmpeg', () => {
      const instance = new FFmpeg([])
      instance.ffmpegBinary = '/usr/local/no/such/ffmpeg'
      instance.on('error', () => {})

      const child_process = instance.spawn()
      expect(child_process.spawnfile).toEqual(instance.ffmpegBinary)        
    })
  })
})

describe('Progress', () => {
  const FFmpeg = require('../src/codem-ffmpeg')
  let instance
  
  beforeEach(() => {
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

describe('Events', () => {
  const FFmpeg = require('../src/codem-ffmpeg')
  let instance
  
  beforeEach(() => {
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
    instance.ffmpegBinary = '/usr/local/no/such/ffmpeg'
    instance.spawn()
    
    instance.on('error', (error) => {
      expect(error).toEqual(Error("Unable to spawn the ffmpeg binary"))
      done()
    })        
  })
})