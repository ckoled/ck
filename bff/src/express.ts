import express, { NextFunction, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { expressjwt as jwt, Request } from 'express-jwt';

import config from './config';
import routes from './routes';
import { createContext, currentContext } from './context';
import { ApiError, Errors } from './errors';

export const useApp = async () => {
  const app = express()

  // middleware
  app.use(helmet());
  app.use(cookieParser(config.signed.cookie.secret))
  app.use(cors());
  app.use(express.json());
  app.use((req, res, next) => {
    createContext(next, { req, res })
  });
  app.use(jwt({secret: config.jwt.secret, algorithms: ['HS256']}).unless({
    path: [
      /^\/socket.io.*/,

      // API paths.
      /^\/api\/(v\d+\/)?auth\/login/,
      /^\/api\/(v\d+\/)?auth\/register/,
    ]
  }));
  app.use((req: Request, res, next) => {
    const ctx = currentContext();
    const { auth } = req;
    if (auth) {
      ctx.userId = auth.sub;
      ctx.appId = auth.appId;
    } else {
      ctx.userId = '00000000-0000-0000-0000-000000000000';
    }
    next();
  });

  // define a route handler for the default home page
  app.use("/api", routes);

  app.use((req, res, next) => {
    const err = new ApiError(Errors.API);
    return next(err);
  });

  app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    let err = error;
    if (!(error instanceof ApiError)) {
      err = new ApiError(Errors.API);
    }
    next(err);
  });

  app.use((err: ApiError, req: Request, res: Response, next: NextFunction) => {
    res.status(err.type.code).json({
      message: err.message,
      data: err.data,
      cId: currentContext().cId
    });
    next();
  });

  return app;
}