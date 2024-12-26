const express = require("express");

const router = express.Router();

//controllers
const mpesa = require("../controllers/mpesa");

//route to get the auth token
router.get("/get-auth-token", mpesa.getOAuthToken);

//lipa na mpesa online
router.post("/lipa-na-mpesa", mpesa.getOAuthToken, mpesa.lipaNaMpesaOnline);

//callback url
router.post("/lipa-na-mpesa-callback", mpesa.lipaNaMpesaOnlineCallback);

//check transaction status
router.post(
  "/check-transaction-status",
  mpesa.getOAuthToken,
  mpesa.checkTransactionStatus
);

//transaction status callback
router.post("/transactionstatus/result", mpesa.handleTransactionStatusCallback);

module.exports = router;
