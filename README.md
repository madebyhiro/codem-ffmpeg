# IMPORTANT: this project is no longer actively maintained.

---

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
  
  // Custom attributes that expose additional information about the process/file,
  // e.g. input/output file, input duration, filesize
  console.log(instance.attributes)
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

# Running tests

`codem-ffmpeg` features a test suite written using Jasmine. Checkout the code, install the dependencies (make sure you have FFmpeg available on your path) and run:
```
# git clone https://github.com/madebyhiro/codem-ffmpeg.git
# cd codem-ffmpeg
# npm install
# npm test
```