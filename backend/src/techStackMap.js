export const techStackMap = {
  // Frontend Frameworks & Libraries
  React: { dependencies: ['react'] },
  'Vue.js': { dependencies: ['vue'] },
  Angular: { dependencies: ['@angular/core', 'angular'] },
  Svelte: { dependencies: ['svelte'] },
  'Next.js': { dependencies: ['next'] },
  Nuxt: { dependencies: ['nuxt'] },
  Remix: { dependencies: ['remix'] },
  Preact: { dependencies: ['preact'] },
  SolidJS: { dependencies: ['solid-js'] },
  AlpineJS: { dependencies: ['alpinejs'] },

  // Styling & UI Frameworks
  'Tailwind CSS': { dependencies: ['tailwindcss', '@tailwindcss/vite'] },
  Bootstrap: { dependencies: ['bootstrap'] },
  MUI: { dependencies: ['@mui/material'] },
  ChakraUI: { dependencies: ['@chakra-ui/react'] },
  SCSS: { dependencies: ['sass'] },
  AntDesign: { dependencies: ['antd'] },
  Emotion: { dependencies: ['@emotion/react'] },
  StyledComponents: { dependencies: ['styled-components'] },
  Bulma: { dependencies: ['bulma'] },

  // State Management
  Redux: { dependencies: ['redux', '@reduxjs/toolkit'] },
  Zustand: { dependencies: ['zustand'] },
  Recoil: { dependencies: ['recoil'] },
  Jotai: { dependencies: ['jotai'] },
  MobX: { dependencies: ['mobx'] },
  Effector: { dependencies: ['effector'] },
  XState: { dependencies: ['xstate'] },

  // Backend Frameworks
  'Express.js': { dependencies: ['express'] },
  'Koa.js': { dependencies: ['koa'] },
  NestJS: { dependencies: ['@nestjs/core'] },
  Hapi: { dependencies: ['@hapi/hapi'] },
  Django: { keywords: ['django'] },
  Flask: { keywords: ['flask'] },
  FastAPI: { keywords: ['fastapi'] },
  SpringBoot: { keywords: ['spring-boot'] },
  Laravel: { keywords: ['laravel'] },
  RubyOnRails: { keywords: ['rails'] },
  ASPNet: { keywords: ['asp.net'] },

  // Databases & ORMs
  MongoDB: { dependencies: ['mongoose'] },
  PostgreSQL: { dependencies: ['pg', 'typeorm'] },
  MySQL: { dependencies: ['mysql', 'mysql2'] },
  SQLite: { dependencies: ['sqlite3'] },
  Prisma: { dependencies: ['@prisma/client'] },
  Sequelize: { dependencies: ['sequelize'] },
  Mongoose: { dependencies: ['mongoose'] },
  Redis: { dependencies: ['redis'] },
  Supabase: { dependencies: ['@supabase/supabase-js'] },
  CouchDB: { keywords: ['couchdb'] },
  DynamoDB: { dependencies: ['aws-sdk'] },

  // Auth & Security
  Auth0: { dependencies: ['@auth0/auth0-react'] },
  Firebase: { dependencies: ['firebase'] },
  Passport: { dependencies: ['passport'] },
  Bcrypt: { dependencies: ['bcrypt'] },
  JWT: { dependencies: ['jsonwebtoken'] },
  Okta: { dependencies: ['@okta/okta-auth-js'] },
  Clerk: { dependencies: ['@clerk/clerk-react'] },

  // API & Networking
  Axios: { dependencies: ['axios'] },
  GraphQL: { dependencies: ['graphql'] },
  Apollo: { dependencies: ['@apollo/client'] },
  tRPC: { dependencies: ['@trpc/server'] },
  SWR: { dependencies: ['swr'] },
  ReactQuery: { dependencies: ['@tanstack/react-query'] },
  RESTClient: { dependencies: ['superagent'] },

  // Build Tools
  Webpack: { dependencies: ['webpack'] },
  Vite: { dependencies: ['vite'] },
  Rollup: { dependencies: ['rollup'] },
  Babel: { dependencies: ['@babel/core'] },
  TypeScript: { dependencies: ['typescript'] },
  ESLint: { dependencies: ['eslint'] },
  Prettier: { dependencies: ['prettier'] },
  Parcel: { dependencies: ['parcel'] },
  Turbopack: { dependencies: ['@turbo/pack'] },
  NX: { dependencies: ['nx'] },

  // Testing Frameworks
  Jest: { dependencies: ['jest'] },
  Mocha: { dependencies: ['mocha'] },
  Cypress: { dependencies: ['cypress'] },
  Vitest: { dependencies: ['vitest'] },
  Playwright: { dependencies: ['@playwright/test'] },
  TestingLibrary: { dependencies: ['@testing-library/react'] },
  MSW: { dependencies: ['msw'] },

  // Realtime & WebSocket
  SocketIO: { dependencies: ['socket.io'] },
  Pusher: { dependencies: ['@pusher/push-notifications-web'] },
  Ably: { dependencies: ['ably'] },
  PubNub: { dependencies: ['pubnub'] },

  // DevOps / Hosting
  Docker: { keywords: ['docker'] },
  Vercel: { keywords: ['vercel'] },
  Netlify: { keywords: ['netlify'] },
  Heroku: { keywords: ['heroku'] },
  Railway: { keywords: ['railway'] },
  AWS: { keywords: ['aws-sdk'] },
  GCP: { keywords: ['@google-cloud'] },
  Azure: { keywords: ['@azure'] },

  // Mobile & Hybrid
  ReactNative: { dependencies: ['react-native'] },
  Expo: { dependencies: ['expo'] },
  Capacitor: { dependencies: ['@capacitor/core'] },
  Ionic: { dependencies: ['@ionic/react'] },
  Flutter: { keywords: ['flutter'] },
  NativeScript: { keywords: ['nativescript'] },

  // AI / ML Libraries
  TensorFlow: { keywords: ['tensorflow'] },
  PyTorch: { keywords: ['torch'] },
  ScikitLearn: { keywords: ['sklearn'] },
  Pandas: { keywords: ['pandas'] },
  NumPy: { keywords: ['numpy'] },
  OpenCV: { keywords: ['cv2', 'opencv'] },
  LangChain: { dependencies: ['langchain'] },
  Transformers: { dependencies: ['@huggingface/transformers'] },
  OpenAI: { dependencies: ['openai'] }
};