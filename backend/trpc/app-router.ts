import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import createUserRoute from "./routes/users/create/route";
import getUserRoute from "./routes/users/get/route";
import updateUserRoute from "./routes/users/update/route";
import getCountRoute from "./routes/count/get/route";
import exportDataRoute from "./routes/admin/export/route";
import signupRoute from "./routes/auth/signup/route";
import loginRoute from "./routes/auth/login/route";
import submitFeedbackRoute from "./routes/feedback/submit/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  users: createTRPCRouter({
    create: createUserRoute,
    get: getUserRoute,
    update: updateUserRoute,
  }),
  auth: createTRPCRouter({
    signup: signupRoute,
    login: loginRoute,
  }),
  feedback: createTRPCRouter({
    submit: submitFeedbackRoute,
  }),
  count: createTRPCRouter({
    get: getCountRoute,
  }),
  admin: createTRPCRouter({
    export: exportDataRoute,
  }),
});

export type AppRouter = typeof appRouter;
