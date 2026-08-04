import type { Breed } from '../../services/cat/cat.model.ts';
import { BreedCard } from '../BreedCard/BreedCard.tsx';
import styles from './BreedList.module.css';

interface BreedListProps {
  breeds: Breed[];
}

export function BreedList({ breeds }: BreedListProps) {
  return (
    <div className={styles.grid}>
      {breeds.map((breed) => (
        <BreedCard key={breed.id} breed={breed} />
      ))}
    </div>
  );
}
