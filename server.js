const express = require("express");
const StellarSdk = require("stellar-sdk");
require("dotenv").config();

const app = express();
app.use(express.json());

// TESTNET (start with testnet!)
const server = new StellarSdk.Server("https://api.testnet.minepi.com");

const sourceKeys = StellarSdk.Keypair.fromSecret(process.env.PI_SEED);

app.get("/", (req, res) => {
  res.send("Pi Bot Running 🚀");
});

app.post("/send", async (req, res) => {
  try {
    const { destination, amount, memo } = req.body;

    const account = await server.loadAccount(sourceKeys.publicKey());
    const fee = await server.fetchBaseFee();

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee,
      networkPassphrase: "Pi Testnet"
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination,
          asset: StellarSdk.Asset.native(),
          amount
        })
      )
      .addMemo(StellarSdk.Memo.text(memo))
      .setTimeout(30)
      .build();

    transaction.sign(sourceKeys);

    const result = await server.submitTransaction(transaction);

    res.json({ success: true, hash: result.hash });

  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
