import { useState, useCallback } from "react";
import BerrySupplyChainClient from "../api/berrySupplyChainClient";

interface Recommendation {
  id?: string;
  description: string;
  priority: "low" | "medium" | "high" | string;
  action: string;
  timestamp?: string | number;
  batchId?: string | number;
  implemented?: boolean;
}

export function useRecommendations() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const client = new BerrySupplyChainClient();

  const fetchRecommendations = useCallback(async (batchId: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching recommendations for batch ${batchId}`);

      // Try to get recommendations from the API
      const response = await client.callConnectionAction(
        "sonic",
        "process-agent-recommendations",
        {
          batch_id: batchId,
        }
      );

      console.log("Recommendations response:", response);

      let recommendationList: Recommendation[] = [];

      // Handle different possible response formats
      if (response && Array.isArray(response.recommendations)) {
        recommendationList = response.recommendations;
      } else if (response && response.recommended_actions) {
        recommendationList = Array.isArray(response.recommended_actions)
          ? response.recommended_actions
          : [
              {
                description: response.recommended_actions,
                priority: response.priority || "medium",
                action: response.action || "Monitor",
              },
            ];
      } else if (response && response.action_description) {
        recommendationList = [
          {
            description: response.action_description,
            priority: response.priority || "medium",
            action: response.recommended_action || "No specific action",
          },
        ];
      }

      // If no recommendations were provided, generate berry-specific default recommendations
      if (recommendationList.length === 0) {
        recommendationList = generateDefaultRecommendations(batchId);
      }

      setRecommendations(recommendationList);
      return recommendationList;
    } catch (err: any) {
      console.error(
        `Error fetching recommendations for batch ${batchId}:`,
        err
      );
      setError(
        err.message || `Failed to fetch recommendations for batch ${batchId}`
      );

      // Return default recommendations on error
      const defaultRecommendations = generateDefaultRecommendations(batchId);
      setRecommendations(defaultRecommendations);
      return defaultRecommendations;
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate berry-specific default recommendations based on batch data
  const generateDefaultRecommendations = useCallback(
    (batchId: string): Recommendation[] => {
      const now = new Date().toISOString();

      return [
        {
          id: `rec-${batchId}-1`,
          description:
            "Maintain optimal cold chain temperature between 1-4°C for freshness.",
          priority: "high",
          action: "Monitor Temperature",
          timestamp: now,
          batchId: batchId,
        },
        {
          id: `rec-${batchId}-2`,
          description:
            "Ensure humidity levels stay below 90% to prevent mold growth.",
          priority: "medium",
          action: "Monitor Humidity",
          timestamp: now,
          batchId: batchId,
        },
        {
          id: `rec-${batchId}-3`,
          description:
            "Record temperature at each transfer point to maintain chain of custody.",
          priority: "medium",
          action: "Record Temperature",
          timestamp: now,
          batchId: batchId,
        },
      ];
    },
    []
  );

  // Generate recommendations based on batch details and temperature data
  const generateCustomRecommendations = useCallback(
    (batchDetails: any, temperatureData: any[]): Recommendation[] => {
      const recommendations: Recommendation[] = [];
      const batchId = batchDetails.batch_id || batchDetails.batchId;
      const berryType = batchDetails.berry_type || batchDetails.berryType;

      // Berry-specific recommendations
      if (berryType === "Strawberry") {
        recommendations.push({
          description:
            "Strawberries should be kept between 0-4°C for optimal shelf life.",
          priority: "high",
          action: "Monitor Temperature",
          batchId,
        });
      } else if (berryType === "Blueberry") {
        recommendations.push({
          description:
            "Blueberries perform best in temperatures of 0-2°C with 90-95% humidity.",
          priority: "high",
          action: "Monitor Temperature and Humidity",
          batchId,
        });
      } else if (berryType === "Raspberry") {
        recommendations.push({
          description:
            "Raspberries require controlled atmosphere with CO₂ levels of 10-20%.",
          priority: "high",
          action: "Monitor Atmosphere",
          batchId,
        });
      }

      // Add temperature-based recommendations if temperature data exists
      if (temperatureData && temperatureData.length > 0) {
        // Check for temperature breaches
        const breachCount = temperatureData.filter(
          (reading) =>
            reading.isBreached ||
            reading.temperature > 6 ||
            reading.temperature < 0
        ).length;

        if (breachCount > 0) {
          recommendations.push({
            description: `${breachCount} temperature breaches detected. Conduct quality assessment before delivery.`,
            priority: "high",
            action: "Quality Assessment",
            batchId,
          });
        }

        // Check for rapid temperature changes
        let rapidChanges = 0;
        for (let i = 1; i < temperatureData.length; i++) {
          const tempDiff = Math.abs(
            temperatureData[i].temperature - temperatureData[i - 1].temperature
          );
          if (tempDiff > 3) {
            rapidChanges++;
          }
        }

        if (rapidChanges > 0) {
          recommendations.push({
            description:
              "Rapid temperature fluctuations detected. Stabilize transport conditions.",
            priority: "medium",
            action: "Stabilize Environment",
            batchId,
          });
        }
      }

      // Always add general recommendation
      recommendations.push({
        description:
          "Update blockchain verification at delivery to complete chain of custody.",
        priority: "medium",
        action: "Blockchain Update",
        batchId,
      });

      return recommendations;
    },
    []
  );

  // Mark a recommendation as implemented
  const implementRecommendation = useCallback(
    async (recommendationId: string) => {
      setLoading(true);

      try {
        // Update local state
        setRecommendations((prev) =>
          prev.map((rec) =>
            rec.id === recommendationId ? { ...rec, implemented: true } : rec
          )
        );

        // Here you could add an API call to update the status on the backend

        return { success: true };
      } catch (err: any) {
        console.error("Error implementing recommendation:", err);
        setError(err.message || "Failed to implement recommendation");
        return {
          success: false,
          error: err.message || "Failed to implement recommendation",
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    recommendations,
    fetchRecommendations,
    generateCustomRecommendations,
    implementRecommendation,
  };
}
