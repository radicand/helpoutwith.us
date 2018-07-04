import * as Hapi from 'hapi';
import * as laabr from 'laabr';

class HapiLaabrPlugin {
  public get plugin(): Hapi.ServerRegisterPluginObject<any> {
    return {
      plugin: laabr,
      options: {
        formats: { onPostStart: ':time :start :level :message' },
        tokens: { start: () => '[start]' },
        indent: 0,
        colored: true,
      },
    };
  }
}

export default HapiLaabrPlugin;
