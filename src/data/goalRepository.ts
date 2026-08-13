import { isTauri } from '@tauri-apps/api/core';
import Database from '@tauri-apps/plugin-sql';
import {
  normalizeCreateGoalInput,
  type CreateGoalInput,
  type Goal,
  type GoalStatus,
} from '../domain/goal';

const databaseUrl = 'sqlite:goal-keeper.db';

interface GoalRow {
  id: string;
  title: string;
  description: string | null;
  area: string | null;
  target_date: string | null;
  accent_color: string | null;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
}

export interface GoalRepository {
  listActive(): Promise<Goal[]>;
  create(input: CreateGoalInput): Promise<Goal>;
}

function ensureDesktopRuntime() {
  if (!isTauri()) {
    throw new Error(
      'Локальное хранилище доступно в desktop-приложении. Запустите npm run tauri dev.',
    );
  }
}

function toGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    area: row.area,
    targetDate: row.target_date,
    accentColor: row.accent_color,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function openDatabase() {
  ensureDesktopRuntime();
  return Database.load(databaseUrl);
}

export const goalRepository: GoalRepository = {
  async listActive() {
    const database = await openDatabase();
    const rows = await database.select<GoalRow[]>(
      `SELECT
        id,
        title,
        description,
        area,
        target_date,
        accent_color,
        status,
        created_at,
        updated_at
      FROM goals
      WHERE status = $1
      ORDER BY sort_order ASC, created_at ASC, id ASC`,
      ['active'],
    );

    return rows.map(toGoal);
  },

  async create(input) {
    const normalized = normalizeCreateGoalInput(input);
    const database = await openDatabase();
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    await database.execute(
      `INSERT INTO goals (
        id,
        title,
        description,
        area,
        target_date,
        accent_color,
        status,
        sort_order,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'active',
        COALESCE((SELECT MAX(sort_order) + 1 FROM goals WHERE status = 'active'), 0),
        $7, $7)`,
      [
        id,
        normalized.title,
        normalized.description,
        normalized.area,
        normalized.targetDate,
        normalized.accentColor,
        timestamp,
      ],
    );

    return {
      id,
      ...normalized,
      status: 'active',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  },
};
