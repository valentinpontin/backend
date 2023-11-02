import dotenv from 'dotenv';

let envFileName = '.env';

export default function configureDotenv(env) {
  envFileName = env === 'dev' ? '.env' : `.env.${env}`;
  dotenv.config({ path: envFileName });
}

export { envFileName };
