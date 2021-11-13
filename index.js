const fs = require("fs");
const express = require("express");
const app = express();
const port = 3000;
const ffmpeg = require("fluent-ffmpeg");
const formidable = require("formidable");

app.use(function (req, res, next) {
     res.header("Access-Control-Allow-Origin", "*");
     res.header(
          "Access-Control-Allow-Headers",
          "Origin, X-Requested-With, Content-Type, Accept"
     );
     next();
});

function convertToHls(videoUrl) {
     var inputVideoUrl = videoUrl;
     

     var folderName = inputVideoUrl.replace('./videos/', '').split('.');
     folderName.pop();
     folderName = folderName[0];
     var outputVidoUrl = folderName + '.m3u8';


     // var outputVidoUrl = `./streams/${folderName}/${outputVidoUrl}`;
     // console.log(outputVidoUrl);
     var outputVidoUrl = './streams'

     // Below is FFMPEG converting MP4 to HLS with reasonable options.
     // https://www.ffmpeg.org/ffmpeg-formats.html#hls-2
     ffmpeg(inputVideoUrl, { timeout: 432000 })
          .addOptions([
               "-profile:v baseline", // baseline profile (level 3.0) for H264 video codec
               "-level 3.0",
               "-s 640x360", // 640px width, 360px height output video dimensions
               "-start_number 0", // start the first .ts segment at index 0
               "-hls_time 10", // 10 second segment duration
               "-hls_list_size 0", // Maxmimum number of playlist entries (0 means all entries/infinite)
               "-f hls", // HLS format,
               "index.m3u8"
          ])
          .output('outputfile.mp4')
          .on("end", callback)
          .run();
}

function callback() {
     console.log("done");
} // do something when encoding is done

// upload file
app.get("/", (req, res) => {
     // res.send(`
     //   <h2>With <code>"express"</code> npm package</h2>
     //   <form action="/api/upload" enctype="multipart/form-data" method="post">
     //     <div>Text field title: <input type="text" name="title" /></div>
     //     <div>File: <input type="file" name="someExpressFiles" multiple="multiple" /></div>
     //     <input type="submit" value="Upload" />
     //   </form>
     // `);
});

// FileUpload
app.post("/api/uploadvideo", (req, res, next) => {
     const form = formidable({ multiples: false });

     form.parse(req, (err, fields, file) => {
          if (err) {
               next(err);
               return;
          }
          // res.json({file});
          // res.end();

          // move fiile from temporarry location to final location

          var oldPath = file.video.path;
          var newPath = `./videos/${file.video.name}`;

          fs.rename(oldPath, newPath, (err) => {
               if (err) throw err;
               res.status(200).send({ message: "Video Uploaded Succesfully!" });

               convertToHls(newPath);
               res.end();
          });
     });
});


app.get("/video", function (req, res) {
     const range = req.headers.range;
     if (!range) {
          res.status(400).send('Requires Range Header');
     }

     const videoPath = 'streams/'
})

app.listen(port, function () {
     console.log("listening to port: ", port);
});
