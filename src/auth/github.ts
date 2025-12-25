import { Strategy, StrategyOptions } from "passport-github2";
import { createUser, getUser } from "../repositories/user.repository";
import { Users } from "../types";
import { env } from "../configs/env";
const githubOptions: StrategyOptions = {
  clientID: env.GITHUB_ID,
  clientSecret: env.GITHUB_SECRET,
  callbackURL: "/auth/github/callback",
};

const strategy = new Strategy(
  githubOptions,
  // @ts-ignore
  async (accessToken, refreshToken, profile, done) => {
    try {
      if (!profile) throw new Error("profile not found");
      const user = await getUser(profile.id);
      if (user == undefined) {
        const u: Users = {
          id: profile.id,
          display_name: profile.username,
          email: profile.emails[0].value,
          profile_photo: profile.photos[0].value,
          provider: "github",
        };
        const newUser = await createUser(u);
        if (!newUser) throw new Error("failed to create user");
        done(null, newUser);
      } else {
        done(null, user);
      }
    } catch (error) {
      done(error, null);
    }
  }
);

export default strategy;
