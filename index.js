const WebSocket = require("ws");
const axios = require("axios");
const crypto = require("crypto");

const accountId = "100009";

// Both are random generated
const accessKey = "5b36d399-0119-4972-a2bb-cb509f706e44";
const secretKey = "36638ae6-e857-4fb2-893a-7a7f1d1de230";

const apiUrl = "https://api.huobi.pro";
const wsUrl = "wss://api.huobi.pro/ws";

const ws = new WebSocket(wsUrl);
const http = axios.create({
  baseURL: apiUrl,
  timeout: 1000,
  headers: { "Content-Type": "application/json" },
});

// Streaming the web socket message
ws.on("message", (data) => {
  const message = JSON.parse(data);

  // Playing ping pong
  if (message.ping) {
    ws.send(JSON.stringify({ pong: message.ping }));
  } else {
    console.log("Market Data:", message);
  }
});

const ts = () => {
  return encodeURIComponent(new Date().toISOString());
};

const sign = (content) => {
  return crypto
    .createHmac("sha256", secretKey)
    .update(content)
    .digest("base64");
};

const getRequest = async (url) => {
  const queryString = `AccessKeyId=${accessKey}&SignatureMethod=HmacSHA256&SignatureVersion=2&Timestamp=${ts()}`;

  const preSignContent = `GET\n${apiUrl}\n${url}\n${queryString}`;
  const signature = sign(preSignContent);

  const response = await http({
    method: "get",
    url: `${url}?${queryString}&Signature=${signature}`,
  });
  return response.data;
};

const postRequest = async (url, data) => {
  const queryString = `AccessKeyId=${accessKey}&SignatureMethod=HmacSHA256&SignatureVersion=2&Timestamp=${ts()}`;

  const preSignContent = `POST\n${apiUrl}\n${url}\n${queryString}`;
  const signature = sign(preSignContent);

  const response = await http({
    method: "get",
    url: `${url}?${queryString}&Signature=${signature}`,
    data: data,
  });
  return response.data;
};

const pasteOrder = async (symbol, price, amount, type) => {
  const data = {
    "account-id": accountId,
    amount: amount,
    price: price,
    source: "spot-api",
    symbol: symbol,
    type: type,
    "client-order-id": "a0001",
  };

  const response = await postRequest("/v1/order/orders/place", data);
  return response;
};

const getBalance = async () => {
  const response = await getRequest(
    `/v1/account/accounts/${accountId}/balance`
  );
  return response;
};

// Get Balance
getBalance();

// Paste order
pasteOrder();
