import { InspectionItem } from '@/types/inspection';

// For each item_id across all inspections, average scores from neighborhoods that scored it.
// Items scored in only one neighborhood take that score directly.
export const mergeAuditItems = (allItems: InspectionItem[][]): InspectionItem[] => {
  const itemMap = new Map<string, { item: InspectionItem; scores: number[] }>();

  for (const inspectionItems of allItems) {
    for (const item of inspectionItems) {
      if (!itemMap.has(item.id)) {
        itemMap.set(item.id, { item: { ...item }, scores: [] });
      }
      if (item.score !== null && item.score !== 'N/O' && typeof item.score === 'number') {
        itemMap.get(item.id)!.scores.push(item.score);
      }
    }
  }

  return Array.from(itemMap.values()).map(({ item, scores }) => ({
    ...item,
    score: scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : null
  }));
};

// Calculate composite audit score from multiple inspections using the same
// weighted-category logic as single inspections. Returns a 0–3.52 value.
export const calculateAuditScore = (allItems: InspectionItem[][]): number => {
  if (allItems.length === 0) return 0;
  const merged = mergeAuditItems(allItems);

  const categoryScores = new Map<string, { totalScore: number; weight: number; itemCount: number }>();

  for (const item of merged) {
    if (item.score !== null && typeof item.score === 'number') {
      if (!categoryScores.has(item.category)) {
        categoryScores.set(item.category, { totalScore: 0, weight: item.weight, itemCount: 0 });
      }
      const cat = categoryScores.get(item.category)!;
      cat.totalScore += item.score;
      cat.itemCount += 1;
    }
  }

  let weightedSum = 0;
  let totalWeights = 0;

  categoryScores.forEach(({ totalScore, weight, itemCount }) => {
    if (itemCount > 0) {
      const avg = totalScore / itemCount;
      const converted = (avg / 4) * 3.52;
      weightedSum += converted * weight;
      totalWeights += weight;
    }
  });

  return totalWeights > 0 ? weightedSum / totalWeights : 0;
};
