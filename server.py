from flask import Flask , render_template , request , redirect , url_for, jsonify, send_file
from db import (budStats, automaticUpdates, Company)
import datetime
from excel import Data_to_excel

# Start automatic updates.
updater = automaticUpdates()
updater.start()

class SiteMethods(budStats):
    def getValid (self):
        Companies = []
        with self.get_conn() as conn:
            cursor = conn.cursor()
            today = datetime.date.today().isoformat()
            cursor.execute("SELECT * FROM buds WHERE licenseExpiryDate > ?" , (today ,))
            for row in cursor.fetchall():
                company = Company.from_Sql(row)
                Companies.append(company)
        return Companies




app = Flask(__name__)



@app.route('/excel', methods=['POST'])
def excel():
    id_list = request.json.get("ids")
    if id_list:
        # Assuming getCompanyInfo() returns the required data
        dbConn = SiteMethods()
        id_to_company = dbConn.getCompanyInfo()

        matched = {k:v for k,v in id_to_company.items()
                   if k in id_list
                   }
        print(f"Found {len(id_to_company)} companies and {len(matched)} match for download!")
        matched_list = [v.to_dict() for v in matched.values()]
        # Create the Excel file
        data_to_excel = Data_to_excel(matched_list,byte_stream = True)
        data_to_excel.run()

        # Send the file for download
        data_to_excel.bytes.seek(0)
        return send_file(data_to_excel.bytes, download_name="licenses.xlsx", as_attachment=True)

    return jsonify({"error": "No IDs provided"}), 400


@app.route('/api/getCompanies', methods=['GET'])
def getCompanies():
    database = SiteMethods()
    companies = database.getValid()

    companies_json = [company.to_dict() for company in companies]
    return jsonify(companies_json)

@app.route('/' , methods = [ 'GET' , 'POST' ])
def search_page ():
    database = SiteMethods()

    companies = database.getValid()
    print(f"Loaded {len(companies)}")

    return render_template('search.html',
                           valid_licenses = database.countValidLicenses(),
                           total_companies = database.countTotal(),
                           last_updated = database.getLastUpdated(),
                           Companies = companies

                           )


if __name__ == '__main__':
    try:
        app.run(debug = False , host = "66.85.157.72" , port = 8743)
    except: app.run(debug = True)