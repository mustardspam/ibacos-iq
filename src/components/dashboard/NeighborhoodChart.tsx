
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart as BarChartIcon } from 'lucide-react';

interface NeighborhoodData {
  neighborhood: string;
  avgScore: number;
  count: number;
}

interface NeighborhoodChartProps {
  data: NeighborhoodData[];
}

const NeighborhoodChart = ({ data }: NeighborhoodChartProps) => {
  const SCORE_THRESHOLD = 3.24;

  if (data.length === 0) {
    return (
      <Card className="mb-8 rounded-sm border shadow-none" style={{ borderColor: 'hsl(220, 14%, 88%)' }}>
        <CardContent className="text-center py-12">
          <BarChartIcon className="h-12 w-12 mx-auto mb-4" style={{ color: 'hsl(220, 12%, 72%)' }} />
          <h3 className="text-base font-semibold mb-2" style={{ color: 'hsl(220, 30%, 12%)' }}>No Performance Data Yet</h3>
          <p className="text-sm" style={{ color: 'hsl(220, 12%, 52%)' }}>Complete inspections to see neighborhood performance metrics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 rounded-sm border shadow-none" style={{ borderColor: 'hsl(220, 14%, 88%)' }}>
      <CardHeader className="pb-3">
        <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'hsl(220, 12%, 46%)' }}>Neighborhood Performance</p>
        <CardDescription className="text-xs">
          Avg scores by neighborhood · Scale: 0–3.52 · Target: 3.24+
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="neighborhood" />
            <YAxis domain={[0, 3.52]} />
            <Tooltip 
              formatter={(value) => [
                Number(value).toFixed(2), 
                'Average Score'
              ]}
            />
            <Bar dataKey="avgScore" name="avgScore">
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.avgScore >= SCORE_THRESHOLD ? "#22c55e" : "#ef4444"} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default NeighborhoodChart;
