// @vitest-environment node

import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(
  new URL('../../src-tauri/migrations/0001_initial.sql', import.meta.url),
  'utf8',
);

describe('начальная SQLite-миграция', () => {
  it('создаёт схему и начальный этап вместе с целью', () => {
    const database = new DatabaseSync(':memory:');
    database.exec(migration);

    database
      .prepare(
        `INSERT INTO goals (
          id, title, status, sort_order, created_at, updated_at
        ) VALUES (?, ?, 'active', 0, ?, ?)`,
      )
      .run(
        'goal-1',
        'Подготовить поездку',
        '2026-08-13T03:00:00.000Z',
        '2026-08-13T03:00:00.000Z',
      );

    expect(
      database
        .prepare(
          'SELECT goal_id, title, sort_order FROM milestones WHERE goal_id = ?',
        )
        .get('goal-1'),
    ).toMatchObject({
      goal_id: 'goal-1',
      title: 'Основное',
      sort_order: 0,
    });

    database.close();
  });

  it('не принимает неизвестный статус цели', () => {
    const database = new DatabaseSync(':memory:');
    database.exec(migration);

    expect(() =>
      database
        .prepare(
          `INSERT INTO goals (
            id, title, status, sort_order, created_at, updated_at
          ) VALUES (?, ?, ?, 0, ?, ?)`,
        )
        .run(
          'goal-1',
          'Цель',
          'unknown',
          '2026-08-13T03:00:00.000Z',
          '2026-08-13T03:00:00.000Z',
        ),
    ).toThrow();

    database.close();
  });
});
