import { useCallback, useEffect, useId, useState, type FormEvent } from 'react';
import { goalRepository, type GoalRepository } from './data/goalRepository';
import type { CreateGoalInput, Goal } from './domain/goal';

type View = 'today' | 'goals' | 'archive';

const navigation: Array<{ id: View; label: string }> = [
  { id: 'today', label: 'Сегодня' },
  { id: 'goals', label: 'Цели' },
  { id: 'archive', label: 'Архив' },
];

interface AppProps {
  repository?: GoalRepository;
}

interface GoalFormProps {
  isSaving: boolean;
  error: string | null;
  onCancel(): void;
  onSubmit(input: CreateGoalInput): Promise<void>;
}

function GoalForm({ isSaving, error, onCancel, onSubmit }: GoalFormProps) {
  const titleId = useId();
  const descriptionId = useId();
  const areaId = useId();
  const dateId = useId();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [area, setArea] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setValidationError('Введите название цели.');
      return;
    }

    setValidationError(null);
    await onSubmit({ title, description, area, targetDate });
  }

  const visibleError = validationError ?? error;

  return (
    <div className="dialog-backdrop" role="presentation">
      <section
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-goal-title"
      >
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">Новая цель</p>
            <h2 id="new-goal-title">Что вы хотите изменить?</h2>
          </div>
          <button
            className="icon-button"
            type="button"
            aria-label="Закрыть"
            onClick={onCancel}
            disabled={isSaving}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor={titleId}>
            Название <span aria-hidden="true">*</span>
          </label>
          <input
            id={titleId}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            autoFocus
            maxLength={160}
            aria-invalid={Boolean(visibleError)}
            aria-describedby={visibleError ? `${titleId}-error` : undefined}
          />
          {visibleError && (
            <p className="form-error" id={`${titleId}-error`} role="alert">
              {visibleError}
            </p>
          )}

          <label htmlFor={descriptionId}>Описание</label>
          <textarea
            id={descriptionId}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            maxLength={2000}
          />

          <div className="form-grid">
            <div>
              <label htmlFor={areaId}>Категория</label>
              <input
                id={areaId}
                value={area}
                onChange={(event) => setArea(event.target.value)}
                maxLength={80}
                placeholder="Например, здоровье"
              />
            </div>
            <div>
              <label htmlFor={dateId}>Целевая дата</label>
              <input
                id={dateId}
                type="date"
                value={targetDate}
                onChange={(event) => setTargetDate(event.target.value)}
              />
            </div>
          </div>

          <div className="dialog-actions">
            <button
              className="text-action"
              type="button"
              onClick={onCancel}
              disabled={isSaving}
            >
              Отмена
            </button>
            <button
              className="primary-action"
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? 'Сохраняем…' : 'Создать цель'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function formatTargetDate(value: string | null) {
  if (!value) return null;

  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
}

function App({ repository = goalRepository }: AppProps) {
  const [view, setView] = useState<View>('goals');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadGoals = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      setGoals(await repository.listActive());
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : 'Не удалось открыть локальные данные.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    let isCancelled = false;

    repository
      .listActive()
      .then((loadedGoals) => {
        if (!isCancelled) setGoals(loadedGoals);
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : 'Не удалось открыть локальные данные.',
          );
        }
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [repository]);

  async function createGoal(input: CreateGoalInput) {
    setIsSaving(true);
    setSaveError(null);

    try {
      const goal = await repository.create(input);
      setGoals((current) => [...current, goal]);
      setIsFormOpen(false);
      setView('goals');
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : 'Не удалось сохранить цель.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  function openForm() {
    setSaveError(null);
    setIsFormOpen(true);
  }

  const today = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Основная навигация">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            GK
          </span>
          <span>Goal Keeper</span>
        </div>

        <nav>
          {navigation.map((item) => (
            <button
              className={
                item.id === view ? 'nav-item nav-item-active' : 'nav-item'
              }
              type="button"
              key={item.id}
              onClick={() => setView(item.id)}
              aria-current={item.id === view ? 'page' : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button className="secondary-action" type="button" onClick={openForm}>
          Новая цель
        </button>
      </aside>

      <main className="content">
        <header className="page-header">
          <div>
            <p className="eyebrow">
              {view === 'today' ? today : 'Goal Keeper'}
            </p>
            <h1>{navigation.find((item) => item.id === view)?.label}</h1>
          </div>
          {view === 'goals' && (
            <button className="primary-action" type="button" onClick={openForm}>
              Новая цель
            </button>
          )}
        </header>

        {view === 'goals' && (
          <section className="view-section" aria-live="polite">
            {isLoading && (
              <p className="status-message">Открываем ваши цели…</p>
            )}

            {!isLoading && loadError && (
              <div className="error-state" role="alert">
                <h2>Не удалось открыть цели</h2>
                <p>{loadError}</p>
                <button
                  className="secondary-action"
                  type="button"
                  onClick={loadGoals}
                >
                  Попробовать снова
                </button>
              </div>
            )}

            {!isLoading && !loadError && goals.length === 0 && (
              <section className="empty-state" aria-labelledby="empty-title">
                <div className="empty-icon" aria-hidden="true">
                  ✓
                </div>
                <h2 id="empty-title">Добавьте первую цель</h2>
                <p>
                  Начните с короткого названия. Этапы и небольшие шаги можно
                  будет добавить после сохранения.
                </p>
                <button
                  className="primary-action"
                  type="button"
                  onClick={openForm}
                >
                  Создать цель
                </button>
              </section>
            )}

            {!isLoading && !loadError && goals.length > 0 && (
              <div className="goal-grid">
                {goals.map((goal) => (
                  <article className="goal-card" key={goal.id}>
                    <div className="goal-card-heading">
                      <span
                        className="goal-accent"
                        style={{
                          backgroundColor: goal.accentColor ?? '#5f8174',
                        }}
                        aria-hidden="true"
                      />
                      {goal.area && (
                        <span className="goal-area">{goal.area}</span>
                      )}
                    </div>
                    <h2>{goal.title}</h2>
                    {goal.description && <p>{goal.description}</p>}
                    <div className="goal-progress">
                      <div className="progress-label">
                        <span>Прогресс</span>
                        <span>0%</span>
                      </div>
                      <div className="progress-track" aria-label="Прогресс: 0%">
                        <span />
                      </div>
                    </div>
                    <p className="goal-meta">
                      {goal.targetDate
                        ? `До ${formatTargetDate(goal.targetDate)}`
                        : 'Без целевой даты'}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {view === 'today' && (
          <section className="empty-state" aria-labelledby="today-empty-title">
            <div className="empty-icon" aria-hidden="true">
              ✓
            </div>
            <h2 id="today-empty-title">На сегодня шагов нет</h2>
            <p>Здесь появятся просроченные шаги и шаги с датой на сегодня.</p>
          </section>
        )}

        {view === 'archive' && (
          <section
            className="empty-state"
            aria-labelledby="archive-empty-title"
          >
            <div className="empty-icon" aria-hidden="true">
              ◷
            </div>
            <h2 id="archive-empty-title">Архив пока пуст</h2>
            <p>Завершённые и архивированные цели будут доступны здесь.</p>
          </section>
        )}
      </main>

      {isFormOpen && (
        <GoalForm
          isSaving={isSaving}
          error={saveError}
          onCancel={() => setIsFormOpen(false)}
          onSubmit={createGoal}
        />
      )}
    </div>
  );
}

export default App;
