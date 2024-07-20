const request = require("supertest");
const app = require("../app");
const assert = require('assert');
const path = require("path");

const {read} = require("../helpers/read_write.js");
const {checkValidTimeSeries, checkValidDailyReport} = require("../helpers/file_format_checkers.js")
const {dateFilter, dateFilterV2, calculateActive, removeExtraneousFields} = require("../helpers/query_helpers");

/*Below are the arrays/objects we use as expected results from our functions, the tests begin at line 853 */ 


//original
const dateTest = [
    {
        "Province/State": "",
        "Country/Region": "Rack City",
        "Lat": "33",
        "Long": "66",
        "1/22/20": "0",
        "1/23/20": "0",
        "1/24/20": "0",
        "1/25/20": "0"
    },
    {
        "Province/State": "",
        "Country/Region": "Bikini Bottom",
        "Lat": "25",
        "Long": "25",
        "1/22/20": "0",
        "1/23/20": "0",
        "1/24/20": "9",
        "1/25/20": "10"
    }
]

const dateTestStartFilter = [
    {
        "Province/State": "",
        "Country/Region": "Rack City",
        "Lat": "33",
        "Long": "66",
        "1/23/20": "0",
        "1/24/20": "0",
        "1/25/20": "0"
    },
    {
        "Province/State": "",
        "Country/Region": "Bikini Bottom",
        "Lat": "25",
        "Long": "25",
        "1/23/20": "0",
        "1/24/20": "9",
        "1/25/20": "10"
    }
]

const dateTestEndFilter = [
    {
        "Province/State": "",
        "Country/Region": "Rack City",
        "Lat": "33",
        "Long": "66",
        "1/22/20": "0",
        "1/23/20": "0",
    },
    {
        "Province/State": "",
        "Country/Region": "Bikini Bottom",
        "Lat": "25",
        "Long": "25",
        "1/22/20": "0",
        "1/23/20": "0",
    }
]
const dateTestStartEnd = [
    {
        "Province/State": "",
        "Country/Region": "Rack City",
        "Lat": "33",
        "Long": "66",
        "1/23/20": "0",
        "1/24/20": "0",
    },
    {
        "Province/State": "",
        "Country/Region": "Bikini Bottom",
        "Lat": "25",
        "Long": "25",
        "1/23/20": "0",
        "1/24/20": "9",
    }
]

const dateTest2 = [
    {
        "Province_State": "",
        "Country_Region": "Portland",
        "Last_Update": "2021-01-01 05:22:33",
        "Lat": "33.93911",
        "Long_": "67.709953",
        "Confirmed": "52513",
        "Deaths": "2201",
        "Recovered": "41727",
        "Active": "8585",
        "Combined_Key": "Portland"
    },
    {
        "Province_State": "Diamond Princess",
        "Country_Region": "Canada",
        "Last_Update": "2020-12-21 13:27:30",
        "Lat": "",
        "Long_": "",
        "Confirmed": "0",
        "Deaths": "1",
        "Recovered": "0",
        "Active": "0",
        "Combined_Key": "Diamond Princess, Canada"
    },
    {
        "Province_State": "",
        "Country_Region": "Algeria",
        "Last_Update": "2021-01-02 05:22:33",
        "Lat": "28.0339",
        "Long_": "1.6596",
        "Confirmed": "99897",
        "Deaths": "2762",
        "Recovered": "67395",
        "Active": "29740",
        "Combined_Key": "Algeria"
    }
]
const dateTest2Start = [
    {
        "Province_State": "",
        "Country_Region": "Portland",
        "Last_Update": "2021-01-01 05:22:33",
        "Lat": "33.93911",
        "Long_": "67.709953",
        "Confirmed": "52513",
        "Deaths": "2201",
        "Recovered": "41727",
        "Active": "8585",
        "Combined_Key": "Portland"
    },
    {
        "Province_State": "",
        "Country_Region": "Algeria",
        "Last_Update": "2021-01-02 05:22:33",
        "Lat": "28.0339",
        "Long_": "1.6596",
        "Confirmed": "99897",
        "Deaths": "2762",
        "Recovered": "67395",
        "Active": "29740",
        "Combined_Key": "Algeria"
    }
]

const dateTest2End = [
    {
        "Province_State": "Diamond Princess",
        "Country_Region": "Canada",
        "Last_Update": "2020-12-21 13:27:30",
        "Lat": "",
        "Long_": "",
        "Confirmed": "0",
        "Deaths": "1",
        "Recovered": "0",
        "Active": "0",
        "Combined_Key": "Diamond Princess, Canada"
    }
]

const dateTest2StartEnd = [
    {
        "Province_State": "",
        "Country_Region": "Portland",
        "Last_Update": "2021-01-01 05:22:33",
        "Lat": "33.93911",
        "Long_": "67.709953",
        "Confirmed": "52513",
        "Deaths": "2201",
        "Recovered": "41727",
        "Active": "8585",
        "Combined_Key": "Portland"
    }
]

const confirmed = [
    {
        "Province/State": "",
        "Country/Region": "Rack City",
        "Lat": "33",
        "Long": "66",
        "1/22/20": "5",
        "1/23/20": "10",
        "1/24/20": "12",
        "1/25/20": "40"
    },
    {
        "Province/State": "",
        "Country/Region": "Bikini Bottom",
        "Lat": "25",
        "Long": "25",
        "1/22/20": "50",
        "1/23/20": "20",
        "1/24/20": "9",
        "1/25/20": "10"
    }
]

const recovered = [
    {
        "Province/State": "",
        "Country/Region": "Rack City",
        "Lat": "33",
        "Long": "66",
        "1/22/20": "0",
        "1/23/20": "2",
        "1/24/20": "6",
        "1/25/20": "23"
    },
    {
        "Province/State": "",
        "Country/Region": "Bikini Bottom",
        "Lat": "25",
        "Long": "25",
        "1/22/20": "15",
        "1/23/20": "5",
        "1/24/20": "3",
        "1/25/20": "2"
    }
]

const deaths = [
    {
        "Province/State": "",
        "Country/Region": "Rack City",
        "Lat": "33",
        "Long": "66",
        "1/22/20": "2",
        "1/23/20": "3",
        "1/24/20": "4",
        "1/25/20": "7"
    },
    {
        "Province/State": "",
        "Country/Region": "Bikini Bottom",
        "Lat": "25",
        "Long": "25",
        "1/22/20": "5",
        "1/23/20": "5",
        "1/24/20": "2",
        "1/25/20": "1"
    }
]

const active = [
    {
        "Province/State": "",
        "Country/Region": "Rack City",
        "Lat": "33",
        "Long": "66",
        "1/22/20": 3,
        "1/23/20": 5,
        "1/24/20": 2,
        "1/25/20": 10
    },
    {
        "Province/State": "",
        "Country/Region": "Bikini Bottom",
        "Lat": "25",
        "Long": "25",
        "1/22/20": 30,
        "1/23/20": 10,
        "1/24/20": 4,
        "1/25/20": 7
    }
]

const removeExtraneousFieldsTest = [
    {
        "FIPS": "",
        "Admin2": "",
        "Province_State": "",
        "Country_Region": "Portland",
        "Last_Update": "2021-01-01 05:22:33",
        "Lat": "33.93911",
        "Long_": "67.709953",
        "Confirmed": "52513",
        "Deaths": "2201",
        "Recovered": "41727",
        "Active": "8585",
        "Combined_Key": "Portland",
        "Incident_Rate": "134.123",
        "Case_Fatality_Ratio": "223.40"
    },
    {
        "FIPS": "",
        "Admin2": "",
        "Province_State": "",
        "Country_Region": "Algeria",
        "Last_Update": "2021-01-02 05:22:33",
        "Lat": "28.0339",
        "Long_": "1.6596",
        "Confirmed": "99897",
        "Deaths": "2762",
        "Recovered": "67395",
        "Active": "29740",
        "Combined_Key": "Algeria",
        "Incident_Rate": "134.123",
        "Case_Fatality_Ratio": "223.40"
    }
]

const expectedReadResults = [
    {
        "Province/State": "",
        "Country/Region": "Afghanistan",
        "Lat": "33.93911",
        "Long": "67.709953",
        "1/22/20": "0",
        "1/23/20": "0"
    },
    {
        "Province/State": "Ontario",
        "Country/Region": "Canada",
        "Lat": "51.2538",
        "Long": "-85.3232",
        "1/22/20": "0",
        "1/23/20": "2"
    }
]

const invalidTimeSeries = [
    {
        "Province/State": "",
        "Country/Region": "Afghanistan",
        "Lat": "33.93911",
        "Long": "67.709953",
        "1/22/20": "0",
        "1/23/20": "0"
    },
    {
        "Province/State": "Ontario",
        "Country/Region": "Canada",
        "Lat": "51.2538",
        "Long": "-85.3232",
        "1/22/20": "dog",
        "1/23/20": "2"
    }
]

const invalidDailyReport = [
    {
        "Province_State": "",
        "Country_Region": "Portland",
        "Last_Update": "2021-01-01 05:22:33",
        "Lat": "33.93911",
        "Long_": "67.709953",
        "Confirmed": "52513",
        "Deaths": "2201",
        "Recovered": "41727",
        "Active": "8585",
        "Combined_Key": "Portland"
    },
    {
        "Province_State": "",
        "Country_Region": "Algeria",
        "Last_Update": "2021-01-46 05:22:33",
        "Lat": "28.0339",
        "Long_": "1.6596",
        "Confirmed": "99897",
        "Deaths": "2762",
        "Recovered": "67395",
        "Active": "29740",
        "Combined_Key": "Algeria"
    }
]

const afganEndDates = [
    {
        "Province/State": "",
        "Country/Region": "Afghanistan",
        "Lat": "33.93911",
        "Long": "67.709953",
        "1/22/20": "0",
        "1/23/20": "0"
    }
]

const afganStartEndDates = [
    {
        "Province/State": "",
        "Country/Region": "Afghanistan",
        "Lat": "33.93911",
        "Long": "67.709953",
        "1/22/21": "54483",
        "1/23/21": "54559",
        "1/24/21": "54595",
        "1/25/21": "54672",
        "1/26/21": "54750"
    }
]

const twoCountries = [
    {
        "Province/State": "",
        "Country/Region": "Afghanistan",
        "Lat": "33.93911",
        "Long": "67.709953",
        "1/22/21": "54483",
        "1/23/21": "54559",
        "1/24/21": "54595",
        "1/25/21": "54672",
        "1/26/21": "54750"
    },
    {
        "Province/State": "",
        "Country/Region": "Albania",
        "Lat": "41.1533",
        "Long": "20.1683",
        "1/22/21": "70655",
        "1/23/21": "71441",
        "1/24/21": "72274",
        "1/25/21": "72812",
        "1/26/21": "73691"
    }
]

const countryRegion = [
    {
        "Province/State": "Ontario",
        "Country/Region": "Canada",
        "Lat": "51.2538",
        "Long": "-85.3232",
        "1/22/21": "255955",
        "1/23/21": "257847",
        "1/24/21": "259644",
        "1/25/21": "261311",
        "1/26/21": "263219"
    }
]

const afghanActiveEndDates = [
    {
        "Province/State": "",
        "Country/Region": "Afghanistan",
        "Lat": "33.93911",
        "Long": "67.709953",
        "1/22/20": 0,
        "1/23/20": 0
    }
]

const afghanActiveStartEndDates = [
    {
        "Province/State": "",
        "Country/Region": "Afghanistan",
        "Lat": "33.93911",
        "Long": "67.709953",
        "1/22/21": 5201,
        "1/23/21": 5243,
        "1/24/21": 4919,
        "1/25/21": 4922,
        "1/26/21": 4902
    }
]

const twoCountriesActive = [
    {
        "Province/State": "",
        "Country/Region": "Afghanistan",
        "Lat": "33.93911",
        "Long": "67.709953",
        "1/22/21": 5201,
        "1/23/21": 5243,
        "1/24/21": 4919,
        "1/25/21": 4922,
        "1/26/21": 4902
    },
    {
        "Province/State": "",
        "Country/Region": "Albania",
        "Lat": "41.1533",
        "Long": "20.1683",
        "1/22/21": 26457,
        "1/23/21": 26747,
        "1/24/21": 27069,
        "1/25/21": 27197,
        "1/26/21": 27479
    }
]

const countryRegionActive = [
    {
        "Province/State": "Victoria",
        "Country/Region": "Australia",
        "Lat": "-37.8136",
        "Long": "144.9631",
        "1/22/21": 33,
        "1/23/21": 30,
        "1/24/21": 31,
        "1/25/21": 31,
        "1/26/21": 31
    }
]

const dailyOneCountry = [
    {
        "Province_State": "Faroe Islands",
        "Country_Region": "Denmark",
        "Last_Update": "2021-01-02 05:22:33",
        "Lat": "61.8926",
        "Long_": "-6.9118",
        "Confirmed": "610",
        "Deaths": "0",
        "Recovered": "551",
        "Active": "59",
        "Combined_Key": "Faroe Islands, Denmark"
    },
    {
        "Province_State": "Greenland",
        "Country_Region": "Denmark",
        "Last_Update": "2021-01-02 05:22:33",
        "Lat": "71.7069",
        "Long_": "-42.6043",
        "Confirmed": "27",
        "Deaths": "0",
        "Recovered": "21",
        "Active": "6",
        "Combined_Key": "Greenland, Denmark"
    },
    {
        "Province_State": "",
        "Country_Region": "Denmark",
        "Last_Update": "2021-01-02 05:22:33",
        "Lat": "56.2639",
        "Long_": "9.5018",
        "Confirmed": "165930",
        "Deaths": "1322",
        "Recovered": "130818",
        "Active": "33790",
        "Combined_Key": "Denmark"
    }
]

const dailyOneCountryTwoRegions = [
    {
        "Province_State": "Alberta",
        "Country_Region": "Canada",
        "Last_Update": "2021-01-02 05:22:33",
        "Lat": "53.9333",
        "Long_": "-116.5765",
        "Confirmed": "100428",
        "Deaths": "1046",
        "Recovered": "84827",
        "Active": "14555",
        "Combined_Key": "Alberta, Canada"
    },
    {
        "Province_State": "Ontario",
        "Country_Region": "Canada",
        "Last_Update": "2021-01-02 05:22:33",
        "Lat": "51.2538",
        "Long_": "-85.3232",
        "Confirmed": "192482",
        "Deaths": "5526",
        "Recovered": "162622",
        "Active": "20154",
        "Combined_Key": "Ontario, Canada"
    }
]

const dailyTwoCountries = [
    {
        "Province_State": "",
        "Country_Region": "Afghanistan",
        "Last_Update": "2021-01-02 05:22:33",
        "Lat": "33.93911",
        "Long_": "67.709953",
        "Confirmed": "52513",
        "Deaths": "2201",
        "Recovered": "41727",
        "Active": "8585",
        "Combined_Key": "Afghanistan"
    },
    {
        "Province_State": "",
        "Country_Region": "Albania",
        "Last_Update": "2021-01-02 05:22:33",
        "Lat": "41.1533",
        "Long_": "20.1683",
        "Confirmed": "58316",
        "Deaths": "1181",
        "Recovered": "33634",
        "Active": "23501",
        "Combined_Key": "Albania"
    }
]

const dailyCombinedKey = [
    {
        "Province_State": "Brussels",
        "Country_Region": "Belgium",
        "Last_Update": "2021-01-02 05:22:33",
        "Lat": "50.8503",
        "Long_": "4.3517",
        "Confirmed": "81557",
        "Deaths": "0",
        "Recovered": "0",
        "Active": "81557",
        "Combined_Key": "Brussels, Belgium"
    }
]

const dailyEndDates = [
    {
        "Province_State": "Diamond Princess",
        "Country_Region": "Canada",
        "Last_Update": "2020-12-21 13:27:30",
        "Lat": "",
        "Long_": "",
        "Confirmed": "0",
        "Deaths": "1",
        "Recovered": "0",
        "Active": "0",
        "Combined_Key": "Diamond Princess, Canada"
    },
    {
        "Province_State": "Grand Princess",
        "Country_Region": "Canada",
        "Last_Update": "2020-12-21 13:27:30",
        "Lat": "",
        "Long_": "",
        "Confirmed": "13",
        "Deaths": "0",
        "Recovered": "13",
        "Active": "0",
        "Combined_Key": "Grand Princess, Canada"
    },
    {
        "Province_State": "Alabama",
        "Country_Region": "US",
        "Last_Update": "2020-12-21 13:27:30",
        "Lat": "",
        "Long_": "",
        "Confirmed": "0",
        "Deaths": "0",
        "Recovered": "0",
        "Active": "0",
        "Combined_Key": "Out of AL, Alabama, US"
    },
    {
        "Province_State": "Alabama",
        "Country_Region": "US",
        "Last_Update": "2020-12-21 13:27:30",
        "Lat": "",
        "Long_": "",
        "Confirmed": "0",
        "Deaths": "0",
        "Recovered": "0",
        "Active": "0",
        "Combined_Key": "Unassigned, Alabama, US"
    },
    {
        "Province_State": "Diamond Princess",
        "Country_Region": "US",
        "Last_Update": "2020-08-04 02:27:56",
        "Lat": "",
        "Long_": "",
        "Confirmed": "49",
        "Deaths": "0",
        "Recovered": "0",
        "Active": "49",
        "Combined_Key": "Diamond Princess, US"
    },
    {
        "Province_State": "Grand Princess",
        "Country_Region": "US",
        "Last_Update": "2020-08-04 02:27:56",
        "Lat": "",
        "Long_": "",
        "Confirmed": "103",
        "Deaths": "3",
        "Recovered": "0",
        "Active": "100",
        "Combined_Key": "Grand Princess, US"
    },
    {
        "Province_State": "Hawaii",
        "Country_Region": "US",
        "Last_Update": "2020-12-21 13:27:30",
        "Lat": "",
        "Long_": "",
        "Confirmed": "661",
        "Deaths": "2",
        "Recovered": "0",
        "Active": "659",
        "Combined_Key": "Out of HI, Hawaii, US"
    },
    {
        "Province_State": "Hawaii",
        "Country_Region": "US",
        "Last_Update": "2020-12-21 13:27:30",
        "Lat": "",
        "Long_": "",
        "Confirmed": "0",
        "Deaths": "0",
        "Recovered": "0",
        "Active": "0",
        "Combined_Key": "Unassigned, Hawaii, US"
    },
    {
        "Province_State": "Kentucky",
        "Country_Region": "US",
        "Last_Update": "2020-12-21 13:27:30",
        "Lat": "",
        "Long_": "",
        "Confirmed": "0",
        "Deaths": "0",
        "Recovered": "0",
        "Active": "0",
        "Combined_Key": "Unassigned, Kentucky, US"
    },
    {
        "Province_State": "Maine",
        "Country_Region": "US",
        "Last_Update": "2020-08-07 22:34:20",
        "Lat": "",
        "Long_": "",
        "Confirmed": "0",
        "Deaths": "0",
        "Recovered": "0",
        "Active": "0",
        "Combined_Key": "Out of ME, Maine, US"
    },
    {
        "Province_State": "Missouri",
        "Country_Region": "US",
        "Last_Update": "2020-12-29 23:22:37",
        "Lat": "40.36079813",
        "Long_": "-94.88133008",
        "Confirmed": "2286",
        "Deaths": "18",
        "Recovered": "0",
        "Active": "2268",
        "Combined_Key": "Nodaway, Missouri, US"
    },
    {
        "Province_State": "Montana",
        "Country_Region": "US",
        "Last_Update": "2020-12-21 13:27:30",
        "Lat": "",
        "Long_": "",
        "Confirmed": "0",
        "Deaths": "0",
        "Recovered": "0",
        "Active": "0",
        "Combined_Key": "Unassigned, Montana, US"
    },
    {
        "Province_State": "Oregon",
        "Country_Region": "US",
        "Last_Update": "2020-12-21 13:27:30",
        "Lat": "",
        "Long_": "",
        "Confirmed": "0",
        "Deaths": "0",
        "Recovered": "0",
        "Active": "0",
        "Combined_Key": "Unassigned, Oregon, US"
    },
    {
        "Province_State": "Virginia",
        "Country_Region": "US",
        "Last_Update": "2020-12-21 13:27:30",
        "Lat": "",
        "Long_": "",
        "Confirmed": "0",
        "Deaths": "0",
        "Recovered": "0",
        "Active": "0",
        "Combined_Key": "Unassigned, Virginia, US"
    }
]

const dailyDeaths = [
    {
        "Province_State": "Faroe Islands",
        "Country_Region": "Denmark",
        "Last_Update": "2021-01-02 05:22:33",
        "Lat": "61.8926",
        "Long_": "-6.9118",
        "Deaths": "0",
        "Combined_Key": "Faroe Islands, Denmark"
    },
    {
        "Province_State": "Greenland",
        "Country_Region": "Denmark",
        "Last_Update": "2021-01-02 05:22:33",
        "Lat": "71.7069",
        "Long_": "-42.6043",
        "Deaths": "0",
        "Combined_Key": "Greenland, Denmark"
    },
    {
        "Province_State": "",
        "Country_Region": "Denmark",
        "Last_Update": "2021-01-02 05:22:33",
        "Lat": "56.2639",
        "Long_": "9.5018",
        "Deaths": "1322",
        "Combined_Key": "Denmark"
    }
]

const dailyTwoData = [
    {
        "Province_State": "Faroe Islands",
        "Country_Region": "Denmark",
        "Last_Update": "2021-01-02 05:22:33",
        "Lat": "61.8926",
        "Long_": "-6.9118",
        "Deaths": "0",
        "Recovered": "551",
        "Combined_Key": "Faroe Islands, Denmark"
    },
    {
        "Province_State": "Greenland",
        "Country_Region": "Denmark",
        "Last_Update": "2021-01-02 05:22:33",
        "Lat": "71.7069",
        "Long_": "-42.6043",
        "Deaths": "0",
        "Recovered": "21",
        "Combined_Key": "Greenland, Denmark"
    },
    {
        "Province_State": "",
        "Country_Region": "Denmark",
        "Last_Update": "2021-01-02 05:22:33",
        "Lat": "56.2639",
        "Long_": "9.5018",
        "Deaths": "1322",
        "Recovered": "130818",
        "Combined_Key": "Denmark"
    }
]


describe("query_helpers", () => {
    describe("dateFilter", () => {
        describe("dateFilter no start and end", () => {
            it("should not mutate the results array when no start and finish arguments are provided", () => {
                assert.deepStrictEqual(dateTest, dateFilter(dateTest, null, null));
            })
        })
        describe("dateFilter only start", () => {
            it("should remove all keys with dates before '1/23/20'", () => {
                assert.deepStrictEqual(dateTestStartFilter, dateFilter(dateTest, '1/23/20', null));
            })
        })
        describe("dateFilter only end", () => {
            it("should remove all keys with dates after '1/23/20'", () => {
                assert.deepStrictEqual(dateTestEndFilter, dateFilter(dateTest, null, '1/23/20'));
            })
        })
        describe("dateFilter start and end", () => {
            it("should remove all keys with dates before '1/23/20' and after '1/24/20'", () => {
                assert.deepStrictEqual(dateTestStartEnd, dateFilter(dateTest, '1/23/20', '1/24/20'));
            })
        })
    })
    describe("dateFilterV2", () => {
        describe("dateFilterV2 no start and end", () => {
            it("should not mutate the results array when no start and finish arguments are provided", () => {
                assert.deepStrictEqual(dateTest2, dateFilterV2(dateTest2, null, null));
            })
        })
        describe("dateFilterV2 only start", () => {
            it("should remove all objects with last update before '1/1/21'", () => {
                assert.deepStrictEqual(dateTest2Start, dateFilterV2(dateTest2, '1/1/21', null));
            })
        })
        describe("dateFilterV2 only end", () => {
            it("should remove all objects with dates after '1/1/21'", () => {
                assert.deepStrictEqual(dateTest2End, dateFilterV2(dateTest2, null, '1/1/21'));
            })
        })
        describe("dateFilterV2 start and end", () => {
            it("should remove all objects with dates before '12/30/20' and after '1/2/21'", () => {
                assert.deepStrictEqual(dateTest2StartEnd, dateFilterV2(dateTest2, '12/30/20', '1/2/21'));
            })
        })
    })

    describe("calculateActive", () => {
        describe("calculateActive when parameters are not the same size", () => {
            it("should return the empty array []", () => {
                assert.deepStrictEqual([], calculateActive(confirmed, [], deaths))
            })
        })
        describe("calculateActive when parameters are the same size", () => {
            it("should create a new array of objects with keys equal to each object in confirmed, recovered and deaths with values equal to confirmed-recovered-deaths", () => {
                assert.deepStrictEqual(active, calculateActive(confirmed, recovered, deaths))
            })
        })
    })

    describe("removeExtraneousFields", () => {
        describe("removeExtraneousFields given an array of objects containing the extra keys we wish to remove", () => {
            it("should delete the key/value pairs for each of the following keys: FIPS, ADMIN2, Incident_Rate, Case_Fatality_Ratio", () => {
                assert.deepStrictEqual(dateTest2Start, removeExtraneousFields(removeExtraneousFieldsTest))
            })
        })
    })
})

describe("read_write", () => {
    describe("read", () => {
        describe("test read given a valid path", () => {
            it("should return a list of objects representing the data in 'temp/TestCSV/readTest.csv'", async () => {
                const results = await read(path.join(__dirname, 'TestCSV/readTest.csv'))
                assert.deepStrictEqual(results, expectedReadResults)
            })
        })
    })
})

describe("file_format_checkers", () => {
    describe("checkValidTimeSeries", () => { //note we check the validity of the documents after they are parsed into json
        describe("checkValidTimeSeries given a parsed array of JSON object representing a valid timeseries report", () => {
            it("should report that the timeseries report represented by the argument is valid", () => {
                assert.deepStrictEqual(checkValidTimeSeries(dateTest), true)
            })
        }) 
        describe("checkValidTimeSeries given a parsed array of JSON objects representing an invalid timeseries report", () => {
            it("should report that the timeseries report represented by the argument is invalid", () => {
                assert.deepStrictEqual(checkValidTimeSeries(invalidTimeSeries), false)
            })
        })
    })
    describe("checkValidDailyReport", () => { //note we check the validity of the documents after they are parsed into json
        describe("checkValidDailyReport given a parsed array of JSON object representing a valid daily report", () => {
            it("should report that the daily report represented by the argument is valid", () => {
                assert.deepStrictEqual(checkValidDailyReport(dateTest2), true)
            })
        }) 
        describe("checkValidDailyReport given a parsed array of JSON objects representing an invalid daily report", () => {
            it("should report that the daily report represented by the argument is invalid", () => {
                assert.deepStrictEqual(checkValidDailyReport(invalidDailyReport), false)
            })
        })
    })
})

describe("TimeSeries", () => {
    describe("GET /timeseries", () => {
        describe("GET /timeseries/TEST/confirmed", () => { //note confirmed, deaths, and recovered all work the same way so only need to test one of them
            describe("GET /timeseries/TEST/confirmed/ single country w/ end_date and format json", () => {
                it("responds with afghanEndDates", (done) => {
                    request(app).get("/time_series/TEST/confirmed?countries=Afghanistan&end_date=1/23/20&format=json")
                    .expect(afganEndDates, done);
                })
            })
            describe("GET /timeseries/TEST/confirmed/ single country w/ start and end_date and format json", () => {
                it("responds with afghanStartEndDates", (done) => {
                    request(app).get("/time_series/TEST/confirmed?countries=Afghanistan&start_date=1/22/21&end_date=1/26/21&format=json")
                    .expect(afganStartEndDates, done);
                })
            })
            describe("GET /timeseries/TEST/confirmed/ multiple countries w/ start and end_date and format json", () => {
                it("responds with twoCountries", (done) => {
                    request(app).get("/time_series/TEST/confirmed?countries=Albania&countries=Afghanistan&start_date=1/22/21&end_date=1/26/21&format=json")
                    .expect(twoCountries, done)
                })
            })
            describe("GET /timeseries/TEST/confirmed/ one country and region w/ start and end_date and format json", () => {
                it("responds with countryRegion", (done) => {
                    request(app).get("/time_series/TEST/confirmed?countries=Canada&regions=Ontario&start_date=1/22/21&end_date=1/26/21&format=json")
                    .expect(countryRegion, done)
                })
            })
        })
        describe("GET /timeseries/TEST/active", () => { //note confirmed, deaths, and recovered all work the same way so only need to test one of them
            describe("GET /timeseries/TEST/active/ single country w/ end_date and format json", () => {
                it("responds with afghanActiveEndDates", (done) => {
                    request(app).get("/time_series/TEST/active?countries=Afghanistan&end_date=1/23/20&format=json")
                    .expect(afghanActiveEndDates, done);
                })
            })
            describe("GET /timeseries/TEST/active/ single country w/ start and end_date and format json", () => {
                it("responds with afghanActiveStartEndDates", (done) => {
                    request(app).get("/time_series/TEST/active?countries=Afghanistan&start_date=1/22/21&end_date=1/26/21&format=json")
                    .expect(afghanActiveStartEndDates, done);
                })
            })
            describe("GET /timeseries/TEST/active/ multiple countries w/ start and end_date and format json", () => {
                it("responds with twoCountriesActive", (done) => {
                    request(app).get("/time_series/TEST/active?countries=Albania&countries=Afghanistan&start_date=1/22/21&end_date=1/26/21&format=json")
                    .expect(twoCountriesActive, done)
                })
            })
            describe("GET /timeseries/TEST/active/ one country and region w/ start and end_date and format json", () => {
                it("responds with countryRegionActive", (done) => {
                    request(app).get("/time_series/TEST/active?countries=Australia&regions=Victoria&start_date=1/22/21&end_date=1/26/21&format=json")
                    .expect(countryRegionActive, done)
                })
            })
        })
    });
    describe("POST /timeseries", () => { //note this is the only post request we can test as we cannot add a file to the body of the request
        describe("POST /timeseries w/ no file attached", () => {
            it("responds with 422 error code", (done) => {
                request(app).post('/time_series/TEST/confirmed')
                .expect(422, done)
            })
        })
    })

    //note this is the only delete request we can test as otherwise if we delete a valid timeseries on one test, then the next time it would not exist and the test would fail
    describe("DELETE /timeseries", () => { 
        describe("DELETE /timeseries w/ non-existing time_series name", () => {
            it("responds with 404 error code", (done) => {
                request(app).delete('/time_series/DOES_NOT_EXIST')
                .expect(404, done)
            })
        })
    })
})

describe("Daily Reports", () => {
    describe("GET /daily_reports", () => {
        describe("GET /daily_reports/TEST", () => {
            describe("GET /daily_reports/TEST w single country and format json", () => {
                it("responds with data for all regions in Denmark with all data types (active, recovered, confirmed, deaths)", (done) => {
                    request(app).get("/daily_reports/TEST?format=json&countries=Denmark")
                    .expect(dailyOneCountry, done)
                })
            })
            describe("GET /daily_reports/TEST w single country, multiple regions and format json", () => {
                it("responds with data for Ontario and Alberta in Canada with all data types (active, recovered, confirmed, deaths)", (done) => {
                    request(app).get("/daily_reports/TEST?format=json&countries=Canada&regions=Ontario&regions=Alberta")
                    .expect(dailyOneCountryTwoRegions, done)
                })
            })
            describe("GET /daily_reports/TEST w two countries and format json", () => {
                it("responds with data for Afghanistan and Albania with all data types (active, recovered, confirmed, deaths)", (done) => {
                    request(app).get("/daily_reports/TEST?format=json&countries=Afghanistan&countries=Albania")
                    .expect(dailyTwoCountries, done)
                })
            })
            describe("GET /daily_reports/TEST w combined_key and format json", () => {
                it("responds with data for Brussels, Belgium with all data types (active, recovered, confirmed, deaths)", (done) => {
                    request(app).get("/daily_reports/TEST?format=json&combined_key=Brussels, Belgium")
                    .expect(dailyCombinedKey, done)
                })
            })

            //note we only test end_date because start_date works the same and was tested in the dateFilterV2 test
            describe("GET /daily_reports/TEST w end_date and format json", () => {
                it("responds with data for which the last_updated date is before end_date (1/1/21) with all data types (active, recovered, confirmed, deaths)", (done) => {
                    request(app).get("/daily_reports/TEST?format=json&end_date=1/1/21")
                    .expect(dailyEndDates, done)
                })
            })

            describe("GET /daily_reports/TEST w one country and data_type = deaths", () => {
                it("responds with data for all regions in Denmark with all data types = deaths and format json", (done) => {
                    request(app).get("/daily_reports/TEST?format=json&countries=Denmark&data_type=deaths")
                    .expect(dailyDeaths, done)
                })
            })

            describe("GET /daily_reports/TEST w one country and data_type = deaths, recovered", () => {
                it("responds with data for all regions in Denmark with all data types = deaths, recovered and format json", (done) => {
                    request(app).get("/daily_reports/TEST?format=json&countries=Denmark&data_type=deaths&data_type=recovered")
                    .expect(dailyTwoData, done)
                })
            })
        })
    })
    describe("POST /daily_reports", () => { //note this is the only post request we can test as we cannot add a file to the body of the request
        describe("POST /daily_reports w/ no file attached", () => {
            it("responds with 422 error code", (done) => {
                request(app).post('/daily_reports/TEST/')
                .expect(422, done)
            })
        })
    })

    //note this is the only delete request we can test as otherwise if we delete a valid timeseries on one test, then the next time it would not exist and the test would fail
    describe("DELETE /daily_reports", () => { 
        describe("DELETE /daily_reports w/ non-existing daily_reports name", () => {
            it("responds with 404 error code", (done) => {
                request(app).delete('/daily_reports/DOES_NOT_EXIST')
                .expect(404, done)
            })
        })
    })
})

