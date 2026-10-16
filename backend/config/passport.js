import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

export const googleOAuthEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);

if (googleOAuthEnabled) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();

          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            if (!email)
              return done(null, false, { message: "No email from Google" });

            user = await User.findOne({ email });

            if (user) {
              user.googleId = profile.id;
              user.emailVerified = true;
              await user.save();
            } else {
              const base =
                email.split("@")[0].replace(/[^a-z0-9]/gi, "").toLowerCase() ||
                "user";
              let username = base;
              let n = 1;
              while (await User.findOne({ username }))
                username = `${base}${n++}`;

              user = await User.create({
                googleId: profile.id,
                email,
                username,
                fullName: profile.displayName || username,
                role: "applicant",
                emailVerified: true,
              });
            }
          }

          if (!user.active)
            return done(null, false, { message: "Account deactivated" });
          if (user.role !== "applicant")
            return done(null, false, { message: "Not an applicant account" });

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      },
    ),
  );
}

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
