
import { useInspection } from '@/contexts/InspectionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import InspectionItemPhoto from './InspectionItemPhoto';
import { useInspectionPhotos } from '@/hooks/useInspectionPhotos';

const scoreLabels = {
  'N/O': 'N/O',
  0: '0 – Poor',
  1: '1 – Below Avg',
  2: '2 – Average',
  3: '3 – Good',
  4: '4 – Excellent'
};

const scoreColors = {
  'N/O': 'bg-gray-500 hover:bg-gray-600',
  0: 'bg-red-500 hover:bg-red-600',
  1: 'bg-orange-500 hover:bg-orange-600',
  2: 'bg-yellow-500 hover:bg-yellow-600',
  3: 'bg-primary hover:bg-primary/90',
  4: 'bg-green-500 hover:bg-green-600'
};

interface InspectionCategoryFormProps {
  category: string;
}

const InspectionCategoryForm = ({ category }: InspectionCategoryFormProps) => {
  const { currentInspection, updateItemScore } = useInspection();
  const { addPhoto, removePhoto, getPhotosForItem } = useInspectionPhotos(currentInspection?.id || null);

  if (!currentInspection) return null;

  const categoryItems = currentInspection.items.filter(item => item.category === category);
  const completedItems = categoryItems.filter(item => item.score !== null).length;
  const categoryWeight = categoryItems[0]?.weight || 0;
  const subcategories = [...new Set(categoryItems.map(item => item.subcategory))].sort();

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Category Header */}
      <Card>
        <CardHeader className="pb-3 md:pb-6">
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg md:text-2xl">{category}</CardTitle>
              <Badge variant="secondary" className="mt-1.5 text-xs">
                Weight: {categoryWeight}
              </Badge>
            </div>
            <Badge variant="outline" className="text-sm md:text-lg px-2 md:px-4 py-1 md:py-2 flex-shrink-0">
              {completedItems}/{categoryItems.length}
            </Badge>
          </div>
          <CardDescription className="text-sm mt-1">
            Score 0–4 or N/O for each item
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Subcategories */}
      <div className="space-y-4 md:space-y-8">
        {subcategories.map((subcategory) => {
          const subcategoryItems = categoryItems.filter(item => item.subcategory === subcategory);

          return (
            <Card key={subcategory} className="border-l-4 border-primary">
              <CardHeader className="pb-2 md:pb-4">
                <CardTitle className="text-base md:text-xl text-primary">{subcategory}</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  {subcategoryItems.length} item{subcategoryItems.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                {subcategoryItems.map((inspectionItem) => (
                  <div key={inspectionItem.id} className="border rounded-lg p-3 md:p-6 bg-gray-50">
                    <h4 className="font-semibold text-sm md:text-lg text-gray-900 mb-3">
                      {inspectionItem.item}
                    </h4>

                    <div className="space-y-3 md:space-y-4">
                      {/* Score Buttons — 3-column on mobile, 6-column on desktop */}
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        {(['N/O', 0, 1, 2, 3, 4] as const).map((score) => {
                          const scoreKey = score as keyof typeof scoreColors;
                          const colorClass = scoreColors[scoreKey] || '';
                          const isDisabled =
                            score !== 'N/O' &&
                            inspectionItem.scoreDescriptions?.[score as keyof typeof inspectionItem.scoreDescriptions] === 'No score';
                          const isSelected = inspectionItem.score === score;

                          return (
                            <Button
                              key={score}
                              variant={isSelected ? 'default' : 'outline'}
                              onClick={() => updateItemScore(inspectionItem.id, score)}
                              className={`h-12 md:h-auto md:py-3 text-xs md:text-sm font-medium ${isSelected ? colorClass : ''}`}
                              disabled={isDisabled}
                            >
                              {scoreLabels[scoreKey]}
                            </Button>
                          );
                        })}
                      </div>

                      {/* Score descriptions */}
                      <div className="space-y-1.5 text-xs md:text-sm">
                        <div className="p-2 md:p-3 rounded border-l-4 border-gray-400 bg-gray-50">
                          <span className="font-medium">N/O:</span> Not Observed — item cannot be inspected
                        </div>
                        {[0, 1, 2, 3, 4].map((score) => {
                          const scoreKey = score as keyof typeof inspectionItem.scoreDescriptions;
                          const description = inspectionItem.scoreDescriptions?.[scoreKey];
                          if (!description || description === 'No score') return null;

                          return (
                            <div
                              key={score}
                              className={`p-2 md:p-3 rounded border-l-4 ${
                                score === 0 ? 'border-red-400 bg-red-50' :
                                score === 1 ? 'border-orange-400 bg-orange-50' :
                                score === 2 ? 'border-yellow-400 bg-yellow-50' :
                                score === 3 ? 'border-primary/60 bg-primary/5' :
                                'border-green-400 bg-green-50'
                              }`}
                            >
                              <span className="font-medium">{score}:</span> {description}
                            </div>
                          );
                        })}
                      </div>

                      {/* Current score badge */}
                      {inspectionItem.score !== null && (
                        <div>
                          <Badge
                            variant="secondary"
                            className={`${scoreColors[inspectionItem.score as keyof typeof scoreColors]?.replace(/hover:[^ ]+/g, '') || 'bg-gray-500'} text-white text-xs md:text-sm px-3 py-1`}
                          >
                            Selected: {inspectionItem.score} — {scoreLabels[inspectionItem.score as keyof typeof scoreLabels]}
                          </Badge>
                        </div>
                      )}

                      {/* Photos */}
                      <InspectionItemPhoto
                        inspectionId={currentInspection.id}
                        itemId={inspectionItem.id}
                        photos={getPhotosForItem(inspectionItem.id)}
                        onPhotoAdded={(photoUrl) => addPhoto(inspectionItem.id, photoUrl)}
                        onPhotoRemoved={(photoUrl) => removePhoto(inspectionItem.id, photoUrl)}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default InspectionCategoryForm;
