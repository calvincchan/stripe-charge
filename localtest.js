const dotenv = require("dotenv");
const handler = require("./src/index.js").handler;

const EVENT_JSON_FILE = './events/test1.json';

/** Lambda handler */
const main = async () => {
  dotenv.config();
  process.env.LOCAL_TEST = true;
  console.time('localTest');
  const event = require(EVENT_JSON_FILE);
  console.dir(await handler(event));
  console.timeEnd('localTest');
};

main().catch(console.error);