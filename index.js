const axios = require("axios");
const fs = require("fs");
const path = require("path");
const tele = require("node-telegram-bot-api");
const express = require("express");
const cors = require("cors");

const server = express();

server.use(cors());

server.get("/", (req, res) => {
  res.json("hello");
});

// Function to download a video from a direct URL
const downloadVideo = async (url, downloadPath) => {
  try {
    // Make a request to the video URL
    const response = await axios({
      method: "get",
      url: url,
      responseType: "stream", // We want to stream the response
    });

    // Get the file name from the URL or set a default name
    const fileName = path.basename(url) || "downloaded_video.mp4";
    const outputPath = path.join(downloadPath, fileName);

    // Create a write stream to save the video file
    const writer = fs.createWriteStream(outputPath);

    // Pipe the response data to the write stream
    response.data.pipe(writer);

    // Return a promise that resolves when the file is finished writing
    return new Promise((resolve, reject) => {
      writer.on("finish", () => {
        console.log(`Download completed: ${outputPath}`);
        resolve(outputPath); // Resolve with the output path
      });

      writer.on("error", (err) => {
        console.error(`Error writing to file: ${err.message}`);
        reject(err); // Reject with the error
      });
    });
  } catch (error) {
    console.error(`Error downloading the video: ${error.message}`);
    throw error; // Rethrow the error
  }
};

// Function to delete a folder
const deleteFolder = async (folderPath) => {
  return new Promise((resolve, reject) => {
    fs.rm(folderPath, { recursive: true, force: true }, (err) => {
      if (err) {
        console.error(`Error deleting folder: ${err.message}`);
        reject(err); // Reject with the error
      } else {
        console.log(`Folder deleted successfully: ${folderPath}`);
        resolve(); // Resolve when folder is deleted
      }
    });
  });
};

// Main function to handle downloading and sending video
const handleVideoDownload = async (msg) => {
  const URL = msg.text;
  var videoUrl;
  if (URL.length > 10) {
    videoUrl = URL;
  } else {
    videoUrl =
      "https://sample-videos.com/video321/mp4/360/big_buck_bunny_360p_5mb.mp4";
  }
  // Replace with a direct video URL
  const downloadPath = path.join(__dirname, "download"); // Change this to your download path

  // Ensure the download directory exists
  if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath);
  }

  try {
    // Download the video
    const downloadedVideoPath = await downloadVideo(videoUrl, downloadPath);

    // Send the downloaded video
    await bot.sendVideo(msg.chat.id, downloadedVideoPath);

    // Delete the folder after sending the video
    await deleteFolder(downloadPath);
  } catch (error) {
    console.error(`Error in video processing: ${error.message}`);
    bot.sendMessage(msg.chat.id, error.message);
  }
};

// Telegram bot setup
const token = "7895999734:AAHAtxtRjlCiu4nmKyOn-xkr4rWHYi2g2AY"; // Replace with your bot token
const bot = new tele(token, { polling: true });

bot.on("message", async (msg) => {
  // Handle incoming messages
  await handleVideoDownload(msg);
});

const port = 8080;

server.listen(port, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`server is running on port ${port}`);
  }
});
