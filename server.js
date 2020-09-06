// Imports
const express = require('express')
const mysql = require('mysql');
const { apiUrl, sqlConfig } = require('./configs')

// Initialise
const APP_PORT = 3000;
const app = express()

const pool = mysql.createPool(sqlConfig);

//Queries
const GET_HOUSEHOLDS = mkQuery('SELECT * FROM Household', pool);
// Student Encouragement Bonus (SEB)
const GET_HOUSEHOLDS_SEB = mkQuery('SELECT * FROM Household WHERE ID in (SELECT housing_id FROM person GROUP BY HOUSING_ID HAVING SUM(ANNUAL_INCOME) < ? and MIN(TIMESTAMPDIFF(YEAR, dob, CURDATE())) < ?)', pool);
// Family Togetherness Scheme (FTS)
const GET_HOUSEHOLDS_FTS = mkQuery('SELECT * FROM Household WHERE ID in (SELECT housing_id FROM person GROUP BY HOUSING_ID HAVING COUNT(SPOUSE) = 2 and MIN(TIMESTAMPDIFF(YEAR, dob, CURDATE())) < ?)', pool);
// Elder Bonus (EB)
const GET_HOUSEHOLDS_EB = mkQuery('SELECT * FROM Household WHERE ID in (SELECT housing_id FROM person GROUP BY HOUSING_ID HAVING MAX(TIMESTAMPDIFF(YEAR, dob, CURDATE())) > ?)', pool);
// Baby Sunshine Grant (BSG)
const GET_HOUSEHOLDS_BSG = mkQuery('SELECT * FROM Household WHERE ID in (SELECT housing_id FROM person GROUP BY HOUSING_ID HAVING MIN(TIMESTAMPDIFF(YEAR, dob, CURDATE())) < ?)', pool);
// YOLO GST Grant (YGG)
const GET_HOUSEHOLDS_YGG = mkQuery('SELECT * FROM Household WHERE ID in (SELECT housing_id FROM person GROUP BY HOUSING_ID HAVING SUM(ANNUAL_INCOME) < ?)', pool);

const GET_HOUSEHOLD_DETAILS = mkQuery('SELECT *, h.ID as housingId, p.ID as personId FROM Household h LEFT JOIN Person p on h.ID = p.HOUSING_ID WHERE h.ID = ?', pool);
const CREATE_HOUSEHOLD = mkQuery('INSERT INTO Household (ID, HOUSING_TYPE, FLOOR_NUMBER, UNIT_NUMBER, POSTAL_CODE) VALUES (?, ?, ?, ?, ?)', pool);
const GET_FAMILY_MEMBERS_BY_HOUSEHOLD = mkQuery('SELECT * FROM Person WHERE HOUSING_ID = ?', pool);
const GET_FAMILY_MEMBER_DETAILS = mkQuery('SELECT * FROM Person WHERE ID = ?', pool);
const ADD_FAMILY_MEMBER = mkQuery('INSERT INTO Person VALUES (?,?,?,?,?,?,?,?,?)', pool);

const DELETE_HOUSEHOLD = mkQuery("DELETE FROM Household WHERE ID = ?", pool)
const DELETE_FAMILY_MEMBER_FROM_HOUSEHOLD = mkQuery("DELETE FROM Person WHERE HOUSING_ID = ? AND ID = ?", pool)

app.use(express.json());

app.get('/api/households', (req, res) => {
    const searchParams = req.query;
    if (JSON.stringify(searchParams) === JSON.stringify({})) {
        GET_HOUSEHOLDS().then(results => {
            res.status(200).json({
                households: formatHousholdsData(results)
            });
        })
            .catch(error => {
                handleError(res, error);
            }
            )
    }
    else {
        const householdIncomeLimit = searchParams.householdIncomeLimit;
        const childrenAgeLimit = searchParams.childrenAgeLimit;
        const elderAgeLimit = searchParams.elderAgeLimit;
        const husbandWife = searchParams.husbandWife;
        if (householdIncomeLimit && childrenAgeLimit && !elderAgeLimit &&!husbandWife) {
            GET_HOUSEHOLDS_SEB([householdIncomeLimit, childrenAgeLimit])
                .then(results => {
                    res.status(200).json({
                        households: formatHousholdsData(results)
                    });
                })
                .catch(error => {
                    handleError(res, error);
                })
            return;
        }
        if (husbandWife && childrenAgeLimit &&!elderAgeLimit &&!householdIncomeLimit) {
            GET_HOUSEHOLDS_FTS([childrenAgeLimit])
            .then(results => {
                res.status(200).json({
                    households: formatHousholdsData(results)

                });
            })
            .catch(error => {
                handleError(res, error);
            })
            return;
        }
        if (elderAgeLimit && !householdIncomeLimit && !childrenAgeLimit && !husbandWife) {
            GET_HOUSEHOLDS_EB([elderAgeLimit])
                .then(results => {
                    res.status(200).json({
                        households: formatHousholdsData(results)
                    });
                })
                .catch(error => {
                    handleError(res, error);
                })
            return;    
        }
        if (childrenAgeLimit && !householdIncomeLimit && !elderAgeLimit && !husbandWife) {
            GET_HOUSEHOLDS_BSG([childrenAgeLimit])
            .then(results => {
                res.status(200).json({
                    households: formatHousholdsData(results)

                });
            })
            .catch(error => {
                handleError(res, error);
            })
            return;
        }
        if (householdIncomeLimit && !elderAgeLimit && !childrenAgeLimit && !husbandWife) {
            GET_HOUSEHOLDS_YGG([householdIncomeLimit])
            .then(results => {
                res.status(200).json({
                    households: formatHousholdsData(results)

                });
            })
            .catch(error => {
                handleError(res, error);
            })
            return;
        }
        res.status(400).json({
            message: 'Invalid parameters provided'
        })
    }
})

app.get('/api/households/:id', (req, res) => {
    GET_HOUSEHOLD_DETAILS([req.params['id']])
        .then(results => {
            const familyMembersDetails = results[0].NAME ? results.map(result => {
                return {
                    id: result.personId,
                    name: result.NAME,
                    maritalStatus: result.MARITAL_STATUS,
                    spouse: result.SPOUSE,
                    occupation: result.OCCUPTATION_TYPE,
                    annualIncome: result.ANNUAL_INCOME,
                    dob: result.DOB
                }
            }) : []
            const householdDetails = {
                housingType: results[0].HOUSING_TYPE,
                floorNumber: results[0].FLOOR_NUMBER,
                unitNumber: results[0].UNIT_NUMBER,
                postalCode: results[0].POSTAL_CODE,
                existing: results[0].EXISTING
            };
            res.status(200).json({
                household: {
                    householdDetails,
                    familyMembersDetails
                }
                // housholdDetails: {
                //     ...details
                //     //FAMILY_MEMBERS: `${apiUrl}/api/households/${details.ID}/members`
                // }
            });
        })
        .catch(error => {
            handleError(res, error);
        })
})

app.post('/api/households', (req, res) => {
    const housingType = req.body['type'];
    const floorNumber = req.body['floor'] || 0;
    const unitNumber = req.body['unit'];
    const postalCode = req.body['postal'];
    const id = floorNumber.toString() + unitNumber.toString() + postalCode.toString();

    if ((!floorNumber && housingType !== 'landed') || (!housingType && !floorNumber && !unitNumber && !postalCode)) {
        res.status(400).json({
            message: 'Invalid parameters provided'
        })
    }
    else {
        CREATE_HOUSEHOLD([id, housingType, floorNumber, unitNumber, postalCode])
            .then(_ => {
                res.status(201).json({
                    message: 'Created household successfully'
                })
            })
            .catch(error => {
                handleError(res, error);
            })
    }
})

// app.get('/api/households/:id/members', (req, res) => {
//     const housingId = req.params.id;
//     GET_FAMILY_MEMBERS_BY_HOUSEHOLD([housingId])
//         .then(results => {
//             res.status(200).json({
//                 housingId,
//                 members: results.map(result => {
//                     return {
//                         id: result.ID,
//                         personDetails: `${apiUrl}/api/households/${result.HOUSING_ID}/members/${result.ID}`
//                     }
//                 })
//             })
//         })
//         .catch(error => {
//             handleError(res, error);
//         })
// })

// app.get('/api/households/:id/members/:personId', (req, res) => {
//     GET_FAMILY_MEMBER_DETAILS([req.params.personId])
//         .then(results => {
//             res.status(200).json(results[0])
//         })
//         .catch(error => {
//             handleError(res, error);
//         })
// })

app.post('/api/households/:id/members', (req, res) => {
    const id = req.body.id;
    const name = req.body.name;
    const gender = req.body.gender;
    const maritalStatus = req.body.maritalStatus;
    const spouse = maritalStatus === 'Married' ? req.body.spouse : null; 
    const occupationType = req.body.occupationType;
    const annualIncome = occupationType === 'Employed' ? req.body.annualIncome : 0;
    const dob = req.body.dob;
    const housingId = req.params.id;

    ADD_FAMILY_MEMBER([id, name, gender, maritalStatus, spouse, occupationType, annualIncome, dob, housingId])
        .then(_ => {
            res.status(201).json({
                message: 'Added family member to household successfully'
            })
        })
        .catch(error => {
            handleError(res, error);
        })
})

app.delete('/api/households/:id', (req, res) => {
    DELETE_HOUSEHOLD([req.params.id])
        .then(_ => {
            res.status(200).json({
                message: 'Deleted household and family member(s) successfully'
            })
        })
        .catch(error => {
            handleError(res, error);
        })
})

app.delete('/api/households/:id/members/:personId', (req, res) => {
    DELETE_FAMILY_MEMBER_FROM_HOUSEHOLD([req.params.id, req.params.personId])
        .then(_ => {
            res.status(200).json({
                message: 'Deleted family member successfully'
            })
        })
        .catch(error => {
            handleError(res, error);
        })
})

app.get('*', (_, res) => {
    res.status(404).json({
        message: 'Not found'
    })
})

app.listen(APP_PORT, function () {
    console.log(`App has started and is listening on port ${APP_PORT}`)
})

function mkQuery(sql, pool) {
    const f = function (params) {
        const p = new Promise((resolve, reject) => {
            pool.getConnection((err, conn) => {
                if (err) {
                    return reject(err);
                }
                conn.query(sql, params || [], (err, result) => {
                    conn.release();
                    if (err) {
                        return reject(err);
                    }
                    resolve(result);
                })
            })
        })
        return p;
    }
    return f;
}

function formatHousholdsData(results) {
    const formatted = results.map(result => {
        return {
            ID: result.ID,
            HOUSING_TYPE: result.HOUSING_TYPE,
            HOUSEHOLD_DETAILS: `${apiUrl}/api/households/${result.ID}`
        }
    })
    return formatted;
}

function handleError(res, error) {
    switch (error.code) {
        case 'ER_DUP_ENTRY':
            res.status(400).json({
                message: 'Duplicate entry'
            });
            break;
        default:
            res.status(500).json(error);
    }
}