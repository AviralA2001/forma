import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from './projects/projects.module';
import { TablesModule } from './tables/tables.module';
import { Project } from './projects/entities/project.entity';
import { DevAuthMiddleware } from './common/dev-auth.middelware';
import { Table } from './tables/entities/table.entity';
import { Row } from './tables/entities/row.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'forma',
      entities: [Project, Table, Row],
      migrations: ['src/migrations/*.ts'],
      migrationsRun: true,
    }),
    ProjectsModule,
    TablesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(DevAuthMiddleware)
      .forRoutes('*');
  }
}