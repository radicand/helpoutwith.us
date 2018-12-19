interface Window {
  gapi: any;
}

declare namespace NodeJS {
  interface Global {
    document: Document;
    window: Window;
    navigator: Navigator;
    gapi: any;
  }
}

declare var GC_URL: string;
declare var NODE_ENV: string;

declare module 'hapi-cron';
declare module 'hapijs-status-monitor';
declare module 'hapi-alive';
declare module 'laabr';

declare module 'react-jss';
declare module 'react-jss/lib/JssProvider';
declare module 'react-jss/lib/jss';

declare module 'lodash.flowright';

declare module 'fuse-box-graphql-plugin';

// declare.d.ts - make it nicely typed
declare module '*.graphql' {
  import { DocumentNode } from 'graphql';
  const dummyDocument: DocumentNode;
  export default dummyDocument;
}
