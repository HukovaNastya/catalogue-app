import { Button } from '../Button/Button.tsx';
import { Select } from '../Select/Select.tsx';
import { Typography } from '../Typography/Typography.tsx';
import {
  GROOMING_BUCKETS,
  KIDS_OPTIONS,
  TRAIT_OPTIONS,
} from '../../utils/filterBreeds.ts';
import type { BreedFilters as Filters, Trait } from '../../utils/filterBreeds.ts';
import styles from './BreedFilters.module.css';

interface BreedFiltersProps {
  value: Filters;
  onChange: (next: Partial<Filters>) => void;
  origins: string[];
}

export function BreedFilters({ value, onChange, origins }: BreedFiltersProps) {
  const toggleGrooming = (levels: readonly number[], checked: boolean) => {
    const next = checked
      ? [...new Set([...value.grooming, ...levels])]
      : value.grooming.filter((level) => !levels.includes(level));

    onChange({ grooming: next.sort((a, b) => a - b) });
  };

  const toggleTrait = (trait: Trait, checked: boolean) => {
    onChange({
      traits: checked
        ? [...value.traits, trait]
        : value.traits.filter((current) => current !== trait),
    });
  };

  return (
    // Heading order follows the wireframe: most-used filter first.
    <form className={styles.panel}>
      <fieldset className={styles.group}>
        <Typography as="legend" variant="small" tone="strong">
          Good with kids
        </Typography>
        <div className={styles.segmented}>
          {KIDS_OPTIONS.map((rating) => {
            const active = value.kids === rating;

            return (
              <Button
                key={rating}
                variant={active ? 'primary' : 'secondary'}
                className={styles.segment}
                aria-pressed={active}
                // Pressing the active option clears it — the only way back to
                // "any" without a chip.
                onClick={() => onChange({ kids: active ? 0 : rating })}
              >
                {rating === 5 ? '5' : `${rating}+`}
              </Button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <Typography as="legend" variant="small" tone="strong">
          Grooming
        </Typography>
        {GROOMING_BUCKETS.map((bucket) => (
          <label key={bucket.id} className={styles.check}>
            <input
              type="checkbox"
              checked={bucket.levels.every((level) =>
                value.grooming.includes(level),
              )}
              onChange={(event) =>
                toggleGrooming(bucket.levels, event.target.checked)
              }
            />
            {bucket.label}
          </label>
        ))}
      </fieldset>

      <fieldset className={styles.group}>
        <Typography as="legend" variant="small" tone="strong">
          Traits
        </Typography>
        {TRAIT_OPTIONS.map((trait) => (
          <label key={trait.id} className={styles.check}>
            <input
              type="checkbox"
              checked={value.traits.includes(trait.id)}
              onChange={(event) => toggleTrait(trait.id, event.target.checked)}
            />
            {trait.label}
          </label>
        ))}
      </fieldset>

      <fieldset className={styles.group}>
        <Typography as="legend" variant="small" tone="strong">
          Origin
        </Typography>
        <Select
          value={value.origin}
          aria-label="Origin"
          onValueChange={(origin) => onChange({ origin })}
        >
          <option value="">Any</option>
          {origins.map((origin) => (
            <option key={origin} value={origin}>
              {origin}
            </option>
          ))}
        </Select>
      </fieldset>
    </form>
  );
}
