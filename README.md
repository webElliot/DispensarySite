## Dispensary Business Flask Site
### Development site link:
http://66.85.157.72:8743

# Relevant skills:
1. [Purpose](#Purpose)
2. [Sqlite3, SQL , Requests, Dataclasses](#Database)
3. [Flask site filters](#Filters)
4. [Excel converter API](#Excel)
## 

## Functions
- Automatic updates, ensuring the data is up-to-date from the US' Gov website.
- By default, the only search filter applied is valid license.
- Search bar has multiple purposes, depending on which button is selected (Default search filter License)

- Download Excel 
  - This will select all rows from your search filter, place into Excel document and download to your pc via an API.


## Purpose:
Website with multiple search filters for Dispensary business' across the US.

The issue with the gov site is that there are no search filters which is the purpose of this project & to save data in an excel document.


## Database
- The database uses SQLite3 for a local database
- A Thread is spawned on initialization to visit the US gov site displaying a list of licenses
  - This thread's utility is to visit the API that shares the information of these companies.
  - Then the data in the database is compared with the online up-to-date data
    - UPDATE Query are created for rows requiring updates. **(Batch for efficiency)**
    - INSERT Query is created for rows that are not in the database currently. **(Batch for efficiency)**
    - Every 5 Minutes the online data is checked again while the website is running to ensure up-to-date data is displayed.





## Filters
- License
- Legal name
- Trade name
- County
- City
- ZIP



## Excel

- When you download an excel document you POST the row's ID's displayed in the table to the Flask webserver
- This query's the database for the relevant company info for the posted ID's & uses them as input parameters to **Data_to_excel**
- The **Data_to_excel** Class will create an execl document in memory and return the bytes as a downloadable file to the user.