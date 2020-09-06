**Set Up**
----
The Government Grant Disbursement API is built using Express, a web application framework for Node.js and Javascript. Database used is MySQL.

To set up database locally, <b>run schema.sql</b>, which will create the tables and insert some test data. Update user and password for sqlConfig object under configs.js based on MySQL's local running instance's credentials. 

To run the API locally, ensure than npm is installed and <b>run npm install</b> to install the dependencies and then <b>run npm start</b> to start the server on http://localhost:3000.

**1. Create Household**
----
  Sends household's data in JSON format

* **URL**

  /api/households

* **Method:**

  `POST`
  
*  **URL Params**

   None

* **Data Params**

  `{
        "type": "HDB",
        "floor": 15,
        "unit": 108,
        "postal": 633111
    }`

* **Success Response:**

  * **Code:** 201 Created <br />
    **Content:** `{
                message: 'Created household successfully'
            }`
* **Error Response:**
    * **Code:** 400 Bad Request <br />
    **Content:** `{"message": "Duplicate entry"}`

  OR

  * **Code:** 500 Internal Server (catch-all for unexpected errors)  <br />

**2. Add a Family Member to Household**
----
  Sends family member's data in JSON format

* **URL**

  /api/households/:id/members

* **Method:**

  `POST`
  
*  **URL Params**

   **Required:**
 
   `id=[integer]`<br/>

   id is unique identifier of the household, which is made up of floor number (0 for non-HDB), unit number and postal code.

* **Data Params**

  `{
    "id": "S8451234X",
    "name": "Jane Tan",
    "gender": "Female",
    "maritalStatus": "Married",
    "spouse": "S8251234X",
    "occupationType": "Employed",
    "annualIncome": "50000",
    "dob": "1984-06-23"
}`

* **Success Response:**

  * **Code:** 201 Created <br />
    **Content:** `{
                message: 'Added family member(s) to household successfully'
            }`
* **Error Response:**
    * **Code:** 400 Bad Request <br />
    **Content:** `{"message": "Duplicate entry"}`

  OR

  * **Code:** 500 Internal Server (catch-all for unexpected errors)  <br />

**3. List households**
----
  Returns json data containing list of households.

* **URL**

  /api/households

* **Method:**

  `GET`
  
*  **URL Params**

    To search for households and recipients of grant disbursement endpoint

   **Optional:**<br/>
   `householdIncomeLimit=[integer]`<br/>
   `childrenAgeLimit=[integer]`<br/>
   `husbandWife=[boolean]`<br/>
   `elderAgeLimit=[integer]`<br/>

   For the  following schemes:
   * Student Encouragement Bonus, set householdIncomeLimit=150000 and childrenAgeLimit=16

   * Family Togetherness Scheme, set husbandWife=true and childrenAgeLimit=16

   * Elder Bonus, set elderAgeLimit=50

   * Baby Sunshine Grant, set childrenAgeLimit=5

   * YOLO GST grant, set householdIncomeLimit=100000

   Any other combinations of query params would result in 400 error
* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{"households": [
        {
            "ID": "08712666",
            "HOUSING_TYPE": "Landed",
            "HOUSEHOLD_DETAILS": "http://localhost:3000/api/households/08712666"
        },
        {
            "ID": "15108632123",
            "HOUSING_TYPE": "HDB",
            "HOUSEHOLD_DETAILS": "http://localhost:3000/api/households/15108632123"
        },
        {
            "ID": "423712334",
            "HOUSING_TYPE": "HDB",
            "HOUSEHOLD_DETAILS": "http://localhost:3000/api/households/423712334"
        }
    ]}`
* **Error Response:**
    * **Code:** 400 Bad Request <br />
    **Content:** `{"message": "Invalid parameters provided"}`

  OR

  * **Code:** 500 Internal Server (catch-all for unexpected errors)  <br />

**4. Show household**
----
  Returns json data containing household's details and family members' details.

* **URL**

  /api/households/:id

* **Method:**

  `GET`
  
*  **URL Params**

   **Required:**
 
   `id=[integer]`<br/>

   id is unique identifier of the household, which is made up of floor number (0 for non-HDB), unit number and postal code.

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{
    "household": {
        "householdDetails": {
            "housingType": "Landed",
            "floorNumber": "0",
            "unitNumber": "8",
            "postalCode": "712666",
            "existing": "Yes"
        },
        "familyMembersDetails": [
            {
                "id": "S0041234A",
                "name": "Jenny Foo",
                "maritalStatus": "Single",
                "spouse": null,
                "occupation": "Student",
                "annualIncome": 0,
                "dob": "2004-01-12T16:00:00.000Z"
            },
            {
                "id": "S7251234X",
                "name": "Peter Foo",
                "maritalStatus": "Married",
                "spouse": "S7451234X",
                "occupation": "Employed",
                "annualIncome": 100000,
                "dob": "1972-01-22T16:30:00.000Z"
            },
            {
                "id": "S7451234X",
                "name": "Jane Tan",
                "maritalStatus": "Married",
                "spouse": "S7251234X",
                "occupation": "Employed",
                "annualIncome": 100000,
                "dob": "1974-02-12T16:30:00.000Z"
            }
        ]
    }
}`
* **Error Response:**
  * **Code:** 500 Internal Server (catch-all for unexpected errors)  <br />

**5. Delete household and family members(s)**
----

* **URL**

  /api/households/:id

* **Method:**

  `DELETE`
  
*  **URL Params**

   **Required:**
 
   `id=[integer]`<br/>

   id is unique identifier of the household, which is made up of floor number (0 for non-HDB), unit number and postal code.

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ message: 'Deleted household and family member(s) successfully' }
}`
* **Error Response:**
  * **Code:** 500 Internal Server (catch-all for unexpected errors)  <br />

**6. Delete family member from household**
----

* **URL**

  /api/households/:id/members/:personId

* **Method:**

  `DELETE`
  
*  **URL Params**

   **Required:**
 
   `id=[integer]`<br/>
   `personId=[integer]`<br/>

   id is unique identifier of the household, which is made up of floor number (0 for non-HDB), unit number and postal code.
   personId is an unique identifer of the person, which could be NRIC for e.g.

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ message: 'Deleted family member successfully' }` 
}`
* **Error Response:**
  * **Code:** 500 Internal Server (catch-all for unexpected errors)  <br />
