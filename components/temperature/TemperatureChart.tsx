import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  TooltipProps,
} from "recharts";

// Define the types for our data
interface TemperatureReading {
  timestamp: string | number;
  temperature: number;
  location?: string;
  isBreached?: boolean;
  formattedTimestamp?: string;
}

interface TemperatureChartProps {
  data: TemperatureReading[];
  minOptimal?: number;
  maxOptimal?: number;
}

// Define the ValueType and NameType for Recharts types
type ValueType = number;
type NameType = string;

const TemperatureChart: React.FC<TemperatureChartProps> = ({
  data,
  minOptimal = 0,
  maxOptimal = 4,
}) => {
  // If the timestamp is a number, convert to a date string
  const formattedData = data.map((reading, idx) => {
    let formattedTimestamp = reading.timestamp;

    if (typeof reading.timestamp === "number") {
      formattedTimestamp = new Date(reading.timestamp * 1000).toLocaleString();
    }

    return {
      ...reading,
      formattedTimestamp,
      id: idx, // Add id for keying in the chart
    };
  });

  const maxTemp =
    data.length > 0
      ? Math.ceil(Math.max(...data.map((item) => item.temperature)))
      : 5;
  const minTemp =
    data.length > 0
      ? Math.floor(Math.min(...data.map((item) => item.temperature)))
      : -1;
  const yDomain = [Math.min(minTemp - 1, -1), Math.max(maxTemp + 1, 5)];

  // Custom tooltip component with proper typing
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as TemperatureReading;
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="text-gray-600 text-sm">{label}</p>
          <p className="text-blue-600 font-medium">
            {`${
              typeof payload[0].value === "number"
                ? payload[0].value.toFixed(1)
                : payload[0].value
            }°C`}
          </p>
          {data.location && (
            <p className="text-gray-500 text-xs">
              {`Location: ${data.location}`}
            </p>
          )}
          {data.isBreached && (
            <p className="text-red-500 text-xs">Temperature breach detected</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Define custom dot function that never returns null to satisfy TypeScript
  const renderDot = (props: any) => {
    // If props or payload are undefined, return an invisible circle
    if (!props || !props.payload) {
      return (
        <circle
          key="fallback-dot"
          cx={0}
          cy={0}
          r={0}
          fill="none"
          stroke="none"
        />
      );
    }

    const { cx, cy, payload, index } = props;
    return (
      <circle
        key={`temp-dot-${payload.id || index}`}
        cx={cx}
        cy={cy}
        r={4}
        stroke="#2563eb"
        strokeWidth={2}
        fill={payload.isBreached ? "#ef4444" : "#fff"}
      />
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={formattedData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="formattedTimestamp"
          angle={-45}
          textAnchor="end"
          height={70}
          fontSize={12}
        />
        <YAxis
          label={{
            value: "Temperature (°C)",
            angle: -90,
            position: "insideLeft",
          }}
          domain={yDomain}
        />
        <Tooltip content={CustomTooltip} />
        <Legend />

        {/* Reference lines for optimal temperature range */}
        <ReferenceLine
          y={minOptimal}
          stroke="orange"
          strokeDasharray="3 3"
          label={`Min Optimal (${minOptimal}°C)`}
        />
        <ReferenceLine
          y={maxOptimal}
          stroke="orange"
          strokeDasharray="3 3"
          label={`Max Optimal (${maxOptimal}°C)`}
        />

        <Line
          type="monotone"
          dataKey="temperature"
          stroke="#2563eb"
          activeDot={{ r: 8 }}
          strokeWidth={2}
          dot={renderDot}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TemperatureChart;
