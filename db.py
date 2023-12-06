import sqlite3
from sqlite3 import Error
import json
from time import sleep
import time
import datetime

from termcolor import cprint
from dataclasses import dataclass , asdict
from typing import List
from excel import DownloadData

from threading import Thread

@dataclass
class Company:
	id : str
	licenseNumber : str
	legalName : str
	tradeName : str
	licenseType : str
	streetAddress : str
	city : str
	county : str
	licenseExpiryDate : datetime
	zip : str
	phone : str
	email : str
	hours : str
	discloseAddress : bool


	@staticmethod
	def from_Json(d):
		if 'dataSourceName' in d:
			del d['dataSourceName']
		return Company(**d)

	def to_dict (self):
		return { k: (v.isoformat() if isinstance(v , datetime.datetime) else v) for k , v in asdict(self).items() }

	@staticmethod
	def from_Sql(row):
		_ , CompanyId , licenseNumber, legalName, tradeName, licenseType, streetAddress, city, county, licenseExpiryDate, zip, phone, email, hours, discloseAddress = row
		out_json = {
			"id": CompanyId,
			"licenseNumber": licenseNumber,
			"legalName": legalName,
			"tradeName": tradeName,
			"licenseType": licenseType,
			"streetAddress": streetAddress,
			"city": city,
			"county": county,
			"licenseExpiryDate": licenseExpiryDate,
			"zip": zip,
			"phone": phone,
			"email": email,
			"hours": hours,
			"discloseAddress": discloseAddress
			}
		return Company.from_Json(out_json)

	def toSql(self):
		return (self.licenseNumber, self.legalName, self.tradeName, self.licenseType, self.streetAddress, self.city, self.county, self.licenseExpiryDate, self.zip, self.phone, self.email, self.hours, self.discloseAddress, self.id)



	def __repr__(self):
		return f"{self.tradeName} known legally as {self.legalName} is a {self.licenseType} in {self.county} {self.city} Contact: {self.email} during hrs: {self.hours}"



class budDb:
	DATABASE_PATH = "dbs/buds.db"

	def __init__ (self):
		self.create_tables()

	def get_conn (self):
		conn = None
		try:
			conn = sqlite3.connect(self.DATABASE_PATH)
		except Error as e:
			print(e)
		return conn

	def create_tables (self):
		with self.get_conn() as conn:
			cursor = conn.cursor()
			cursor.execute('''
			    CREATE TABLE IF NOT EXISTS buds (
			        budId INTEGER PRIMARY KEY AUTOINCREMENT,
			        id VARCHAR NOT NULL,
			        licenseNumber VARCHAR,
			        legalName TEXT,
			        tradeName TEXT,
			        licenseType TEXT,
			        streetAddress TEXT,
			        city TEXT,
			        county TEXT,
			        licenseExpiryDate DATETIME,
			        zip TEXT,
			        phone TEXT,
			        email TEXT,
			        hours TEXT,
			        discloseAddress BOOLEAN
			    );
			''')
			cursor.execute('''
			    CREATE TABLE IF NOT EXISTS config (
			        id INTEGER PRIMARY KEY AUTOINCREMENT,
			        updated DATETIME
			    );
			''')





class configDb(budDb):
	def getLastUpdated(self):
		with self.get_conn() as conn:
			cursor = conn.cursor()
			cursor.execute("SELECT updated FROM config WHERE id = 1")
			try:
				time_updated = datetime.datetime.strptime(cursor.fetchone()[ 0 ] , "%Y-%m-%d %H:%M:%S")
			except:
				return "Never (Error)"
			difference = datetime.datetime.now() - time_updated
			seconds = difference.total_seconds()

			if seconds < 60:
				return f'{int(seconds)} seconds'
			elif seconds < 3600:
				return f'{int(seconds / 60)} minutes'
			elif seconds < 86400:
				return f'{int(seconds / 3600)} hours'
			else:
				return f'{int(seconds / 86400)} days'
	def setUpdated (self):
		with self.get_conn() as conn:
			cursor = conn.cursor()

			# Check if the row with id = 1 exists
			cursor.execute("SELECT id FROM config WHERE id = 1")
			if cursor.fetchone() is None:
				# If not, insert the row
				cursor.execute("INSERT INTO config (id, updated) VALUES (1, CURRENT_TIMESTAMP)")
			else:
				# If it exists, update the row
				cursor.execute("UPDATE config SET updated = CURRENT_TIMESTAMP WHERE id = 1")
			# Commit the changes
			conn.commit()

class budMethods(configDb):
	def getCompanyInfo (self):
		with self.get_conn() as conn:
			cursor = conn.cursor()
			cursor.execute("SELECT * FROM buds;")
			rows = cursor.fetchall()
			if rows:
				return {row[1] : Company.from_Sql(row) for row in rows}
		return {}

	# default methods no checks.
	def insertCompanies (self , company_list: List[ Company ]):
		with self.get_conn() as conn:
			cursor = conn.cursor()
			cursor.executemany("""
				                    INSERT INTO buds (licenseNumber, legalName, tradeName, licenseType, 
				                                      streetAddress, city, county, licenseExpiryDate, zip, 
				                                      phone, email, hours, discloseAddress,id) 
				                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
				                    """ , [company.toSql() for company in company_list])
			conn.commit()

	def updateCompanies (self , company_list: List[ Company ]):
		with self.get_conn() as conn:
			cursor = conn.cursor()
			cursor.executemany("""
	                UPDATE buds
	                SET licenseNumber=?, legalName=?, tradeName=?, licenseType=?, 
	                    streetAddress=?, city=?, county=?, licenseExpiryDate=?, zip=?, 
	                    phone=?, email=?, hours=?, discloseAddress=?
	                WHERE id=?
	                """ , [company.toSql() for company in company_list])
			conn.commit()

	def insertCompanyInfo(self, company_list : List[Company], full_update=False):
		existing_companies = self.getCompanyInfo()
		Require_Update = []
		Requrie_Insert = []

		no_changes = 0

		for company in company_list:
			stored_company = existing_companies.get(company.id)
			if stored_company == company:
				no_changes+=1
			elif stored_company is None:
				Requrie_Insert.append(company)
			else:
				Require_Update.append(company)
		print(f"You require {len(Requrie_Insert)} Inserts, {len(Require_Update)} Updates & {no_changes} had no changes.")

		self.insertCompanies(Requrie_Insert)
		self.updateCompanies(Require_Update)

		if full_update:
			self.setUpdated()

class budStats(budMethods):
	def countValidLicenses (self):
		with self.get_conn() as conn:
			cursor = conn.cursor()
			today = datetime.date.today().isoformat()
			cursor.execute("SELECT COUNT(*) FROM buds WHERE licenseExpiryDate > ?" , (today ,))
			count = cursor.fetchone()[ 0 ]
			return count
	def countTotal (self):
		with self.get_conn() as conn:
			cursor = conn.cursor()
			cursor.execute("SELECT COUNT(*) FROM buds")
			count = cursor.fetchone()[ 0 ]
			return count





def fetchOnline() -> bool:
	dataDownloader = DownloadData()
	dataDownloader.run()
	v = dataDownloader.response.get("result")
	if v:
		db = budStats()
		companies = [Company.from_Json(each) for each in v]
		db.insertCompanyInfo(companies,True)
		return True
	return False


class automaticUpdates(Thread):
	sleep_minutes = 5
	sleep_seconds = sleep_minutes * 60
	def __init__(self):
		super().__init__()
	def run(self):
		while 1:
			fetchOnline()
			sleep(self.sleep_seconds)


if __name__ == "__main__":

	db = budStats()
	valid = db.countValidLicenses()
	total = db.countTotal()
	print(f"{valid}/{total} licenses are valid.")