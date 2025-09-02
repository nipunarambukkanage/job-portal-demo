import {
  HubConnection,
  HubConnectionBuilder,
  HttpTransportType,
  LogLevel,
} from '@microsoft/signalr';

export function createNotificationsHub(
  hubUrl: string,
  accessTokenFactory?: () => Promise<string> | string,
  logLevel: LogLevel = import.meta.env.DEV ? LogLevel.Information : LogLevel.Error
): HubConnection {
  const builder = new HubConnectionBuilder()
    .withUrl(hubUrl, {
      transport: HttpTransportType.WebSockets,
      skipNegotiation: true,
      accessTokenFactory: async () =>
        (typeof accessTokenFactory === 'function'
          ? await accessTokenFactory()
          : accessTokenFactory) || '',
    })
    .withAutomaticReconnect()
    .configureLogging(logLevel);

  return builder.build();
}
