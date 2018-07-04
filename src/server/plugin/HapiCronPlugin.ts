import * as Hapi from 'hapi';
import * as HapiCron from 'hapi-cron';

class HapiCronPlugin {
  public get plugin(): Hapi.ServerRegisterPluginObject<any> {
    const jobs = [
      {
        name: 'mySpotsNotification',
        time: '0 0 23 * * *',
        // time: '0 * * * * *', // debugging
        timezone: 'UTC',
        request: {
          method: 'POST',
          url: '/notifications/mySpots',
          headers: {
            Authorization: `Bearer ${process.env.ROOT_TOKEN}`,
          },
        },
        onError: () => {
          console.info('mySpots notification ran into an error');
        },
        onSuccess: (res: any) => {
          console.info('mySpots notification returned', res);
        },
      },
    ];

    return {
      plugin: HapiCron,
      options: { jobs },
    };
  }
}

export default HapiCronPlugin;
