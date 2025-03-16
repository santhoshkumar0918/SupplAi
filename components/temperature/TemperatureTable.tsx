import React from "react";

// Define the types for our data
interface TemperatureReading {
  timestamp: string | number;
  temperature: number;
  location?: string;
  isBreached?: boolean;
  formattedTimestamp?: string;
}

interface TemperatureTableProps {
  data: TemperatureReading[];
}

const TemperatureTable: React.FC<TemperatureTableProps> = ({ data }) => {
  // If the timestamp is a number, convert to a date string
  const formattedData = data.map((reading, index) => {
    let formattedTimestamp = reading.timestamp;
    if (typeof reading.timestamp === "number") {
      formattedTimestamp = new Date(reading.timestamp * 1000).toLocaleString();
    }
    return {
      ...reading,
      formattedTimestamp,
      id: `temp-reading-${index}`, // Add unique ID for key prop
    };
  });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Timestamp
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Temperature
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {formattedData.map((reading) => (
            <tr key={reading.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {reading.formattedTimestamp}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div
                  className={`text-sm font-medium ${
                    reading.isBreached ? "text-red-600" : "text-gray-900"
                  }`}
                >
                  {reading.temperature.toFixed(1)}°C
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {reading.location || "Unknown"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {reading.isBreached ? (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    Breach
                  </span>
                ) : (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Normal
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TemperatureTable;
