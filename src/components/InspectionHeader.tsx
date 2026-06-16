
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Save, Send, ArrowLeft, Trash2, ClipboardList } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface InspectionHeaderProps {
  neighborhood: string;
  date: string;
  status: 'in-progress' | 'completed';
  progress: number;
  onSave: () => void;
  onSubmit: () => void;
  onDelete: () => void;
  onBack?: () => void;
  isComplete: boolean;
  canDelete: boolean;
  isAuditMode?: boolean;
}

const InspectionHeader = ({
  neighborhood,
  date,
  status,
  progress,
  onSave,
  onSubmit,
  onDelete,
  onBack,
  isComplete,
  canDelete,
  isAuditMode = false,
}: InspectionHeaderProps) => {
  return (
    <div className="mb-6 md:mb-8">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-4 -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {isAuditMode ? (
          <>
            <ClipboardList className="h-4 w-4 mr-1" />
            Back to Audit
          </>
        ) : 'Back to Dashboard'}
      </Button>

      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="min-w-0">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 truncate">
            {neighborhood} Inspection
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            {new Date(date).toLocaleDateString()}
            {isAuditMode && (
              <span className="ml-2 inline-flex items-center gap-1 text-blue-600 text-xs font-medium">
                <ClipboardList className="h-3 w-3" />
                Audit
              </span>
            )}
          </p>
        </div>
        <Badge
          variant={status === 'completed' ? 'default' : 'secondary'}
          className="flex-shrink-0"
        >
          {status === 'completed' ? 'Completed' : 'In Progress'}
        </Badge>
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-600">{progress}%</span>
        </div>
        <Progress value={progress} className="w-full h-2" />
      </div>

      <div className="flex flex-wrap gap-2 md:gap-4 mb-4 md:mb-6">
        <Button onClick={onSave} variant="outline" size="sm" className="md:size-default">
          <Save className="h-4 w-4 mr-1.5" />
          Save
        </Button>

        <Button
          onClick={onSubmit}
          size="sm"
          className={`md:size-default ${isComplete ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
          disabled={!isComplete || status === 'completed'}
        >
          <Send className="h-4 w-4 mr-1.5" />
          Submit
        </Button>

        {canDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="md:size-default">
                <Trash2 className="h-4 w-4 mr-1.5" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this inspection?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the in-progress inspection for {neighborhood}. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {!canDelete && status === 'completed' && (
          <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded">
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Completed — cannot delete
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectionHeader;
