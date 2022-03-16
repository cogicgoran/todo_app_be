import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV}` })
import App from './app';

import AuthController from './Http/Controllers/AuthController';
import TodoController from './Http/Controllers/TodoController';
import WildcardController from './Http/Controllers/WildcardController';

// TODO: Add Sessions

const app = new App(
    [
        new AuthController,
        new TodoController,
        new WildcardController
    ],
    process.env.PORT);

app.listen();


