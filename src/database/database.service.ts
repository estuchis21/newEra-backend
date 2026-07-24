import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import { Pool } from 'pg';
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

    });

  }


  async onModuleInit() {

    await this.pool.query(
      'SELECT NOW()'
    );

    console.log(
      'PostgreSQL conectado'
    );

  }


  async query(
    sql: string,
    params?: any[],
  ) {

    return this.pool.query(
      sql,
      params,
    );

  }


  async getConnection() {

    return this.pool.connect();

  }


  async onModuleDestroy() {

    await this.pool.end();

  }

}