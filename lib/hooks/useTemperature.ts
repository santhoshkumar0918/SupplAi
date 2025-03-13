import { useState, useCallback } from "react";
import BerrySupplyChainClient from "../api/berrySupplyChainClient";

interface TemperatureReading {
  timestamp: string | number;
  temperature: number;
  location: string;
  isBreached: boolean;
}

export function useTemperature() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [temperatureHistory, setTemperatureHistory] = useState<
    TemperatureReading[]
  >([]);

  const client = new BerrySupplyChainClient();

  const recordTemperature = useCallback(
    async (batchId: string, temperature: number, location: string) => {
      if (!batchId) {
        console.error("recordTemperature called without batchId");
        setError("Batch ID is required");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        console.log(
          `Recording temperature ${temperature}°C at ${location} for batch ${batchId}`
        );

        // Ensure batchId is a valid number
        const batchIdNum = parseInt(batchId, 10);
        if (isNaN(batchIdNum)) {
          throw new Error("Invalid Batch ID format");
        }

        // Use the numeric batch ID in the API call
        const response = await client.monitorTemperature(
          batchIdNum.toString(), // Convert back to string for consistency with API
          temperature,
          location
        );

        console.log("Temperature recording response:", response);

        // Handle different response formats
        if (response.result?.status === "completed") {
          return response.result;
        } else if (response.status === "completed") {
          return response;
        } else if (response.success === true) {
          return response;
        } else {
          console.error("Unexpected response format:", response);
          throw new Error(
            response.result?.error ||
              response.error ||
              "Failed to record temperature"
          );
        }
      } catch (err: any) {
        console.error("Error recording temperature:", err);
        const errorMessage =
          err.message || "An error occurred while recording temperature";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchTemperatureHistory = useCallback(async (batchId: string) => {
    if (!batchId) {
      console.error("fetchTemperatureHistory called without batchId");
      setError("Batch ID is required");
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching temperature history for batch ${batchId}`);

      // Ensure batchId is a valid number
      const batchIdNum = parseInt(batchId, 10);
      if (isNaN(batchIdNum)) {
        throw new Error("Invalid Batch ID format");
      }

      // We'll get the temperature history from the batch report
      const batchReport = await client.getBatchReport(batchIdNum.toString());
      console.log("Batch report response:", batchReport);

      // Handle different response formats
      let history = [];

      if (batchReport.result?.status === "completed") {
        history = batchReport.result?.temperature_stats?.readings || [];
      } else if (batchReport.temperature_stats?.readings) {
        history = batchReport.temperature_stats.readings;
      } else if (batchReport.status === "completed" && batchReport.readings) {
        history = batchReport.readings;
      } else {
        console.log("No temperature readings found in batch report");
        history = [];
      }

      console.log(`Found ${history.length} temperature readings`);
      setTemperatureHistory(history);
      return history;
    } catch (err: any) {
      console.error("Error fetching temperature history:", err);
      const errorMessage =
        err.message ||
        `An error occurred while fetching temperature history for batch ${batchId}`;
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getBreachStatistics = useCallback((history: TemperatureReading[]) => {
    if (!history || history.length === 0) {
      return {
        breachCount: 0,
        breachPercentage: 0,
        maxTemperature: 0,
        minTemperature: 0,
        averageTemperature: 0,
      };
    }

    const breachCount = history.filter((reading) => reading.isBreached).length;
    const breachPercentage = (breachCount / history.length) * 100;
    const temperatures = history.map((reading) => reading.temperature);
    const maxTemperature = Math.max(...temperatures);
    const minTemperature = Math.min(...temperatures);
    const averageTemperature =
      temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;

    return {
      breachCount,
      breachPercentage,
      maxTemperature,
      minTemperature,
      averageTemperature: parseFloat(averageTemperature.toFixed(1)),
    };
  }, []);

  return {
    loading,
    error,
    temperatureHistory,
    recordTemperature,
    fetchTemperatureHistory,
    getBreachStatistics,
  };
}
