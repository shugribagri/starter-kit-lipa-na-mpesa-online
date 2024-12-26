const axios = require("axios").default;
require("dotenv").config();
const CallBack = require("../models/callBack");

class MpesaController {
  async getOAuthToken(req, res, next) {
    let consumer_key = process.env.consumer_key;
    let consumer_secret = process.env.consumer_secret;

    let url = process.env.oauth_token_url;

    //form a buffer of the consumer key and secret
    let buffer = new Buffer.from(consumer_key + ":" + consumer_secret);

    let auth = `Basic ${buffer.toString("base64")}`;

    try {
      let { data } = await axios.get(url, {
        headers: {
          Authorization: auth,
        },
      });

      req.token = data["access_token"];

      return next();
    } catch (err) {
      return res.send({
        success: false,
        message: err["response"]["statusText"],
      });
    }
  }

  async lipaNaMpesaOnline(req, res) {
    let token = req.token;
    let auth = `Bearer ${token}`;

    //getting the timestamp
    let timestamp = require("../middleware/timestamp").timestamp;

    let url = process.env.lipa_na_mpesa_url;
    let bs_short_code = process.env.lipa_na_mpesa_shortcode;
    let passkey = process.env.lipa_na_mpesa_passkey;

    let password = new Buffer.from(
      `${bs_short_code}${passkey}${timestamp}`
    ).toString("base64");
    let transcation_type = "CustomerPayBillOnline";
    let amount = "1"; //you can enter any amount
    let partyA = "254115005343"; //should follow the format:2547xxxxxxxx
    let partyB = process.env.lipa_na_mpesa_shortcode;
    let phoneNumber = "254115005343"; //should follow the format:2547xxxxxxxx
    let callBackUrl = `${process.env.BASE_URL}/mpesa/lipa-na-mpesa-callback`;
    let accountReference = "Lipa na mpesa for Dudley School";
    let transaction_desc = "Testing lipa na mpesa functionality";

    try {
      let { data } = await axios
        .post(
          url,
          {
            BusinessShortCode: bs_short_code,
            Password: password,
            Timestamp: timestamp,
            TransactionType: transcation_type,
            Amount: amount,
            PartyA: partyA,
            PartyB: partyB,
            PhoneNumber: phoneNumber,
            CallBackURL: callBackUrl,
            AccountReference: accountReference,
            TransactionDesc: transaction_desc,
          },
          {
            headers: {
              Authorization: auth,
            },
          }
        )
        .catch(console.log);

      return res.send({
        success: true,
        message: data,
      });
    } catch (err) {
      return res.send({
        success: false,
        message: err["response"]["statusText"],
      });
    }
  }

  lipaNaMpesaOnlineCallback(req, res) {
    console.log("Callback payload:", req.body);

    let items = req.body?.Body?.stkCallback?.CallbackMetadata?.Item;

    if (!items) {
      return res.status(400).send({
        success: false,
        message: "Invalid callback payload structure",
      });
    }

    let extractedData = {};
    let keys = [
      "Amount",
      "MpesaReceiptNumber",
      "TransactionDate",
      "PhoneNumber",
    ];
    items.forEach((item) => {
      if (item.Name && item.Value) {
        extractedData[item.Name] = item.Value;

        // Check if all required keys are present
        let missingKeys = keys.filter(
          (key) => !Object.keys(extractedData).includes(key)
        );

        if (missingKeys.length === 0) {
          // Save the extracted data to the database
          const callBackData = new CallBack(extractedData);
          callBackData.save();

          console.log("Data saved to database:", extractedData);

          return res.send({
            success: true,
            message: "Data saved successfully",
            data: extractedData,
          });
        }
      }
    });

    console.log("Extracted Data:", extractedData);

    return res.send({
      success: true,
      data: extractedData,
    });
  }

  async checkTransactionStatus(req, res) {
    try {
      // Required variables
      const token = req.token; // Ensure this middleware sets the token in req
      const auth = `Bearer ${token}`;
      const url =
        "https://sandbox.safaricom.co.ke/mpesa/transactionstatus/v1/query";

      // Request body
      const requestBody = {
        Initiator: "testapiuser",
        SecurityCredential:
          "ClONZiMYBpc65lmpJ7nvnrDmUe0WvHvA5QbOsPjEo92B6IGFwDdvdeJIFL0kgwsEKWu6SQKG4ZZUxjC",
        CommandID: "TransactionStatusQuery",
        TransactionID: req.body.transactionID || "NEF61H8J60", // Pass transaction ID from request
        OriginatorConversationID:
          req.body.originatorConversationID || "AG_20231223_000001",
        PartyA: "600782",
        IdentifierType: "4",
        ResultURL: `${process.env.BASE_URL}/mpesa/transactionstatus/result`, // Ensure BASE_URL is set in .env
        QueueTimeOutURL: `${process.env.BASE_URL}/mpesa/transactionstatus/timeout`, // Ensure BASE_URL is set in .env
        Remarks: req.body.remarks || "OK",
        Occasion: req.body.occasion || "OK",
      };

      // Make the request
      const { data } = await axios.post(url, requestBody, {
        headers: {
          Authorization: auth,
        },
      });

      // Return response to the client
      return res.status(200).send({
        success: true,
        message: "Transaction status queried successfully",
        data,
      });
    } catch (err) {
      console.error("Error checking transaction status:", err.message);
      return res.status(500).send({
        success: false,
        message: "Failed to query transaction status",
        error: err.response?.data || err.message,
      });
    }
  }

  async handleTransactionStatusCallback(req, res) {
    console.log("Transaction status callback payload:", req.body);

    // Process the callback payload
    return res.status(200).send({
      success: true,
      message: "Callback processed successfully",
    });
  }
}

module.exports = new MpesaController();
