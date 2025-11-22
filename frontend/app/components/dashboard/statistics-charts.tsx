import type {
  ProjectStatusData,
  StatsCardProps,
  TaskPriorityData,
  TaskTrendsData,
  WorkspaceProductivityData,
} from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ChartBarBig, ChartLine, ChartPie } from "lucide-react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

interface StatisticsChartsProps {
  stats: StatsCardProps;
  taskTrendsData: TaskTrendsData[];
  projectStatusData: ProjectStatusData[];
  taskPriorityData: TaskPriorityData[];
  workspaceProductivityData: WorkspaceProductivityData[];
}

export const StatisticsCharts = ({
  stats,
  taskTrendsData,
  projectStatusData,
  taskPriorityData,
  workspaceProductivityData,
}: StatisticsChartsProps) => {
  // Color configurations
  const taskTrendsConfig = {
    completed: { color: "#10b981", label: "Completed" },
    inProgress: { color: "#3b82f6", label: "In Progress" },
    todo: { color: "#6b7280", label: "Todo" },
  };

  const projectStatusConfig = {
    Completed: { color: "#10b981", label: "Completed" },
    "In Progress": { color: "#3b82f6", label: "In Progress" },
    Planning: { color: "#f59e0b", label: "Planning" },
  };

  const taskPriorityConfig = {
    High: { color: "#ef4444", label: "High" },
    Medium: { color: "#f59e0b", label: "Medium" },
    Low: { color: "#6b7280", label: "Low" },
  };

  const workspaceProductivityConfig = {
    completed: { color: "#3b82f6", label: "Completed Tasks" },
    total: { color: "#18181b", label: "Total Tasks" },
  };

  // Check if there's any data to display
  // Show charts even with zero data, but with a helpful message
  const hasTaskTrendsData = taskTrendsData && taskTrendsData.length > 0;
  const hasProjectStatusData = projectStatusData && projectStatusData.length > 0 && projectStatusData.some(d => d.value > 0);
  const hasTaskPriorityData = taskPriorityData && taskPriorityData.length > 0 && taskPriorityData.some(d => d.value > 0);
  const hasProductivityData = workspaceProductivityData && workspaceProductivityData.length > 0 && workspaceProductivityData.some(d => d.total > 0);
  
  // Check if there's actual task activity
  const hasTaskActivity = taskTrendsData && taskTrendsData.some(d => d.completed > 0 || d.inProgress > 0 || d.todo > 0);

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
      {/* Task Trends Chart */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-medium">Task Trends</CardTitle>
            <CardDescription>Daily task status changes</CardDescription>
          </div>
          <ChartLine className="size-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="w-full overflow-x-auto md:overflow-x-hidden">
          {!hasTaskTrendsData ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              <p className="text-sm">No task trends data available</p>
            </div>
          ) : (
          <div className="min-w-[350px]">
            <ChartContainer
              className="h-[300px]"
              config={taskTrendsConfig}
            >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={taskTrendsData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                <XAxis
                  dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                  tickLine={false}
                  axisLine={false}
                      tickMargin={8}
                />
                <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                  tickLine={false}
                  axisLine={false}
                      tickMargin={8}
                />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke={taskTrendsConfig.completed.color}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: taskTrendsConfig.completed.color }}
                      activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="inProgress"
                  stroke={taskTrendsConfig.inProgress.color}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: taskTrendsConfig.inProgress.color }}
                      activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="todo"
                  stroke={taskTrendsConfig.todo.color}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: taskTrendsConfig.todo.color }}
                      activeDot={{ r: 6 }}
                />
                    <ChartLegend 
                      content={(props) => <ChartLegendContent {...props} />}
                      wrapperStyle={{ paddingTop: '10px' }}
                    />
              </LineChart>
                </ResponsiveContainer>
            </ChartContainer>
            {!hasTaskActivity && (
              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  No task activity in the last 7 days. Create and update tasks to see trends.
                </p>
              </div>
            )}
          </div>
          )}
        </CardContent>
      </Card>

      {/* Project Status Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-medium">
              Project Status
            </CardTitle>
            <CardDescription>Project status breakdown</CardDescription>
          </div>
          <ChartPie className="size-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          {!hasProjectStatusData ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              <p className="text-sm">No projects yet</p>
            </div>
          ) : (
          <ChartContainer
            className="h-[300px] w-full"
            config={projectStatusConfig}
          >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
              <Pie
                data={projectStatusData}
                cx="50%"
                    cy="45%"
                dataKey="value"
                nameKey="name"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
              >
                {projectStatusData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value: any, name: string) => [
                      `${value} (${((value / projectStatusData.reduce((acc, d) => acc + d.value, 0)) * 100).toFixed(0)}%)`,
                      name
                    ]}
                  />
                  <ChartLegend 
                    content={(props) => <ChartLegendContent {...props} />}
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
            </PieChart>
              </ResponsiveContainer>
          </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Task Priority Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-medium">
              Task Priority
            </CardTitle>
            <CardDescription>Task priority breakdown</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          {!hasTaskPriorityData ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              <p className="text-sm">No tasks yet</p>
            </div>
          ) : (
          <ChartContainer
            className="h-[300px] w-full"
            config={taskPriorityConfig}
          >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
              <Pie
                data={taskPriorityData}
                cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                dataKey="value"
                nameKey="name"
              >
                {taskPriorityData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value: any, name: string) => [
                      `${value} (${((value / taskPriorityData.reduce((acc, d) => acc + d.value, 0)) * 100).toFixed(0)}%)`,
                      name
                    ]}
                  />
                  <ChartLegend 
                    content={(props) => <ChartLegendContent {...props} />}
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
            </PieChart>
              </ResponsiveContainer>
          </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Workspace Productivity Chart */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-medium">
              Workspace Productivity
            </CardTitle>
            <CardDescription>Task completion by project</CardDescription>
          </div>
          <ChartBarBig className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="w-full overflow-x-auto md:overflow-x-hidden">
          {!hasProductivityData ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              <p className="text-sm">No productivity data available</p>
            </div>
          ) : (
          <div className="min-w-[350px]">
            <ChartContainer
              className="h-[300px]"
              config={workspaceProductivityConfig}
            >
                <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={workspaceProductivityData}
                    barGap={4}
                    barCategoryGap="20%"
                    margin={{ top: 5, right: 10, left: 0, bottom: 40 }}
              >
                <XAxis
                  dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                  tickLine={false}
                  axisLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tickMargin={8}
                      interval={0}
                />
                <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                  tickLine={false}
                  axisLine={false}
                      tickMargin={8}
                />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="total"
                  fill={workspaceProductivityConfig.total.color}
                  radius={[4, 4, 0, 0]}
                  name="Total Tasks"
                />
                <Bar
                  dataKey="completed"
                  fill={workspaceProductivityConfig.completed.color}
                  radius={[4, 4, 0, 0]}
                  name="Completed Tasks"
                />
                    <ChartLegend 
                      content={(props) => <ChartLegendContent {...props} />}
                      wrapperStyle={{ paddingTop: '10px' }}
                    />
              </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};