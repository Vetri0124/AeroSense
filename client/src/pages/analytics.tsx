import Layout from "@/components/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendChart } from "@/components/trend-chart";
import { generateHistoricalData } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, BarChart3, PieChart } from "lucide-react";

export default function Analytics() {
  const dailyData = generateHistoricalData(1); // Hourly data for 1 day
  const weeklyData = generateHistoricalData(7);
  const monthlyData = generateHistoricalData(30);
  const yearlyData = generateHistoricalData(365);

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white mb-2">Detailed Analytics</h1>
          <p className="text-muted-foreground">
            Multi-scale temporal analysis of air quality trends and pollutant correlations.
          </p>
        </div>

        <Tabs defaultValue="monthly" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10 p-1">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
          
          <div className="mt-8">
            <TabsContent value="daily" className="space-y-6">
              <AnalysisSection title="24-Hour Breakdown" data={dailyData} desc="Hour-by-hour analysis showing diurnal variations in AQI." />
            </TabsContent>
            <TabsContent value="weekly" className="space-y-6">
              <AnalysisSection title="7-Day Trend" data={weeklyData} desc="Weekly patterns, identifying weekday vs weekend pollution levels." />
            </TabsContent>
            <TabsContent value="monthly" className="space-y-6">
              <AnalysisSection title="30-Day Overview" data={monthlyData} desc="Monthly analysis highlighting seasonal effects and weather correlations." />
            </TabsContent>
            <TabsContent value="yearly" className="space-y-6">
              <AnalysisSection title="Annual Climate Report" data={yearlyData} desc="Long-term trend analysis for policy planning." />
            </TabsContent>
          </div>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card/50 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <PieChart className="h-5 w-5 text-primary" />
                Pollutant Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                [Distribution Chart Placeholder]
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BarChart3 className="h-5 w-5 text-primary" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                [Risk Histogram Placeholder]
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

function AnalysisSection({ title, data, desc }: any) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-xl font-heading font-semibold text-white">{title}</h3>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
        <div className="flex items-center gap-2 text-primary bg-primary/10 px-3 py-1 rounded-full">
          <Calendar className="h-4 w-4" />
          <span className="text-xs font-mono">REPORT GENERATED</span>
        </div>
      </div>
      <TrendChart data={data} type="history" />
    </div>
  );
}
