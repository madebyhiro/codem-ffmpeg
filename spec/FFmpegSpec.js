describe('FFmpeg', () => {
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