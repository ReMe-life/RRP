var pool = require('../../../db');
var connection = require('../../../db2');
let referralCodeGenerator = require('referral-code-generator')
const _referral = {};
const fs = require('fs');
var path = require('path');
var jwt = require('jsonwebtoken');
var CryptoJS = require("crypto-js");
const axios = require('axios');
const { response } = require('../../../app');

_referral.getReferralCode = async function (req, res) {
    let qb;
    try {
        let uid = req.params.id;
        qb = await pool.get_connection();
        let results = await qb.select('*').where({ uid: uid }).get('user_referral_code');
        if (results.length > 0) {
            res.status(200).json({
                success: true,
                data: results[0]
            });
        } else {
            let referralCode = referralCodeGenerator.alphaNumeric('uppercase', 3, 3);
            results = await qb.insert('user_referral_code', { uid: uid, referral_code: referralCode });
            if (results.affected_rows === 1) {
                const user = await qb.get_where('user_referral_code', { uid: uid });
                res.status(200).json({
                    success: true,
                    data: user[0]
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Something went wrong!"
                });
            }
        }
    }
    catch (err) {
        console.error("error " + err);
    }
    finally {
        if (qb) qb.release();
    }
};

_referral.getUserReferralCode = async function (req, res) {
    let qb;
    try {
        let uid = req.params.id;
        qb = await pool.get_connection();
        let results = await qb.select('*').where({ uid: uid }).get('user_referral_code');
        if (results.length > 0) {
            res.status(200).json({
                success: true,
                data: results[0]
            });
        } else {
            res.status(401).json({
                success: false,
                data: 'User Not found'
            });
        }
    }
    catch (err) {
        console.error("error " + err);
    }
    finally {
        if (qb) qb.release();
    }
};

_referral.addWithReferral = async function (req, res) {
    let qb;
    try {
        let uid = req.body.uid;
        let referred_by = req.body.referred_by;
        qb = await pool.get_connection();
        let results = await qb.select('*').where({ uid: uid }).get('referred_user');
        if (results.length > 0) {
            res.status(400).json({
                success: false,
                message: "User already registerd"
            });
        } else {
            results = await qb.insert('referred_user', { uid: uid, referred_by: referred_by });
            if (results.affected_rows === 1) {
                const user = await qb.get_where('referred_user', { uid: uid });
                manageUserIncome(user[0]);
                res.status(200).json({
                    success: true,
                    data: user[0]
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Something went wrong!"
                });
            }
        }
    }
    catch (err) {
        console.error("error " + err);
    }
    finally {
        if (qb) qb.release();
    }
};

function getAmountByPer(num, per) {
    return Math.floor((num / 100) * per);
}

async function manageUserIncome(user) {
    let qb;
    try {
        let uid = user.uid;
        qb = await pool.get_connection();
        const distributions = await qb.select('*').get('distribution_settings');
        let distributionsData = distributions[0];
        let main_amount = distributionsData.main_amount;
        let level_1_amount = getAmountByPer(main_amount, distributionsData.level_1_per);
        let level_2_amount = getAmountByPer(main_amount, distributionsData.level_2_per);
        let level_3_amount = getAmountByPer(main_amount, distributionsData.level_3_per);
        await qb.insert('user_income', { uid: uid, amount: distributions[0].main_amount, new: true });
        let l1 = await qb.select('referred_by').where({ uid: uid }).get('referred_user');
        if (l1.length > 0) {
            let l1_uid = await qb.select('uid').where({ referral_code: l1[0].referred_by }).get('user_referral_code');
            await qb.insert('user_income', { uid: l1_uid[0].uid, amount: level_1_amount, level: 1, from_user: uid });
            let l2 = await qb.select('referred_by').where({ uid: l1_uid[0].uid }).get('referred_user');
            if (l2.length > 0) {
                let l2_uid = await qb.select('uid').where({ referral_code: l2[0].referred_by }).get('user_referral_code');
                await qb.insert('user_income', { uid: l2_uid[0].uid, amount: level_2_amount, level: 2, from_user: uid });
                let l3 = await qb.select('referred_by').where({ uid: l2_uid[0].uid }).get('referred_user');
                if (l3.length > 0) {
                    let l3_uid = await qb.select('uid').where({ referral_code: l3[0].referred_by }).get('user_referral_code');
                    await qb.insert('user_income', { uid: l3_uid[0].uid, amount: level_3_amount, level: 3, from_user: uid });
                }
            }
        }
    }
    catch (err) {
        console.error("error " + err);
    }
    finally {
        if (qb) qb.release();
    }
}

_referral.setIncomeSettings = async function (req, res) {
    let qb;
    try {
        let body = req.body
        qb = await pool.get_connection();
        let results = await qb.select('*').get('distribution_settings');
        if (results.length > 0) {
            results = await qb.update('distribution_settings', body, { id: results[0].id })
        } else {
            results = await qb.insert('distribution_settings', body);
        }
        if (results.affected_rows === 1) {
            const data = await qb.select('*').get('distribution_settings');
            res.status(200).json({
                success: true,
                data: data[0]
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Something went wrong!"
            });
        }
    }
    catch (err) {
        console.error("error " + err);
    }
    finally {
        if (qb) qb.release();
    }
};

async function calculateBalance(uid) {
    let qb;
    try {
        qb = await pool.get_connection();
        let results = await qb.select_sum('amount').where({ uid: uid }).get('user_income');
        let balance = results[0].amount ? results[0].amount : 0;
        let withdrawals = await qb.select_sum('withdrawal').where({ uid: uid }).get('user_withdrawals');
        let withdrawal = withdrawals[0].withdrawal ? withdrawals[0].withdrawal : 0;
        let currunt_balance = parseFloat(balance - withdrawal)
        return currunt_balance;
    }
    catch (err) {
        console.error("error " + err);
    }
    finally {
        if (qb) qb.release();
    }
}

_referral.getMyBalance = async function (req, res) {
    try {
        let uid = req.params.id;
        let currunt_balance = await calculateBalance(uid);
        res.status(200).json({
            success: true,
            data: {
                balance: currunt_balance
            }
        });
    }
    catch (err) {
        console.error("error " + err);
    }
};

async function calculateTotalIncome(uid) {
    let qb;
    try {
        qb = await pool.get_connection();
        let results = await qb.select_sum('amount').where({ uid: uid }).get('user_income');
        let balance = results[0].amount ? results[0].amount : 0;
        return balance;
    }
    catch (err) {
        console.error("error " + err);
    }
    finally {
        if (qb) qb.release();
    }
}

_referral.getTotalIncome = async function (req, res) {
    try {
        let uid = req.params.id;
        let currunt_balance = await calculateTotalIncome(uid);
        res.status(200).json({
            success: true,
            data: {
                balance: currunt_balance
            }
        });
    }
    catch (err) {
        console.error("error " + err);
    }
};

async function getReferralCode(uid) {
    let qb;
    try {
        qb = await pool.get_connection();
        let results = await qb.select('referral_code').where({ uid: uid }).get('user_referral_code');
        return results.length ? results[0].referral_code : null;
    }
    catch (err) {
        console.error("error " + err);
    }
    finally {
        if (qb) qb.release();
    }
}

_referral.getMyReferrals = async function (req, res) {
    let qb;
    try {
        let uid = req.params.id;
        let referral_code = await getReferralCode(uid);
        qb = await pool.get_connection();
        let results = await qb.select('*').where({ referred_by: referral_code }).get('referred_user');
        res.status(200).json({
            success: true,
            data: results
        });
    }
    catch (err) {
        console.error("error " + err);
    }
    finally {
        if (qb) qb.release();
    }
};

_referral.getMyReferralsCount = async function (req, res) {
    let qb;
    try {
        let uid = req.params.id;
        let referral_code = await getReferralCode(uid);
        qb = await pool.get_connection();
        let results = await qb.count('*').where({ referred_by: referral_code }).get('referred_user');
        res.status(200).json({
            success: true,
            data: results
        });
    }
    catch (err) {
        console.error("error " + err);
    }
    finally {
        if (qb) qb.release();
    }
};

_referral.getCreditHistory = async function (req, res) {
    let qb;
    try {
        let uid = req.params.id;
        qb = await pool.get_connection();
        let results = await qb.select('*').where({ uid: uid }).get('user_income');
        res.status(200).json({
            success: true,
            data: results
        });
    }
    catch (err) {
        console.error("error " + err);
    }
    finally {
        if (qb) qb.release();
    }
};



_referral.withdrawal = async function (req, res) {
    let qb;
    try {
        let uid = req.params.id;
        let withdrawalAmout = req.body.withdrawalAmout;
        qb = await pool.get_connection();
        let balance = await calculateBalance(uid);
        let currunt_balance = parseFloat(balance - withdrawalAmout)
        results = await qb.insert('user_withdrawals', { uid: uid, balance: balance, withdrawal: withdrawalAmout, currunt_balance: currunt_balance });
        if (results.affected_rows === 1) {
            res.status(200).json({
                success: true,
                message: "User withdrawal added successfully"
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Something went wrong!"
            });
        }
    }
    catch (err) {
        console.error("error " + err);
    }
    finally {
        if (qb) qb.release();
    }
};

_referral.getReffrealsHierarchy = async function (req, res) {
    let qb;
    try {
        let uid = req.params.id;

        connection.getConnection(function (err, connection) {
            if (err) throw err; // not connected!
            // let query = "SELECT * FROM user_income WHERE uid ='" + `${uid}` + "' and level = 1 UNION SELECT * FROM user_income WHERE level = 1 and uid IN (SELECT from_user FROM user_income WHERE uid ='" + `${uid}` + "')";
            // let query = "SELECT * FROM user_income WHERE uid ='" + `${uid}` + "'"
            let query = "SELECT *, (select count(*) from user_income b where b.uid = a.from_user )as referredCount from user_income a WHERE uid ='" + `${uid}` + "'"
            console.log('query -- ', query)
            // Use the connection
            connection.query(query, function (error, results, fields) {
                // When done with the connection, release it.
                connection.release();
                res.status(200).json({
                    success: true,
                    data: results
                });
                // Handle error after the release.
                if (error) throw error;

                // Don't use the connection here, it has been returned to the pool.
            });
        });
    }
    catch (err) {
        console.error("error " + err);
    }
    finally {
        // connection.release();
    }
};

_referral.getReffrealsHierarchyByLevel = async function (req, res) {
    let qb;
    try {
        let uid = req.params.id;
        let level = req.params.level;
        connection.getConnection(function (err, connection) {
            if (err) throw err; // not connected!
            let query = "SELECT *, (select count(*) from user_income b where b.uid = a.from_user )as referredCount from user_income a WHERE uid ='" + `${uid}` + "' AND level ='" + `${level}` + "'"
            connection.query(query, function (error, results, fields) {
                connection.release();
                res.status(200).json({
                    success: true,
                    data: results
                });
                if (error) throw error;

            });
        });
    }
    catch (err) {
        console.error("error " + err);
    }
    finally {
        // connection.release();
    }
};

_referral.getLevelUsers = async function (req, res) {
    let qb;
    try {
        let uid = req.params.id;
        connection.getConnection(function (err, connection) {
            if (err) throw err; // not connected!
            let query = "SELECT level, COUNT(*) as users_count FROM user_income WHERE uid ='" + `${uid}` + "' GROUP BY level"
            // Use the connection
            connection.query(query, function (error, results, fields) {
                // When done with the connection, release it.
                connection.release();
                res.status(200).json({
                    success: true,
                    data: results
                });
                // Handle error after the release.
                if (error) throw error;
                // Don't use the connection here, it has been returned to the pool.
            });
        });
    }
    catch (err) {
        console.error("error " + err);
    }
    finally {
        // connection.release();
    }
};

_referral.getWithdrawalHistory = async function (req, res) {
    let qb;
    try {
        let uid = req.params.id;
        qb = await pool.get_connection();
        let results = await qb.select('*').where({ uid: uid }).get('user_withdrawals');
        res.status(200).json({
            success: true,
            data: results
        });
    }
    catch (err) {
        console.error("error " + err);
    }
    finally {
        if (qb) qb.release();
    }
};

_referral.verifyToken = async function (req, res) {
    try {
        let token = req.body.jwt;
        token = await getJwt(token)
        var cert = fs.readFileSync(path.resolve('app/controllers/referral/public.pem'))  // get public key
        jwt.verify(token.token, cert, { algorithms: ['RS512'] }, function (err, payload) {
            // if token alg != RS256,  err == invalid signature
            if (err) {
                res.status(200).json({
                    success: false,
                    error: err
                });
            }
            else {
                res.status(200).json({
                    success: true,
                    result: { ...payload, wallet: token.wallet },
                });
            }
        });

    }
    catch (err) {
        res.status(200).json({
            success: false,
            result: err
        });
        console.error("error " + err);
    }
};

const getJwt = async (token) => {
    token = decodeURIComponent(token);
    var bytes = CryptoJS.AES.decrypt(token, process.env.SECRET_KEY);
    var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData
}

const getJwtToken = async (token) => {
    token = decodeURIComponent(token);
    var bytes = CryptoJS.AES.decrypt(token, process.env.SECRET_KEY);
    var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData.token
}
_referral.getUserDetails = async function (req, res) {
    let qb;
    try {
        let uid = req.params.id;
        await axios.get(process.env.REMELIFE_API_URL + uid,
            {
                headers: {
                    Authorization: await getJwtToken(req.headers.authorization)
                }
            })
            .then(response => {
                res.status(200).json({
                    success: true,
                    data: response.data
                });
            })

    }
    catch (err) {
        console.error("error " + err);
    }
};

const encrypToken = () => {

    let data = {
        wallet: '0x5B30aC89c67CfC04AFbFee83B1be216D0A6F47f8',
        token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzUxMiJ9.eyJleHAiOjE2MjA5MjM3MjIsImlkIjoiZDNlNTNkNmMtNTZiMi00YTU3LThkMDktZjM1NGI1OWEwNTMwIiwiZmlyc3RfbmFtZSI6ImFtaXQiLCJsYXN0X25hbWUiOiJzYWluaSIsImVtYWlsIjoiYW1pdC5zYWluaUBhbnRpZXJzb2x1dGlvbnMuY29tIn0.Bcj7txxw9b6ytxYPBW7dScZW8veoCyiJciLglFcPACQgt6nl5GklLH6hlb3GM6nu3yAioJie-u7AysmreEJyTOsS-jSzy80U4EecMMX9X_yBf-roHTJ7ysuDAm2ngzk0UFlfqQkPnzVA94QJxYZYW9PtTdy3uYVmPyLf6cPGcYZgvBo71QOv-2EU5CSVbxkcuIA3jlkePF3_-Q1Q-vtzIolsi7xYCmeZz_l704FXcmItx7Gt8ICC3oNeGY9x0iouVXf42MphOg1XpuKwp-P0Q4J0I0GypC5lfO4i3fXZ5RTRWJbXpzC7FXwcL0WNPlp9mlRfCh56-yZPBI8INbGixk2zHHnihK-e_2bW5-Q4gM-mwSrlnH17IeADLdjX6vPifRLTCpszlfnlHNoJ_4Q_N22FZNgbCj0t6dw1BQP5yHoriWEEZe2Ag_17HuLUzWDEJ_hJemVOpWQNn37lu1xfq0PtE6ShozmY57JLvnP6EvQWoi8bYmX9HysBj6g0osyTu-vimidM2p56ygY3qK8rUj7myJ08XkItfRdL01YtYfG9ttAeqm9fm-r-RBOyQAf_-O9zBQEJ07PAN7K9D0r_j-rCPm2QCqThEEvUMmSHPyR3MeYfIURJhQTlwEDfwLXa8V9czCBVgiJAnaScuIc8_aFgeeQYFVlq_AKlrx8KOS0'
    }
    let encrypToken = CryptoJS.AES.encrypt(JSON.stringify(data), process.env.SECRET_KEY).toString()

    encrypToken = encodeURIComponent(encrypToken)
    console.log('encrypToken --- ', encrypToken);

    // let encrypToken = CryptoJS.AES.encrypt('eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzUxMiJ9.eyJleHAiOjE2MTk2NTI5MDcsImlkIjoiZDNlNTNkNmMtNTZiMi00YTU3LThkMDktZjM1NGI1OWEwNTMwIiwiZmlyc3RfbmFtZSI6ImFtaXQiLCJsYXN0X25hbWUiOiJzYWluaSIsImVtYWlsIjoiYW1pdC5zYWluaUBhbnRpZXJzb2x1dGlvbnMuY29tIn0.LCc-X19ZcA8VdH9r9jaH4lH8Dnv5TjI3XzweueGWu15LYse-oDJlyCVkWBJ_twfaVQicnXlnVd0HwA9-ronWm2wQxu6nKwTF2ujrfnbu4QBlIo383XzlAT_ldtP9n7SHktyazBjqvfMWxu-M6bVnQZltnhzIRCOHaxcvfR8JysnIimjARrA5EGpHtcMasQQlUbikjpJed2-6De6X7x26-RNiriV3393UlLkkA1ig4kX8Oi3MpN0C06esrTnHzGP2xEjOD5AMr7f1Mmv1-lZ-u8H10F5m09CVWqM1-hfZ0fFxQ078k2IBstXqwd1toBrDlC0c_IOIjnL1FpXF76Hwno4TzxsPgnIRh3V5vnQj8ghRVfMKJH788JN3OtP8ac3337zMRuKfW16aBgqS6KTL4MQopjECed3bT314HZSj4w7xfczQc-22NrxHbPbqfhH864qIIb15Tr2DXlJnxbhR2R1fO-ZmV6hsR0_CZGEkoUdN-bhQdG7PVaR8_HaFcnEAKCWHH4EbKZou3GileMKbH1epXNeXjrPIvl3HVyotnQIhuCVbwmxxb1uh2yc9ARz3IO1mvDxFe_i4mqBVf3N2ZP9D4r8cSqX2C5s-OSu8YBmZTqQV9j80WrrRMCISHDvHTSUX8ublTDsyrNzqB1AsnHAMbZ9mWAxN9GN1sJedx24', process.env.SECRET_KEY).toString()
    // console.log('encrypToken --- ', encodeURIComponent(encrypToken));

}
encrypToken();
module.exports = _referral;