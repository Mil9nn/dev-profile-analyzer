// components/assessment/AnalysisSection.tsx
import React from 'react';
import type { ComponentType } from 'react';

interface AnalysisSectionProps {
  title: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  items: string[];
  iconColor: string;
  titleColor: string;
  itemIcon: ComponentType<{ size?: number; className?: string }>;
}

export const AnalysisSection: React.FC<AnalysisSectionProps> = ({
  title,
  icon: Icon,
  items,
  iconColor,
  titleColor,
  itemIcon: ItemIcon
}) => (
  <div className="rounded-sm border p-6">
    <h3 className={`text-xl font-bold ${titleColor} mb-4 flex items-center gap-2`}>
      <Icon className="w-5 h-5" />
      {title}
    </h3>
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={index} className="text-sm text-gray-400 flex items-start gap-2">
          <ItemIcon className={`w-4 h-4 ${iconColor} mt-0.5 flex-shrink-0`} />
          {item}
        </li>
      ))}
    </ul>
  </div>
);