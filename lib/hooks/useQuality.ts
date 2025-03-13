import { useState, useCallback } from "react";
import BerrySupplyChainClient from "../api/berrySupplyChainClient";

interface QualityAssessment {
  batch_id?: string | number;
  berry_type?: string;
  quality_score?: number;
  shelf_life_hours?: number;
  temperature_readings?: number;
  breach_count?: number;
  breach_percentage?: number;
  recommended_action?: string;
  action_description?: string;
  timestamp?: string;
  success?: boolean;
  error?: string;
}

export function useQuality() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [qualityAssessment, setQualityAssessment] =
    useState<QualityAssessment | null>(null);

  const client = new BerrySupplyChainClient();

  const assessQuality = useCallback(async (batchId: string) => {
    if (!batchId) {
      console.error("Invalid batch ID for quality assessment:", batchId);
      setError("Invalid batch ID provided");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`Assessing quality for batch ${batchId}...`);
      const response = await client.manageBerryQuality(batchId);
      console.log("Quality assessment response:", response);

      if (!response) {
        throw new Error("No response received from quality assessment");
      }

      if (response.error) {
        throw new Error(response.error);
      }

      // Handle different response formats
      if (response.result) {
        if (response.result.status && response.result.status !== "completed") {
          throw new Error(
            response.result.error || "Quality assessment not completed"
          );
        }
        // For debugging
        console.log("Setting quality assessment from result:", response.result);
        setQualityAssessment(response.result);
        return response.result;
      }

      if (response.success === true || response.quality_score !== undefined) {
        // For debugging
        console.log(
          "Setting quality assessment from direct response:",
          response
        );
        setQualityAssessment(response);
        return response;
      }

      // If we couldn't find any useful data, log and throw error
      console.error("Unexpected quality assessment response format:", response);
      throw new Error("Failed to assess quality: Unexpected response format");
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        `An error occurred while assessing quality for batch ${batchId}`;
      setError(errorMessage);
      console.error("Quality assessment error:", errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const processRecommendations = useCallback(async (batchId: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`Processing recommendations for batch ${batchId}...`);
      const response = await client.processRecommendations(batchId);
      console.log("Process recommendations response:", response);

      if (!response) {
        throw new Error("No response received from recommendations process");
      }
      if (response.error) {
        throw new Error(response.error);
      }

      // Check if response has a result property
      if (response.result) {
        // Check if result has a status field and it's not completed
        if (response.result.status && response.result.status !== "completed") {
          throw new Error(
            response.result.error || "Failed to process recommendations"
          );
        }
        return response.result;
      }

      // If the response itself is the result (has success field)
      if (response.success === true) {
        return response;
      }

      // If no clear result structure, throw an error
      throw new Error(
        "Failed to process recommendations: Unexpected response format"
      );
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        `An error occurred while processing recommendations for batch ${batchId}`;
      setError(errorMessage);
      console.error("Process recommendations error:", errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getActionColor = useCallback((action: string | undefined): string => {
    if (!action) return "gray";

    // Normalize the action by converting to lowercase and trimming
    const normalizedAction = action.toLowerCase().trim();

    if (
      normalizedAction.includes("no action") ||
      normalizedAction.includes("proceed")
    ) {
      return "green";
    } else if (
      normalizedAction.includes("alert") ||
      normalizedAction.includes("monitor")
    ) {
      return "blue";
    } else if (normalizedAction.includes("expedite")) {
      return "orange";
    } else if (normalizedAction.includes("reroute")) {
      return "yellow";
    } else if (
      normalizedAction.includes("reject") ||
      normalizedAction.includes("discard")
    ) {
      return "red";
    } else {
      return "gray";
    }
  }, []);

  const getQualityCategory = useCallback((score: number | undefined) => {
    if (score === undefined || score === null)
      return { category: "Unknown", color: "gray" };

    // Make sure we're dealing with a number
    const numericScore = typeof score === "string" ? parseFloat(score) : score;

    if (isNaN(numericScore)) return { category: "Unknown", color: "gray" };

    if (numericScore >= 90) return { category: "Excellent", color: "green" };
    if (numericScore >= 80) return { category: "Good", color: "teal" };
    if (numericScore >= 70) return { category: "Fair", color: "yellow" };
    if (numericScore >= 60) return { category: "Poor", color: "orange" };
    return { category: "Critical", color: "red" };
  }, []);

  return {
    loading,
    error,
    qualityAssessment,
    assessQuality,
    processRecommendations,
    getActionColor,
    getQualityCategory,
  };
}
