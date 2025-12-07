import { OAuth2Client, TokenPayload } from "google-auth-library";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string; // Type assertion
export const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Specify the return type as TokenPayload
export const verifyGoogleToken = async (token: string): Promise<TokenPayload | undefined> => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload(); // email, name, picture, sub (id)
  return payload;
};
