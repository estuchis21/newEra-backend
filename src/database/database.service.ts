
import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import { Pool, PoolClient } from 'pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService
  implements OnModuleInit, OnModuleDestroy {

  private pool: Pool;

  constructor(
    private readonly config: ConfigService,
  ) {
    this.pool = new Pool({
      host: this.config.get<string>('database.host'),
      port: this.config.get<number>('database.port'),
      database: this.config.get<string>('database.database'),
      user: this.config.get<string>('database.user'),
      password: this.config.get<string>('database.password'),
      max: this.config.get<number>('database.max'),

      // Neon requiere conexión SSL.
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  async onModuleInit() {
    await this.pool.query('SELECT NOW()');

    console.log('PostgreSQL conectado');
  }

  async query(
    sql: string,
    params?: any[],
  ) {
    return this.pool.query(sql, params);
  }

  async getConnection(): Promise<PoolClient> {
    return this.pool.connect();
  }

  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const result = await callback(client);

      await client.query('COMMIT');

      return result;
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error(
          'Error ejecutando ROLLBACK:',
          rollbackError,
        );
      }

      throw error;
    } finally {
      client.release();
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
