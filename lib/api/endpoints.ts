const agentBaseUrl =
  process.env.NEXT_PUBLIC_AGENT_URL || "http://localhost:8000";

// General agent endpoints
export const getServerStatusUrl = `${agentBaseUrl}/`;
export const listAgentsUrl = `${agentBaseUrl}/agents`;
export const loadAgentUrl = `${agentBaseUrl}/agents/%agentName%/load`;
export const listConnectionsUrl = `${agentBaseUrl}/connections`;
export const listConnectionActionsUrl = `${agentBaseUrl}/connections/%connectionName%/actions`;

// Berry supply chain specific endpoints
export const actionUrl = `${agentBaseUrl}/agent/action`;
export const registeredActionUrl = `${agentBaseUrl}/agent/registered-action`;

// Berry temperature monitoring endpoints
export const monitorTemperatureUrl = `${agentBaseUrl}/agent/action`;
export const manageBerryQualityUrl = `${agentBaseUrl}/agent/action`; // POST with manage-berry-quality
export const processRecommendationsUrl = `${agentBaseUrl}/agent/action`; // POST with process-agent-recommendations

// Batch lifecycle management endpoints
export const createBatchUrl = `${agentBaseUrl}/agent/action`; // POST with manage-batch-lifecycle action=create
export const getBatchStatusUrl = `${agentBaseUrl}/agent/action`; // POST with manage-batch-lifecycle action=status
export const getBatchReportUrl = `${agentBaseUrl}/agent/action`; // POST with manage-batch-lifecycle action=report
export const completeBatchUrl = `${agentBaseUrl}/agent/action`; // POST with manage-batch-lifecycle action=complete

// Batch sequence endpoint
export const batchSequenceUrl = `${agentBaseUrl}/agent/action`; // POST with manage-batch-sequence

// System health check endpoint
export const healthCheckUrl = `${agentBaseUrl}/agent/action`; // POST with system-health-check

// Agent control endpoints
export const startAgentUrl = `${agentBaseUrl}/agent/start`;
export const stopAgentUrl = `${agentBaseUrl}/agent/stop`;
