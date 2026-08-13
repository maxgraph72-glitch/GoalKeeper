import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { GoalRepository } from './data/goalRepository';
import type { Goal } from './domain/goal';
import App from './App';

afterEach(cleanup);

function createRepository(goals: Goal[] = []): GoalRepository {
  return {
    listActive: vi.fn().mockResolvedValue(goals),
    create: vi.fn().mockImplementation(async (input) => ({
      id: 'goal-1',
      title: input.title.trim(),
      description: input.description?.trim() || null,
      area: input.area?.trim() || null,
      targetDate: input.targetDate || null,
      accentColor: null,
      status: 'active',
      createdAt: '2026-08-13T03:00:00.000Z',
      updatedAt: '2026-08-13T03:00:00.000Z',
    })),
  };
}

describe('App', () => {
  it('показывает спокойное пустое состояние списка целей', async () => {
    render(<App repository={createRepository()} />);

    expect(
      await screen.findByRole('heading', { name: 'Добавьте первую цель' }),
    ).toBeInTheDocument();
  });

  it('создаёт цель и сразу показывает её в списке', async () => {
    const repository = createRepository();
    render(<App repository={repository} />);

    fireEvent.click(
      await screen.findByRole('button', { name: 'Создать цель' }),
    );
    fireEvent.change(screen.getByLabelText(/Название/), {
      target: { value: '  Подготовить поездку  ' },
    });
    fireEvent.change(screen.getByLabelText('Категория'), {
      target: { value: 'Личное' },
    });
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Создать цель',
      }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Подготовить поездку' }),
    ).toBeInTheDocument();
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: '  Подготовить поездку  ' }),
    );
  });

  it('сохраняет введённые данные при ошибке записи', async () => {
    const repository = createRepository();
    vi.mocked(repository.create).mockRejectedValueOnce(
      new Error('Не удалось сохранить цель.'),
    );
    render(<App repository={repository} />);

    fireEvent.click(
      await screen.findByRole('button', { name: 'Создать цель' }),
    );
    const title = screen.getByLabelText(/Название/);
    fireEvent.change(title, { target: { value: 'Важная цель' } });
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Создать цель',
      }),
    );

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Не удалось сохранить цель.',
      ),
    );
    expect(title).toHaveValue('Важная цель');
  });
});
