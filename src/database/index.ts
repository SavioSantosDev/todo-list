import { Connection, createConnection, getConnectionOptions } from 'typeorm';

export default async (): Promise<Connection> => {
  const defaultOptions = await getConnectionOptions();

  // Use test database for test running mode
  return createConnection(
    Object.assign(defaultOptions, {
      database:
        process.env.NODE_ENV === 'test'
          ? './src/database/database.test.sqlite'
          : defaultOptions.database,
    }),
  );
};
