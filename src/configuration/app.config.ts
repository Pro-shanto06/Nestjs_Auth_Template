import * as dotenv from 'dotenv';

dotenv.config();

export interface IConfig {
  port: number;
  mongodbURL: string;
  emailUser: string;
  emailPassword: string;
  jwtSecret: string;
  googleClientId: string;
  googleSecret: string;
  googleCallbackUrl: string;
}

const getAppConfig = (): IConfig => {
  const port = parseInt(process.env.PORT);
  const mongodbURL = process.env.MONGO_URL;
  const jwtSecret = process.env.JWT_SECRET;
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleSecret = process.env.GOOGLE_SECRET;
  const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL;


  if (!port) console.log('PORT must be specified');
  if (!mongodbURL) console.log('MONGO_URL must be specified');
  if (!jwtSecret) console.log('JWT_SECRET must be specified');
  if (!emailUser) console.log('EMAIL_USER must be specified');
  if (!emailPassword) console.log('EMAIL_PASSWORD must be specified');
  if (!googleClientId) console.log('GOOGLE_CLIENT_ID must be specified');
  if (!googleSecret) console.log('GOOGLE_CLIENT_SECRET must be specified');

  return {
    port,
    mongodbURL,
    jwtSecret,
    emailUser,
    emailPassword,
    googleClientId,
    googleSecret,
    googleCallbackUrl,
  };
};

export const appConfig = getAppConfig();
