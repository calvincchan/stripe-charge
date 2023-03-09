# About the Project

This is a Lambda function that accepts a charge-token and charge-object generated from the client side HTML `https://checkout.stripe.com/checkout.js`. Full documentation of the charging process call be found in `https://stripe.com/docs/payments/checkout`.

## Local Testing

1. Install dependencies: `yarn install`

2. Configure env.js
   AWS_REGION
   SNS_ARN
   STRIPE_SECRET_KEY
   STRIPE_PUBLISHABLE_KEY

3. Check the `events/test1.json` for the test JSON that emulates a JSON call to the Lambda endpoint.

4. `yarn dev` to pass the JSON to the handler function and return the result.

## Deploy to AWS Lambda

1. Set up AWS CLI on your computer with proper credentials.

2. Create layer using the script `./create-layer.sh`.

3. Upload the handler function code with `./deploy.sh`.

(to be completed)

## Test AWS Lambda

(to be completed)
