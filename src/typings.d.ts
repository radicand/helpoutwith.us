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

declare module 'universal-cookie';

declare module 'fuse-box-graphql-plugin';

declare module 'react-cookie' {
  import * as React from 'react';

  export type Cookie = string;

  export class CookiesProvider extends React.Component<{ cookies?: any }, {}> {}

  export function withCookies<T extends ReactCookieProps>(Component: React.ComponentClass<T>): React.ComponentClass<T>;

  export interface ReactCookieGetOptions {
    doNotParse?: boolean;
  }

  export interface ReactCookieGetAllOptions {
    doNotParse?: boolean;
  }

  export interface ReactCookieSetOptions {
    path?: string;
    expires?: Date;
    maxAge?: number;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
  }

  export interface ReactCookieRemoveOptions {
    path?: string;
    expires?: Date;
    maxAge?: number;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
  }

  export type ReactCookieProps = {
    cookies?: {
      get: (key: string, options?: ReactCookieGetOptions) => Cookie;
      getAll: (options?: ReactCookieGetAllOptions) => Cookie[];
      set(name: string, value: string, options?: ReactCookieSetOptions): void;
      remove(name: string, options?: ReactCookieRemoveOptions): void;
    };
  };

  export class Cookies {
    constructor(serverCookies?: any);
    get: (key: string, options?: ReactCookieGetOptions) => Cookie;
    getAll: (options?: ReactCookieGetAllOptions) => Cookie[];
    set(name: string, value: string, options?: ReactCookieSetOptions): void;
    remove(name: string, options?: ReactCookieRemoveOptions): void;
  }
}

// declare.d.ts - make it nicely typed
declare module '*.graphql' {
  import { DocumentNode } from 'graphql';
  const dummyDocument: DocumentNode;
  export default dummyDocument;
}
