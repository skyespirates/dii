import { Strategy, StrategyOptions } from "passport-google-oauth20";
import { createUser, getUser } from "../repositories/user.repository";
import { Users } from "../types";

const googleOptions: StrategyOptions = {
  clientID: process.env.GOOGLE_ID!,
  clientSecret: process.env.GOOGLE_SECRET!,
  callbackURL: "/auth/google/callback",
};

const strategy = new Strategy(
  googleOptions,
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await getUser(profile.id);
      if (user == undefined) {
        const u: Users = {
          id: profile.id,
          display_name: profile.displayName,
          email: profile?.emails?.[0].value ?? "email is not provided",
          profile_photo:
            profile.photos?.[0].value ?? "profile photo is not provided",
          provider: "google",
        };
        const newUser = await createUser(u);
        if (!newUser) {
          throw new Error("failed to create user");
        }
        done(null, newUser);
      } else {
        return done(null, user);
      }
    } catch (error) {
      console.log(error);
      done(error);
    }
  }
);

export default strategy;
