"use strict";

// Express
const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
app.use(bodyParser.json());

//CSV parser

const multer = require("multer");
const upload = multer({ dest: "temp/" });


// Mongo
const { MongoClient } = require("mongodb");

// Connection URL
// const url = "mongodb://localhost:27017";
// const url = "mongodb+srv://affan:csc301@cluster0.hc477.mongodb.net"
const url = "mongodb+srv://csc301:csc301@cluster0.bvvvw.mongodb.net"
const client = new MongoClient(url);


// Helpers

const {read, write} = require("./helpers/read_write.js");
const {checkValidTimeSeries, checkValidDailyReport} = require("./helpers/file_format_checkers.js")
const {dateFilter, dateFilterV2, calculateActive, removeExtraneousFields} = require("./helpers/query_helpers");

app.post("/time_series/:timeseries_name/:data_type", upload.single("file"), async (req, res) => { 
    if (! req.file ) {
      res.status(422).send("Invalid file contents");
    } else {
      try {
        await client.connect();
        console.log("Connected successfully to server - post");
        const db = client.db(req.params.timeseries_name);
  
        const collections = (await db.listCollections().toArray()).map(
          (c) => c.name
        );
        if (collections.includes(req.params.data_type)) {
          const collection = db.collection(req.params.data_type);
          read(req.file.path)
            .then(async (result) => {
              const valid = checkValidTimeSeries(result);
              if (valid) {
                for (let row of result) {
                  const update = await collection.findOneAndUpdate(
                    { Lat: row["Lat"], Long: row["Long"] },
                    { $set: row }
                  );
                  if (!update.value) {
                    await collection.insertOne(row);
                  }
                }
                res.status(200).send("Upload Successful");
              } else {
                res.status(422).send("Invalid file contents");
              }
            })
            .catch((error) => {
              res.status(422).send("Invalid file contents");
            });
        } else {
          const collection = db.collection(req.params.data_type);
          read(req.file.path)
            .then(async (result) => {
              const valid = checkValidTimeSeries(result);
              if (valid) {
                await collection.insertMany(result);
                res.status(200).send("Upload Successful");
              } else {
                res.status(422).send("Invalid file contents");
              }
            })
            .catch((error) => {
              res.send(400).send(error);
            });
        }
      } catch (error) {
        res.status(400).send(error);
      }
    }
    
  }
);

app.get("/time_series/:timeseries_name/:data_type", async (req, res) => {
  try {
    await client.connect();
    console.log("Connected successfully to server - get");
    const db = client.db(req.params.timeseries_name);

    const query_params = {};

    if (req.query["countries"]) {
      Array.isArray(req.query["countries"])
        ? (query_params["Country/Region"] = { $in: req.query["countries"] })
        : (query_params["Country/Region"] = req.query["countries"]);
    }

    if (req.query["regions"]) {
      Array.isArray(req.query["regions"])
        ? (query_params["Province/State"] = { $in: req.query["regions"] })
        : (query_params["Province/State"] = req.query["regions"]);
    }

    let results = null;
    let collection = null;
    if (req.params.data_type !== "active") {
      //non-active data is stored in the database
      collection = db.collection(req.params.data_type);
      results = await collection.find(query_params).project({_id: 0}).toArray();
      results = dateFilter(results, req.query["start_date"], req.query["end_date"]);
    } else {
      //we must calculate the values of active from confirmed, recovered and deaths
      collection = db.collection("confirmed");
      let confirmed_results = await collection.find(query_params).project({_id: 0}).toArray();
      confirmed_results = dateFilter(
        confirmed_results,
        req.query["start_date"],
        req.query["end_date"]
      );
      collection = db.collection("deaths");
      let deaths_results = await collection.find(query_params).project({_id: 0}).toArray();
      deaths_results = dateFilter(
        deaths_results,
        req.query["start_date"],
        req.query["end_date"]
      );
      collection = db.collection("recovered");
      let recovered_results = await collection.find(query_params).project({_id: 0}).toArray();
      recovered_results = dateFilter(recovered_results);
      results = calculateActive(
        confirmed_results,
        deaths_results,
        recovered_results
      );
    }

    if (req.query.format === "json") {
      res.send(results);
    } else {
      const filePath = `/temp/CSVOutput/time_series/${
        req.params.timeseries_name + "_" + req.params.data_type
      }.csv`;
      write(results, filePath).then(() => {
        res.type("text/csv");
        res.sendFile(path.join(__dirname, filePath));
      });
    }
  } catch (error) {
    // console.log(error);
    res.status(400).send("Malformed Request");
  }
});

app.delete("/time_series/:timeseries_name", async (req, res) => {
  try {
    await client.connect();
    console.log("Connected successfully to server - delete");
    const db = client.db(req.params.timeseries_name);
    const collections = await (
      await db.listCollections().toArray()
    ).map((c) => c.name);
    if (collections.length === 0) {
      console.log("timeseries not found");
      db.dropDatabase();
      res.status(404).send("Timeseries not found");
    } else {
      db.dropDatabase();
      res.status(200).send("Successfully deleted");
    }
  } catch (error) {
    console.log(error);
    res.status(404).send("Timeseries not found");
  }
});

app.post("/daily_reports/:dailyreport_name", upload.single("file"), async (req, res) => {
    if (! req.file ) {
      res.status(422).send("Invalid file contents");
    } else {
      try {
        await client.connect();
        console.log("Connected successfully to server - post");
        const db = client.db("daily_reports");
  
        const collections = (await db.listCollections().toArray()).map(
          (c) => c.name
        );
  
        if (collections.includes(req.params.dailyreport_name)) {
          const collection = db.collection(req.params.dailyreport_name);
          read(req.file.path)
            .then(async (result) => {
              const results = removeExtraneousFields(result);
              const valid = checkValidDailyReport(results);
              if (valid) {
                for (let row of results) {
                  const update = await collection.findOneAndUpdate(
                    { Combined_Key: row["Combined_Key"] },
                    { $set: row }
                  );
                  if (!update.value) {
                    await collection.insertOne(row);
                  }
                }
                res.status(200).send("Upload Successful");
              } else {
                res.status(422).send("Invalid file contents");
              }
            })
            .catch((error) => {
              res.status(400).send("Malformed Request");
            });
        } else {
          const collection = db.collection(req.params.dailyreport_name);
          read(req.file.path)
            .then(async (result) => {
              const results = removeExtraneousFields(result);
              const valid = checkValidDailyReport(results);
              if (valid) {
                await collection.insertMany(results);
                res.status(200).send("Upload Successful");
              } else {
                res.status(422).send("Invalid file contents");
              }
            })
            .catch((error) => {
              res.status(400).send("Malformed Request");
            });
        }
      } catch (error) {
        // console.log(error);
        res.status(400).send("Malformed Request");
      }
    }
    
  }
);

app.delete("/daily_reports/:dailyreport_name", async (req, res) => {
  try {
    await client.connect();
    const db = client.db("daily_reports");

    const collections = await (
      await db.listCollections().toArray()
    ).map((c) => c.name);

    if (!collections) {
      res.status(404).send("Daily Report not found");
    }

    if (collections.includes(req.params.dailyreport_name)) {
      db.dropCollection(req.params.dailyreport_name);
      res.status(200).send("Successfully Deleted");
    } else {
      res.status(404).send("Daily Report not found");
    }
  } catch (error) {
    console.log(error);
    res.status(404).send("Daily Report not found");
  }
});

app.get("/daily_reports/:dailyreport_name", async (req, res) => {
  try {
    await client.connect();
    console.log("Connected successfully to server - get");
    const db = client.db("daily_reports");

    const query_params = {};
    const projectParams = { _id: 0 };

    if (req.query["combined_key"]) {
      query_params["Combined_Key"] = req.query["combined_key"];
    }

    if (req.query["countries"]) {
      Array.isArray(req.query["countries"])
        ? (query_params["Country_Region"] = { $in: req.query["countries"] })
        : (query_params["Country_Region"] = req.query["countries"]);
    }

    if (req.query["regions"]) {
      Array.isArray(req.query["regions"])
        ? (query_params["Province_State"] = { $in: req.query["regions"] })
        : (query_params["Province_State"] = req.query["regions"]);
    }

    if (req.query["data_type"]) {
      const dataTypes = ["Recovered", "Confirmed", "Deaths", "Active"];

      if (Array.isArray(req.query["data_type"])) {
        const filtered = dataTypes.filter(
          (t) => !req.query["data_type"].includes(t.toLowerCase())
        );
        for (let data_type of filtered) {
          projectParams[data_type] = 0;
        }
      } else {
        const filtered = dataTypes.filter(
          (t) => t.toLowerCase() !== req.query["data_type"]
        );
        for (let data_type of filtered) {
          projectParams[data_type] = 0;
        }
      }
    }

    const collection = db.collection(req.params.dailyreport_name);

    let results = await collection
      .find(query_params)
      .project(projectParams)
      .toArray();

    results = dateFilterV2(results, req.query["start_date"], req.query["end_date"]);

    if (req.query.format === "json") {
      res.send(results);
    } else {
      const filePath = `/temp/CSVOutput/daily_reports/${req.params.dailyreport_name}.csv`;
      write(results, filePath).then(() => {
        res.type("text/csv");
        res.sendFile(path.join(__dirname, filePath));
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("Malformed Request");
  }
});

//PORT
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

module.exports = app