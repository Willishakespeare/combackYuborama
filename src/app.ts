import express from "express";
import morgan from "morgan";
import cors from "cors";
import passport from "passport";
import swaggerUi from "swagger-ui-express";
import middlePassport from "./middlewares/passport";
import dotenv from "dotenv";
import * as swaggerDocument from "./swagger.json";
dotenv.config();
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import packRoutes from "./routes/packs.routes";
import appoimentsRoutes from "./routes/appoiments.routes";
import feedbackRoutes from "./routes/feedback.routes";
import diagnosicRoutes from "./routes/diagnostic.routes";
import conditionRoutes from "./routes/condition.routes";
import paymentRoutes from "./routes/payment.routes";
import skillsRoutes from "./routes/skills.routes";
import settingsRoutes from "./routes/settings.routes";
import observationRoutes from "./routes/observation.routes";

//init
const app = express();

//sett
app.set("port", process.env.PORT || 4000);

//middle
const allowedOrigins = [
  "http://localhost:3000",
  "https://come-back-front.vercel.app/",
];
const options: cors.CorsOptions = {
  origin: allowedOrigins,
};
app.use(morgan("dev"));
app.use(cors(options));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(passport.initialize());
passport.use(middlePassport);

//routes
app.get("/", (req, res) => {
  res.send(`Api is in port ${app.get("port")}`);
});

app.use(express.static("public"));
app.use(authRoutes);
app.use(userRoutes);
app.use(skillsRoutes);
app.use(packRoutes);
app.use(paymentRoutes);
app.use(conditionRoutes);
app.use(appoimentsRoutes);
app.use(feedbackRoutes);
app.use(diagnosicRoutes);
app.use(observationRoutes);
app.use(settingsRoutes);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default app;
