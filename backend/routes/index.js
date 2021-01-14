var express = require('express');
var router = express.Router();
const Referral = require('../app/controllers/referral/referral.controller');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

router.get('/getReferralCode/:id', Referral.getReferralCode);
router.get('/getUserReferralCode/:id', Referral.getUserReferralCode);
router.post('/addWithReferral', Referral.addWithReferral);
router.post('/setIncomeSettings', Referral.setIncomeSettings);
router.get('/getMyBalance/:id', Referral.getMyBalance);
router.get('/getTotalIncome/:id', Referral.getTotalIncome);
router.get('/getMyReferrals/:id', Referral.getMyReferrals);
router.get('/getMyReferralsCount/:id', Referral.getMyReferralsCount);
router.get('/getCreditHistory/:id', Referral.getCreditHistory);
router.get('/getWithdrawalHistory/:id', Referral.getWithdrawalHistory);
router.get('/getReffrealsHierarchy/:id', Referral.getReffrealsHierarchy);
router.get('/getReffrealsHierarchyByLevel/:id/:level', Referral.getReffrealsHierarchyByLevel);
router.get('/getLevelUsers/:id', Referral.getLevelUsers);
router.post('/withdrawal/:id', Referral.withdrawal);
router.post('/verifyToken', Referral.verifyToken)



/* api-docs. */
router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocument));

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'ReMeLife' });
});

module.exports = router;
