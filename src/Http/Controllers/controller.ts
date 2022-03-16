import AuthMiddleware from '../Middleware/AuthMiddleware';

class Controller {
    protected AuthMiddleware = AuthMiddleware
}

export default Controller;