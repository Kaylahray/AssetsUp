/ src/migrations/1234567890123-CreateCategoryTable.ts
/\*
import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateCategoryTable1234567890123 implements MigrationInterface {
public async up(queryRunner: QueryRunner): Promise<void> {
await queryRunner.createTable(
new Table({
name: 'categories',
columns: [
{
name: 'id',
type: 'uuid',
isPrimary: true,
generationStrategy: 'uuid',
default: 'uuid_generate_v4()',
},
{
name: 'name',
type: 'varchar',
length: '100',
isUnique: true,
},
{
name: 'description',
type: 'text',
isNullable: true,
},
{
name: 'iconUrl',
type: 'varchar',
length: '500',
isNullable: true,
},
{
name: 'parentId',
type: 'uuid',
isNullable: true,
},
{
name: 'createdAt',
type: 'timestamp',
default: 'CURRENT_TIMESTAMP',
},
{
name: 'updatedAt',
type: 'timestamp',
default: 'CURRENT_TIMESTAMP',
onUpdate: 'CURRENT_TIMESTAMP',
},
],
foreignKeys: [
{
columnNames: ['parentId'],
referencedTableName: 'categories',
referencedColumnNames: ['id'],
onDelete: 'CASCADE',
},
],
}),
true,
);

    await queryRunner.createIndex(
      'categories',
      new Index('IDX_categories_name', ['name'], { isUnique: true }),
    );

    await queryRunner.createIndex(
      'categories',
      new Index('IDX_categories_parentId', ['parentId']),
    );

}

public async down(queryRunner: QueryRunner): Promise<void> {
await queryRunner.dropTable('categories');
}
}
\*/

// Usage example in app.module.ts
/\*
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from './category/category.module';

@Module({
imports: [
TypeOrmModule.forRoot({
type: 'postgres', // or 'mysql', 'sqlite', etc.
host: 'localhost',
port: 5432,
username: 'your_username',
password: 'your_password',
database: 'your_database',
entities: [__dirname + '/**/*.entity{.ts,.js}'],
synchronize: true, // Set to false in production
}),
CategoryModule,
],
})
export class AppModule {}
\*/
