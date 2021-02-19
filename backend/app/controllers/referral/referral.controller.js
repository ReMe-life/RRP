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
        jwt.verify(token, cert, { algorithms: ['RS512'] }, function (err, payload) {
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
                    result: payload
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
    var jwt = bytes.toString(CryptoJS.enc.Utf8);
    return jwt;
}

_referral.getUserDetails = async function (req, res) {
    let qb;
    try {
        let uid = req.params.id;
        await axios.get(process.env.REMELIFE_API_URL + uid,
            {
                headers: {
                    Authorization: await getJwt(req.headers.authorization)
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
    let encrypToken = CryptoJS.AES.encrypt('eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzUxMiJ9.eyJleHAiOjE2MTM3NTI0MTAsImlkIjoiZDNlNTNkNmMtNTZiMi00YTU3LThkMDktZjM1NGI1OWEwNTMwIiwiZmlyc3RfbmFtZSI6ImFtaXQiLCJsYXN0X25hbWUiOiJzYWluaSIsImVtYWlsIjoiYW1pdC5zYWluaUBhbnRpZXJzb2x1dGlvbnMuY29tIn0.ywoZfduCfdJm7WVWDClxVoU_LTzFURbuMpMvWcllgnUpYmkkP9qNKbZjm50UNj-AMjb2cVn-B8g6M1UD2WnIasf3R38T038VftECCB1W0FIL9fe1lWWHLWpDUQqGWJ7nrHc-88R1cfU6m3a6NLiVUQZ0bBZkylUuZl8RzleEFsg7rJvLawLHCDpEdrvMYoaUBzoQ855TMZKS3q5K7HuofCMfseQc7n2EB0SU0DiJFDR9yx34wn90B8jncwIlxJraxpxj4eRCfVV5M0eKfCV14DfghsEerl3DegNSRX7Wz5gWB7vaojwruLsMToY3c_F3g2p9rqpUqfe1nyNsYKMPcA3Xv8Dwws6l_sICmztZ_4VE_A_5wxUKR1Ww_C1UzMxaFaQwdXqTe_xUxYOtTAVp1lkreGRysRW2fOgNPyFZc5TLnyFzqct_HS0W6vAsXkZy_eEaav9rk_DGoQE6C7XWEg6ab9R9lednoOhYKzCRMLp8dLxrPcYwC7fJuWXdlXhdKZE3MpP7qT5lq0nOWr0dTwhVrHHOuqU2TGt_jiC1wrrxwhYtqKybWFPkcNkoj-tIZnTaJdX4tx_Vb_TJq4u2iDfOwFDPPB8a0qduD8gk5PeeMVngjkDdyWA4vahqHcX0aD2phs9O8nISIbQHHlYZUXXcrXIuhU2ah-XvoaSi8_w', process.env.SECRET_KEY).toString()
    console.log('encrypToken --- ', encodeURIComponent(encrypToken));

}
encrypToken();
module.exports = _referral;