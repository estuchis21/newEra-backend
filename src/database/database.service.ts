import {
    Injectable,
    OnModuleDestroy,
    OnModuleInit
} from '@nestjs/common';

import { Pool } from 'pg';

import { ConfigService } from '@nestjs/config';


@Injectable()
export class DatabaseService
implements OnModuleInit, OnModuleDestroy{


private pool:Pool;



constructor(
 private config:ConfigService
){


this.pool = new Pool({

host:this.config.get(
'database.host'
),

port:this.config.get(
'database.port'
),

database:this.config.get(
'database.database'
),

user:this.config.get(
'database.user'
),

password:this.config.get(
'database.password'
),

max:this.config.get(
'database.max'
)

});


}



async onModuleInit(){

await this.pool.query(
'SELECT NOW()'
);

console.log(
'PostgreSQL conectado'
);

}



query(
sql:string,
params?:any[]
){

return this.pool.query(
sql,
params
);

}



getConnection(){

return this.pool.connect();

}



async onModuleDestroy(){

await this.pool.end();

}


}