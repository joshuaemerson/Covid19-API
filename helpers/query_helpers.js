const dateFilter = (results, start, end) => {
  const resultCopy = JSON.parse(JSON.stringify(results))
    const nonDateFields = [
      "Province/State",
      "Country/Region",
      "Lat",
      "Long",
    ];
    for (let r of resultCopy) {
      const dates = Object.keys(r).filter((k) => !nonDateFields.includes(k));
      if (start) {
        const startDate = new Date(start);
        for (let k of dates) {
          const keyDate = new Date(k);
          if (keyDate < startDate) {
            delete r[k];
          }
        }
      }
      if (end) {
        const endDate = new Date(end);
        for (let k of dates) {
          const keyDate = new Date(k);
          if (keyDate > endDate) {
            delete r[k];
          }
        }
      }
    }
    return resultCopy
  };
  
  const dateFilterV2 = (results, start, end) => {
    const resultCopy = JSON.parse(JSON.stringify(results))
    for (let i = 0; i < resultCopy.length; i++) {
      const date = resultCopy[i].Last_Update;
      if (start) {
        const startDate = new Date(start);
        const keyDate = new Date(date);
        if (keyDate < startDate) {
          delete resultCopy[i];
        }
      }
      if (end) {
        const endDate = new Date(end);
        const keyDate = new Date(date);
        if (keyDate > endDate) {
          delete resultCopy[i];
        }
      }
    }
    
    return resultCopy.filter( r => r )
  };
  
  const calculateActive = (confirmed, deaths, recovered) => {
    const nonDateFields = [
      "Province/State",
      "Country/Region",
      "Lat",
      "Long",
    ];
    if (
      confirmed.length !== deaths.length ||
      confirmed.length !== recovered.length
    ) {
      return [];
    }
    const results = [];
    for (let i = 0; i < confirmed.length; i++) {
      const newRow = {};
      for (let field of nonDateFields) {
        newRow[field] = confirmed[i][field];
      }
      const dates = Object.keys(confirmed[i]).filter(
        (k) => !nonDateFields.includes(k)
      );
      for (let date of dates) {
        newRow[date] =
          parseInt(confirmed[i][date]) -
          parseInt(deaths[i][date]) -
          parseInt(recovered[i][date]);
      }
      results.push(newRow);
    }
  
    return results;
  };
  
  const removeExtraneousFields = (results) => {
    const resultCopy = JSON.parse(JSON.stringify(results))
    const extraneousFields = [
      "FIPS",
      "Admin2",
      "Incident_Rate",
      "Case_Fatality_Ratio",
    ];
    for (let row of resultCopy) {
      for (let field of extraneousFields) {
        delete row[field];
      }
    }
    return resultCopy
  };

module.exports = {dateFilter, dateFilterV2, calculateActive, removeExtraneousFields}