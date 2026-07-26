import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import { progressStore } from "../utils/progressStore";

const renditions: any[] = [];

export const processVideo = (inputPath: string, outputDir: string, videoId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    let masterPlaylist = "#EXTM3U\n#EXT-X-VERSION:3\n";

    const command = ffmpeg(inputPath)
      // Base options for HLS and fMP4/CMAF
      .outputOptions([
        "-preset veryfast",
        "-keyint_min 100",
        "-g 100",
        "-sc_threshold 0",
        "-c:v libx264",
        "-pix_fmt yuv420p",
        "-c:a aac",
        "-b:a 128k",
        "-ac 2",
        "-ar 44100",
      ]);

    // 1. Original Dimension Rendition
    command
      .output(path.join(outputDir, "original.m3u8"))
      .outputOptions([
        `-b:v 5000k`,
        `-maxrate 5300k`,
        `-bufsize 7500k`,
        `-hls_time 60`,
        `-hls_playlist_type vod`,
        `-hls_segment_type fmp4`,
        `-hls_fmp4_init_filename original_init.mp4`,
        `-hls_segment_filename ${path.join(outputDir, "original_%03d.m4s")}`
      ]);
    masterPlaylist += `#EXT-X-STREAM-INF:BANDWIDTH=5300000,RESOLUTION=ORIGINAL,NAME="Original"\noriginal.m3u8\n`;

    // 2. Fixed Dimension Renditions with Padding (Letterbox/Pillarbox)
    renditions.forEach((r, index) => {
      // The filter scale=W:H:force_original_aspect_ratio=decrease ensures we don't distort the video.
      // The pad=W:H:(ow-iw)/2:(oh-ih)/2 adds black bars to make it EXACTLY the target resolution.
      const filter = `scale=${r.width}:${r.height}:force_original_aspect_ratio=decrease,pad=${r.width}:${r.height}:(ow-iw)/2:(oh-ih)/2`;
      
      command
        .output(path.join(outputDir, `${r.name}.m3u8`))
        .outputOptions([
          `-vf ${filter}`,
          `-b:v ${r.bitrate}`,
          `-maxrate ${r.maxrate}`,
          `-bufsize ${r.bufsize}`,
          `-b:a ${r.audiorate}`,
          `-hls_time 60`,
          `-hls_playlist_type vod`,
          `-hls_segment_type fmp4`,
          `-hls_fmp4_init_filename ${r.name}_init.mp4`,
          `-hls_segment_filename ${path.join(outputDir, `${r.name}_%03d.m4s`)}`
        ]);
        
      masterPlaylist += `#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(r.maxrate.replace('k', '000'))},RESOLUTION=${r.width}x${r.height},NAME="${r.name}"\n${r.name}.m3u8\n`;
    });

    command
      .on("start", (cmdLine) => {
        progressStore[videoId] = { stage: "processing_original", percent: 0 };
        console.log("Spawned Ffmpeg with command: " + cmdLine);
      })
      .on("progress", (progress) => {
        const pct = progress.percent || 0;
        progressStore[videoId] = { stage: "processing_original", percent: pct };
      })
      .on("end", () => {
        fs.writeFileSync(path.join(outputDir, "master.m3u8"), masterPlaylist);
        console.log("FFmpeg processing finished successfully.");
        resolve();
      })
      .on("error", (err) => {
        progressStore[videoId] = { stage: "error", percent: 0 };
        reject(err);
      });

    command.run();
  });
};

const ALL_RENDITIONS = [
  { name: "1080p", width: 1920, height: 1080, bitrate: "5000k", maxrate: "5300k", bufsize: "7500k", audiorate: "192k" },
  { name: "720p", width: 1280, height: 720, bitrate: "2800k", maxrate: "2996k", bufsize: "4200k", audiorate: "128k" },
  { name: "480p", width: 854, height: 480, bitrate: "1400k", maxrate: "1498k", bufsize: "2100k", audiorate: "128k" },
  { name: "360p", width: 640, height: 360, bitrate: "800k", maxrate: "856k", bufsize: "1200k", audiorate: "96k" }
];

export const processLowerQualities = (inputPath: string, outputDir: string, videoId: string, qualities: string[], existingQualities: string[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    let masterPlaylist = "#EXTM3U\n#EXT-X-VERSION:3\n";
    masterPlaylist += `#EXT-X-STREAM-INF:BANDWIDTH=5300000,RESOLUTION=ORIGINAL,NAME="Original"\noriginal.m3u8\n`;

    // Re-add existing qualities to the master playlist so they don't get erased
    if (existingQualities && existingQualities.length > 0) {
      existingQualities.forEach(qName => {
        const r = ALL_RENDITIONS.find(rend => rend.name === qName);
        if (r) {
          masterPlaylist += `#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(r.maxrate.replace('k', '000'))},RESOLUTION=${r.width}x${r.height},NAME="${r.name}"\n${r.name}.m3u8\n`;
        }
      });
    }

    const lowerRenditions = ALL_RENDITIONS.filter(r => qualities.includes(r.name));
    
    if (lowerRenditions.length === 0) {
      // Nothing to do
      return resolve();
    }

    const command = ffmpeg(inputPath)
      .outputOptions([
        "-preset veryfast",
        "-keyint_min 100",
        "-g 100",
        "-sc_threshold 0",
        "-c:v libx264",
        "-pix_fmt yuv420p",
        "-c:a aac",
        "-b:a 128k",
        "-ac 2",
        "-ar 44100",
      ]);

    lowerRenditions.forEach((r, index) => {
      const filter = `scale=${r.width}:${r.height}:force_original_aspect_ratio=decrease,pad=${r.width}:${r.height}:(ow-iw)/2:(oh-ih)/2`;
      
      command
        .output(path.join(outputDir, `${r.name}.m3u8`))
        .outputOptions([
          `-vf ${filter}`,
          `-b:v ${r.bitrate}`,
          `-maxrate ${r.maxrate}`,
          `-bufsize ${r.bufsize}`,
          `-b:a ${r.audiorate}`,
          `-hls_time 60`,
          `-hls_playlist_type vod`,
          `-hls_segment_type fmp4`,
          `-hls_fmp4_init_filename ${r.name}_init.mp4`,
          `-hls_segment_filename ${path.join(outputDir, `${r.name}_%03d.m4s`)}`
        ]);
        
      masterPlaylist += `#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(r.maxrate.replace('k', '000'))},RESOLUTION=${r.width}x${r.height},NAME="${r.name}"\n${r.name}.m3u8\n`;
    });

    command
      .on("start", (cmdLine) => {
        progressStore[videoId] = { stage: "processing_qualities", percent: 0 };
        console.log("Spawned Ffmpeg (Lower Qualities) with command: " + cmdLine);
      })
      .on("progress", (progress) => {
        const pct = progress.percent || 0;
        progressStore[videoId] = { stage: "processing_qualities", percent: pct };
      })
      .on("end", () => {
        fs.writeFileSync(path.join(outputDir, "master.m3u8"), masterPlaylist);
        console.log("FFmpeg processing for lower qualities finished successfully.");
        resolve();
      })
      .on("error", (err) => {
        progressStore[videoId] = { stage: "error", percent: 0 };
        reject(err);
      });

    command.run();
  });
};
