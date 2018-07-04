import * as Hapi from 'hapi';
import * as HapiAlive from 'hapi-alive';

class HapiAlivePlugin {
  public get plugin(): Hapi.ServerRegisterPluginObject<any> {
    return {
      plugin: HapiAlive,
      options: {
        path: '/health', //Health route path
        tags: [ 'health', 'monitor' ],
        async healthCheck(/* server */) {
          //Here you should preform your health checks
          //If something went wrong , throw an error.
          //   if (somethingFailed) {
          //     throw new Error('Server not healthy');
          //   }

          return true;
        },
      },
    };
  }
}

export default HapiAlivePlugin;
