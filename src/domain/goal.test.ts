import { describe, expect, it } from 'vitest';
import { normalizeCreateGoalInput } from './goal';

describe('normalizeCreateGoalInput', () => {
  it('очищает текстовые значения и сохраняет дату в ISO-формате', () => {
    expect(
      normalizeCreateGoalInput({
        title: '  Подготовить поездку  ',
        description: '  Собрать план  ',
        area: '  Личное  ',
        targetDate: '2026-09-01',
      }),
    ).toEqual({
      title: 'Подготовить поездку',
      description: 'Собрать план',
      area: 'Личное',
      targetDate: '2026-09-01',
      accentColor: null,
    });
  });

  it('не принимает пустое название', () => {
    expect(() => normalizeCreateGoalInput({ title: '   ' })).toThrow(
      'Введите название цели.',
    );
  });
});
