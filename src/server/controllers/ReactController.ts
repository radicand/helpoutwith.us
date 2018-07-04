import * as Hapi from 'hapi';
import * as path from 'path';
import IController from './IController';

class ReactController implements IController {
  public mapRoutes(server: Hapi.Server): void {
    server.route({
      method: 'GET',
      path: '/js/{file*}',
      handler: {
        directory: {
          path: path.resolve(`${process.env.WEB_ROOT}`),
        },
      },
    });

    server.route({
      method: 'GET',
      path: '/static/{file*}',
      handler: {
        directory: {
          path: path.resolve(`${process.env.WEB_ROOT}`),
        },
      },
    });

    server.route({
      method: 'GET',
      path: '/{route*}',
      handler: { file: path.resolve(`${process.env.WEB_ROOT}`, 'index.html') },
    });
  }
}

export default ReactController;
