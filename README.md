# Covid-19 API (2022)
This repository is for a COVID-19 API built using Express.js and MongoDB. The API contains functionality for uploading COVID data based on both the timeseries and daily-reports formats that are linked below. In addition to the uploading functionality, the API also provides functionality for retrieving COVID data from the MongoDB instance. The full specification of the API can be viewed here.

# Project URL
URL: https://group-29-covid-api.herokuapp.com/

Note: The time series name "TEST" is already pre defined in our database for our unit tests. The same applies for daily report as well. All other names are available to use.

## Programming Design
In terms of the implementation details, we decided to create a Node.js app that uses an Express backend and MongoDB as the database of choice. We choose to work with Express as both of us have used this framework in previous projects and applications and thus have a certain level of familiarity with the technology. Moreover, Express is relatively lightweight and allowed us to develop a Node.js application quickly and easily. We choose MongoDB as our database as a non-relational database was easier to both set up and use based on the specifications of the COVID19 API on swaggerhub. Likewise, it is very simple to connect Express with MongoDB which made CRUD operations on our database straightforward to complete. We stored our data in a JSON format on our database where each row in the CSV file represented an object in the database. We choose to set the keys in our JSON data to match the headers in the example CSV files. For the time-series data, we kept all the dates in our object since we would have to query these dates later on. In the daily report's data, we removed FIPS, Admin2, Incident_Rate, and Case_Fatality_Ratio columns since these values are never queried. Express also made it very simple to define routes on our application based on HTTP methods and URLs which ultimately helped us in the construction of our endpoints. Our endpoints are modeled after the specifications described on swaggerhub and thus return the appropriate responses to the user based on whether their request to our endpoint was successful or not. Our application handles all of the specified endpoints and performs the necessary error checking to determine whether the users' request is valid or not. In order to improve the organization of the overall codebase, we made sure that the cohesion of our code was high by ensuring components were self-contained, had a defined purpose, and belonged together. Likewise, the coupling between our different components was low since the different components were not heavily dependent on one another. This allowed us to make changes in certain parts of the codebase that did not impact the functionality of other components. Note: our group did not add our YAML file for the CI integration on GitHub actions on the main branch but did so on our forked branch as mentioned in the handout.

## Test Coverage Values
The images relating to the test coverage values are shown below

Test Coverage Values in Shell:
![image](https://user-images.githubusercontent.com/60104396/160253796-a8ae4b4d-adda-424b-9de1-93a847c1eeb2.png)

Test Coverage Values HTTP version:
![image](https://user-images.githubusercontent.com/60104396/160253831-72ef393b-d81d-4de8-9c62-51b996968842.png)

## CD Integration
The images relating to CD Integration are also provided below

CD Summary on Github Actions:
![image](https://user-images.githubusercontent.com/60104396/160253865-d14573bd-55e8-4298-b724-ac714f231c98.png)

CD on Github Actions expanded:
![image](https://user-images.githubusercontent.com/60104396/160253873-9d119970-b2ef-45b7-a147-3b986e67003a.png)
![image](https://user-images.githubusercontent.com/60104396/160253882-22a90506-e451-4f4b-a313-bea86a93fba2.png)


CD (deploy) being shown on Github Actions:
![image](https://user-images.githubusercontent.com/60104396/160253899-2b2e182e-2705-4f15-819c-ab01fc779d29.png)







