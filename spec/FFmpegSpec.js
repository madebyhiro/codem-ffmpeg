describe('FFmpeg creation', () => {
  const FFmpeg = require('../src/codem-ffmpeg')

  it('should accept an array of arguments', () => {
    let instance = new FFmpeg(['foo', 'bar'])
    expect(instance).toBeDefined()
  })
  
  it('should not accept anything other', () => {
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
      const child_process = instance.spawn()
      expect(child_process.spawnfile).toEqual(instance.ffmpegBinary)
    })
  })
})