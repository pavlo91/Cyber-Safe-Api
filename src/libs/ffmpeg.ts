import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import https from "https";
import path from "path";

export function saveFileFromUrl(filePath: string, url: string) {
  return new Promise<string>((resolve, reject) => {
    const dirname = path.dirname(filePath);

    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }

    const stream = fs.createWriteStream(filePath);

    https.get(url, res => {
      res
        .on("data", data => {
          stream.write(data);
        })
        .on("error", error => {
          fs.unlink(filePath, () => {
            reject(error);
          });
        })
        .on("end", () => {
          stream.end(() => {
            resolve(filePath);
          });
        });
    });
  });
}

export function generateThumbnail(filePath: string) {
  return new Promise<string>((resolve, reject) => {
    const filename = `thumbnail-${new Date().valueOf()}.jpg`;
    const folder = "./temp";

    ffmpeg(filePath)
      .on("error", error => {
        reject(error);
      })
      .on("end", () => {
        resolve(path.join(folder, filename));
      })
      .screenshots({
        folder,
        filename,
        timestamps: ["5%"]
      });
  });
}
