const checkValidTimeSeries = (result) => {
    for (let row of result) {
      const dates = Object.keys(row).slice(4);
  
      if (dates.length === 0) {
        return false;
      }
  
      if (row["Province/State"] && typeof row["Province/State"] !== "string") {
        return false;
      }
  
      if (
        row["Country/Region"] &&
        typeof row["Country/Region"] === "string" &&
        (row["Lat"] === '' || parseFloat(row["Lat"]) !== NaN) &&
        (row["Long"] === '' || parseFloat(row["Long"]) !== NaN)
      ) {
        for (let date of dates) {
          if (isNaN(parseInt(row[date]))) {
            return false;
          }
        }
      } else {
        return false;
      }
    }
    return true;
  };
  
  const checkValidDailyReport = (result) => {
    for (let row of result) {
      const date = new Date(
        row[Object.keys(row).find((element) => element === "Last_Update")]
      );
  
      if (row["Province_State"] && typeof row["Province_State"] !== "string") {
        return false;
      }
  
      if (
        !(row["Country_Region"] &&
        typeof row["Country_Region"] === "string" &&
        row["Combined_Key"] &&
        typeof row["Combined_Key"] === "string" &&
        (row["Lat"] === '' || parseFloat(row["Lat"]) !== NaN) &&
        (row["Long_"] === '' || parseFloat(row["Long_"]) !== NaN) &&
        row["Confirmed"] &&
        parseInt(row["Confirmed"]) !== NaN &&
        row["Deaths"] &&
        parseInt(row["Deaths"]) !== NaN &&
        row["Recovered"] &&
        parseInt(row["Recovered"]) !== NaN &&
        row["Active"] &&
        parseInt(row["Active"]) !== NaN &&
        date instanceof Date &&
        date.toString() !== "Invalid Date")
      ) {
        return false;
      }
    }
    return true
  };

module.exports = {checkValidTimeSeries, checkValidDailyReport}