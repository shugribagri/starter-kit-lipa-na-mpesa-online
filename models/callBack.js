const mongoose = require("mongoose");

mongoose.model("CallBack", {
  MerchantRequestID: {
    type: String,
    required: false,
  },
  CheckoutRequestID: {
    type: String,
    required: false,
  },
  ResultCode: {
    type: Number,
    required: false,
  },
  ResultDesc: {
    type: String,
    required: false,
  },
  Amount: {
    type: Number,
    required: false,
  },
  MpesaReceiptNumber: {
    type: String,
    required: false,
  },
  TransactionDate: {
    type: Date,
    required: false,
  },
  PhoneNumber: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("CallBack");
