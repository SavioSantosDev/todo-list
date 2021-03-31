import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTasksTable1617057497116 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'tasks',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'priority',
            type: 'varchar',
            length: '1',
          },
          {
            name: 'notes',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
          },
          {
            name: 'task_group_id',
            type: 'uuid',
          },
        ],
        foreignKeys: [
          {
            name: 'tasks',
            columnNames: ['task_group_id'],
            referencedTableName: 'task_groups',
            referencedColumnNames: ['id'],
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('tasks');
  }
}
