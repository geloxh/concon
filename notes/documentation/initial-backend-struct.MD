### Initial Backend Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   ├── redis.js              # Redis client setup
│   │   └── env.js                # centralized env validation
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Conversation.js
│   │   ├── Message.js
│   │   └── RefreshToken.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── conversation.controller.js
│   │   └── message.controller.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── conversation.routes.js
│   │   ├── message.routes.js
│   │   └── index.js               # mounts all routes under /api/v1
│   │
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── message.service.js
│   │   ├── upload.service.js      # S3/Cloudinary logic
│   │   └── notification.service.js
│   │
│   ├── sockets/
│   │   ├── index.js                # socket server init + redis adapter
│   │   ├── socketAuth.middleware.js
│   │   ├── handlers/
│   │   │   ├── message.handler.js
│   │   │   ├── presence.handler.js
│   │   │   └── typing.handler.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js      # JWT verification
│   │   ├── error.middleware.js
│   │   ├── rateLimiter.middleware.js
│   │   └── validate.middleware.js  # Zod/Joi validation wrapper
│   │
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── message.validator.js
│   │   └── conversation.validator.js
│   │
│   ├── jobs/
│   │   ├── queue.js                 # BullMQ queue setup
│   │   ├── notification.job.js
│   │   └── mediaProcessing.job.js
│   │
│   ├── utils/
│   │   ├── apiError.js
│   │   ├── apiResponse.js
│   │   ├── catchAsync.js
│   │   └── logger.js
│   │
│   ├── app.js                      # express app setup
│   └── server.js                   # http server + socket.io bootstrap
│
├── tests/
│   ├── auth.test.js
│   ├── message.test.js
│   └── socket.test.js
│
├── .env
├── .env.example
├── package.json
└── Dockerfile
```