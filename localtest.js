import * as dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import { handler } from "./src/index.js";

const EVENT_JSON_FILE = './events/test1.json';

/** Lambda handler */
const main = async () => {
  dotenv.config();
  process.env.LOCAL_TEST = true;
  console.time('localTest');
  const event = JSON.parse(
    await readFile(EVENT_JSON_FILE)
  );
  console.dir(await handler(event));
  console.timeEnd('localTest');
};

main().catch(console.error);