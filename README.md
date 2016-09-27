# codem-ffmpeg

`codem-ffmpeg` is a simple wrapper library for ffmpeg. It is extracted from (and used by) `codem-transcode`.

# Example usage

```
const FFmpeg = require('codem-ffmpeg')

let instance = new FFmpeg(['-i', 'input.mp4', '-y', 'output.mp4'])

instance.on('progress', (progress) => {
  console.log(progress)
})

instance.on('exit', (code) => {
  console.log("FFmpeg exited: ", code)
})

instance.on('error', (error) => {
  console.log("FFmpeg error: ", error)
})

instance.spawn()
```