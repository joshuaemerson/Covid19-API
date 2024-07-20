const csv = require("fast-csv");
const fs = require("fs");

const read = (path) => {
    return new Promise((resolve, reject) => {
      const rows = [];
      csv
        .parseFile(path, { headers: true })
        .on("data", (row) => {
          rows.push(row);
        })
        .on("end", () => resolve(rows))
        .on("error", (err) => reject("Error"));
    });
};
  
  const write = (results, path) => {
    return new Promise((res, rej) => {
      csv
        .writeToStream(fs.createWriteStream("." + path), results, {
          writeHeaders: true,
          includeEndRowDelimiter: true,
          headers: Object.keys(results[0]),
        })
        .on("error", (err) => rej(err))
        .on("finish", () => res());
    });
};

module.exports = {read, write}