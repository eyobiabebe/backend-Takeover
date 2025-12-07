import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { User } from "../models/User";

// Minimal interface only for the fields we use
interface OAuthProfile {
  id: string;
  displayName?: string;
  name?: { givenName?: string; familyName?: string };
  emails?: { value: string }[];
}

async function findOrCreateUserFromProfile(
  profile: OAuthProfile,
  provider: string,
  done: (err: any, user?: any) => void
) {
  try {
    const email = profile.emails?.[0]?.value;

    let user = await User.findOne({ where: { provider, providerId: profile.id } });

    // Fallback: find by email
    if (!user && email) {
      user = await User.findOne({ where: { email } });
    }

    if (!user) {
      const fullName =
        profile.displayName ||
        `${profile.name?.givenName || ""} ${profile.name?.familyName || ""}`.trim();

      user = await User.create({
        name: fullName || "No Name",
        email: email || `${provider}-${profile.id}@noemail.local`,
        password: null,
        role: "member",
        provider,
        providerId: profile.id,
      } as any);
    } else {
      // Update provider info if missing
      if (!user.providerId) {
        user.provider = provider;
        user.providerId = profile.id;
        await user.save();
      }
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}

// ================= GOOGLE STRATEGY =================
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: `${process.env.BACKEND_URL || ""}/api/users/google/callback`,
    },
    (accessToken, refreshToken, profile: any, done) => {
      findOrCreateUserFromProfile(profile, "google", done);
    }
  )
);

// ================= FACEBOOK STRATEGY =================
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
      callbackURL: `${process.env.BACKEND_URL || ""}/api/users/facebook/callback`,
      profileFields: ["id", "emails", "name", "displayName"],
    },
    (accessToken, refreshToken, profile: any, done) => {
      findOrCreateUserFromProfile(profile, "facebook", done);
    }
  )
);

export default passport;
