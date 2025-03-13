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
      setLoading(true);
      setError(null);

      try {
        console.log(
          `Recording temperature for batch ${batchId}: ${temperature}°C at ${location}`
        );

        // Validate inputs
        if (!batchId) {
          throw new Error("Batch ID is required");
        }

        if (!location) {
          throw new Error("Location is required");
        }

        // Call the API - fixed method name from monitor_temperature to monitorTemperature
        const response = await client.monitorTemperature(
          batchId,
          temperature,
          location
        );

        console.log("Temperature recording response:", response);

        if (!response.success && response.error) {
          throw new Error(response.error);
        }

        return response;
      } catch (err: any) {
        console.error("Error recording temperature:", err);
        setError(
          err.message || "An error occurred while recording temperature"
        );
        return {
          success: false,
          error: err.message || "An error occurred while recording temperature",
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchTemperatureHistory = useCallback(async (batchId: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching temperature history for batch ${batchId}`);

      if (!batchId) {
        throw new Error("Batch ID is required");
      }

      // Get batch report which includes temperature history - fixed method name from get_batch_report to getBatchReport
      const response = await client.getBatchReport(batchId);

      console.log("Batch report response:", response);

      if (!response.success && response.error) {
        throw new Error(response.error);
      }

      // Extract temperature readings
      let readings: TemperatureReading[] = [];

      // Navigate through the response structure to find temperature readings
      if (response.temperature_stats?.readings) {
        readings = response.temperature_stats.readings;
      } else if (response.batch_details?.temperature_stats?.readings) {
        readings = response.batch_details.temperature_stats.readings;
      } else if (response.report?.temperature_stats?.readings) {
        readings = response.report.temperature_stats.readings;
      } else if (response.report?.temperature_history) {
        readings = response.report.temperature_history;
      }

      console.log(`Found ${readings.length} temperature readings`);

      // Format the readings to ensure consistent structure
      const formattedReadings = readings.map((reading) => {
        // Ensure each reading has the required fields
        return {
          timestamp: reading.timestamp || Date.now(),
          temperature:
            typeof reading.temperature === "number" ? reading.temperature : 0,
          location: reading.location || "Unknown",
          isBreached: reading.isBreached || false,
        };
      });

      setTemperatureHistory(formattedReadings);
      return formattedReadings;
    } catch (err: any) {
      console.error("Error fetching temperature history:", err);
      setError(err.message || "Failed to fetch temperature history");
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

    // Extract temperatures and handle potential string values
    const temperatures = history
      .map((reading) => {
        const temp = reading.temperature;
        return typeof temp === "string" ? parseFloat(temp) : temp;
      })
      .filter((temp) => !isNaN(temp));

    if (temperatures.length === 0) {
      return {
        breachCount,
        breachPercentage,
        maxTemperature: 0,
        minTemperature: 0,
        averageTemperature: 0,
      };
    }

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
