var express = require('express');
var router = express.Router();
const Referral = require('../app/controllers/referral/referral.controller');
const Auth = require('../app/controllers/auth/auth')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

router.get('/getReferralCode/:id', Referral.getReferralCode);
router.get('/getUserReferralCode/:id', Referral.getUserReferralCode);
router.post('/addWithReferral', Referral.addWithReferral);
router.post('/setIncomeSettings', Referral.setIncomeSettings);
router.get('/getMyBalance/:id', Auth.authenticate, Referral.getMyBalance);
router.get('/getTotalIncome/:id', Auth.authenticate, Referral.getTotalIncome);
router.get('/getMyReferrals/:id', Auth.authenticate, Referral.getMyReferrals);
router.get('/getMyReferralsCount/:id', Auth.authenticate, Referral.getMyReferralsCount);
router.get('/getCreditHistory/:id', Auth.authenticate, Referral.getCreditHistory);
router.get('/getWithdrawalHistory/:id', Auth.authenticate, Referral.getWithdrawalHistory);
router.get('/getReffrealsHierarchy/:id', Auth.authenticate, Referral.getReffrealsHierarchy);
router.get('/getReffrealsHierarchyByLevel/:id/:level', Auth.authenticate, Referral.getReffrealsHierarchyByLevel);
router.get('/getLevelUsers/:id', Auth.authenticate, Referral.getLevelUsers);
router.post('/withdrawal/:id', Auth.authenticate, Referral.withdrawal);
router.post('/verifyToken', Referral.verifyToken);
router.get('/getUserDetails/:id', Auth.authenticate, Referral.getUserDetails)



/* api-docs. */
router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocument));

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'ReMeLife' });
});

module.exports = router;
