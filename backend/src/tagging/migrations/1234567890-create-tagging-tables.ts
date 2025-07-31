import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateTaggingTables1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create tags table
    await queryRunner.createTable(
      new Table({
        name: 'tags',
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
          },
          {
            name: 'description',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'colorHex',
            type: 'varchar',
            length: '7',
            default: "'#3B82F6'",
          },
          {
            name: 'createdBy',
            type: 'uuid',
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
      }),
    );

    // Create tagged_resources table
    await queryRunner.createTable(
      new Table({
        name: 'tagged_resources',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tagId',
            type: 'uuid',
          },
          {
            name: 'resourceId',
            type: 'uuid',
          },
          {
            name: 'resourceType',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'taggedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['tagId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'tags',
            onDelete: 'CASCADE',
          },
        ],
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'tags',
      new Index('IDX_tags_name_createdBy', ['name', 'createdBy'], { isUnique: true }),
    );

    await queryRunner.createIndex(
      'tagged_resources',
      new Index('IDX_tagged_resources_resource', ['resourceId', 'resourceType']),
    );

    await queryRunner.createIndex(
      'tagged_resources',
      new Index('IDX_tagged_resources_unique', ['tagId', 'resourceId', 'resourceType'], {
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('tagged_resources');
    await queryRunner.dropTable('tags');
  }
}