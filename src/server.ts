import 'fetch-everywhere';
import * as inert from 'inert';
import ServerManager from './server/ServerManager';
import AssetsController from './server/controllers/AssetsController';
import NotificationsController from './server/controllers/NotificationsController';
import ReactController from './server/controllers/ReactController';
import HapiAlivePlugin from './server/plugin/HapiAlivePlugin';
import HapiCronPlugin from './server/plugin/HapiCronPlugin';
import HapiLaabrPlugin from './server/plugin/HapiLaabrPlugin';

export async function startServer() {
  console.log('Starting HTTP server...');

  const manager = new ServerManager();

  await manager.registerPlugin(inert);
  await manager.registerPlugin(new HapiCronPlugin().plugin);
  await manager.registerPlugin(new HapiLaabrPlugin().plugin);
  await manager.registerPlugin(new HapiAlivePlugin().plugin);

  manager.registerController(new AssetsController());
  manager.registerController(new NotificationsController());
  manager.registerController(new ReactController());

  await manager.startServer();
}

startServer();
