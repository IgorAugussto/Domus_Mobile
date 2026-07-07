import 'axios';

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _silentAuth?: boolean;
  }

  interface AxiosRequestConfig {
    _silentAuth?: boolean;
  }
}
