import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import Stripe from "stripe";

export async function handler(event) {
  const requestContext = event.requestContext;
  const httpMethod = requestContext.http.method;
  let body;
  let statusCode = "200";
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
  };

  try {
    switch (httpMethod) {
      case "GET":
      case "OPTIONS":
        body = { status: "okay", httpMethod, requestId: requestContext.requestId };
        break;
      case "POST":
        const params = JSON.parse(event.body);
        body = await stripeChargeRequest(params);
        await publishSuccess(body);
        break;
      default:
        throw new Error(`Unsupported method "${httpMethod}"`);
    }
  } catch (err) {
    await publishError(err);
    console.error(err);
    statusCode = "400";
    body = err;
  } finally {
    body = JSON.stringify(body, null, 2);
  }

  // TODO implement
  const response = {
    statusCode,
    headers,
    body: JSON.stringify('Hello from Lambda!'),
    event
  };
  return response;
}

/**
 * Send a "Charge" request to Stripe
 */
async function stripeChargeRequest(params) {
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const token = params.stripeToken;
  const { amount, currency, description } = params.stripeChargeObject;
  const stripeChargeParams = {
    amount,
    currency,
    description,
    source: token.id
  };
  const stripeChargeResult = await stripe.charges.create(stripeChargeParams);
  return { params, stripeChargeParams, stripeChargeResult };
}

async function publishSuccess(params) {
  const [subject, message] = generateSuccessMessage(params);
  const snsParams = {
    Message: message,
    Subject: subject,
    TopicArn: process.env.SNS_ARN
  };
  await publishToTopic(snsParams);
}

function generateSuccessMessage(params) {
  const { stripeChargeParams, stripeChargeResult } = params;
  const amountFormatted = `$${stripeChargeParams.amount / 100} ${stripeChargeParams.currency}`;
  return [
    `Payment Captured: ${amountFormatted} For ${stripeChargeParams.description}`,
    [
      `Status: ${String(stripeChargeResult.status).toUpperCase()}`,
      `Payment Description: ${stripeChargeParams.description}`,
      `Payment Amount: ${amountFormatted}`,
      `Captured: ${stripeChargeResult.captured ? "Yes" : "No"}`,
      `Paid: ${stripeChargeResult.paid ? "Yes" : "No"}`,
      `-----`,
      `Stripe Charge ID: ${stripeChargeResult.id}`,
    ].join("\n")
  ];
}

async function publishError(error) {
  const [subject, message] = generateErrorMessage(error);
  const snsParams = {
    Message: message,
    Subject: subject,
    TopicArn: process.env.SNS_ARN
  };
  await publishToTopic(snsParams);
}

async function publishToTopic(snsParams) {
  if (process.env.LOCAL_TEST) {
    console.log("🔥 SNS Triggered:");
    console.dir(snsParams);
  } else {
    const sns = new SNSClient();
    await sns.send(new PublishCommand(snsParams));
  }
}

function generateErrorMessage(error) {
  return [
    `Payment Declined: ${error.code}`,
    [
      `Message: ${error.message}`,
      `Error Code: ${error.code}`,
      `Error Code Details: ${error.doc_url}`,
      `-----`,
      `Stripe Charge ID: ${error.charge}`,
      `Stripe Request ID: ${error.requestId}`,
    ].join("\n")
  ];
}