# codem-ffmpeg

`codem-ffmpeg` is a simple wrapper library for ffmpeg. It is extracted from (and used by) `codem-transcode`.

# Example usage

```javascript
const FFmpeg = require('codem-ffmpeg')

// Create new instance with array of arguments
let instance = new FFmpeg(['-i', 'input.mp4', '-y', 'output.mp4'])

// Progress reporting
instance.on('progress', (progress) => {
  console.log(progress)
})

// Exit handler
instance.on('exit', (code, signal) => {
  console.log("FFmpeg exited:", code, signal)
})

// Error handler
instance.on('error', (error) => {
  console.log("FFmpeg error:", error)
})

// Spawn the FFmpeg process
instance.spawn()

// Cancel a running process
instance.cancel()
```