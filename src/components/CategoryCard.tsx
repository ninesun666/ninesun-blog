import React from 'react';
import styles from './CategoryCard.module.css';

interface CategoryCardProps {
  id: string;
  name: string;
  icon?: string;
  count: number;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  id, name, icon, count, onDragStart, onDragEnd
}) => {
  return (
    <div 
      className={styles.card}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <h3 className={styles.name}>{name}</h3>
      <span className={styles.count}>{count} 篇文章</span>
    </div>
  );
};
