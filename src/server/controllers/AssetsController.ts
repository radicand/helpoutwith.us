import * as Hapi from 'hapi';
import * as path from 'path';
import IController from './IController';

class AssetsController implements IController {
  public mapRoutes(server: Hapi.Server): void {
    server.route({
      method: 'GET',
      path: '/assets/{file*}',
      handler: (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
        const file: string = path.resolve(`${process.env.WEB_ROOT}${request.path}`);

        return (h as any).file(file);
      },
    });
  }
}

export default AssetsController;
