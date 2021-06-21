import { Strategy, ExtractJwt, StrategyOptions } from "passport-jwt";
import config from "../config/config";

const opts: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.JWTSecret,
};

export default new Strategy(opts, async (payload, done) => {
  if (payload) {
    return done(null, payload);
  }
  return done(null, false);
});
