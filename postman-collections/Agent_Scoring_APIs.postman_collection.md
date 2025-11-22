{
"info": {
"name": "Agent Scoring APIs",
"description": "Complete API collection for Agent Scoring functionality. This system allows users to create custom scoring configurations for agents with multiple questions and point values. Maximum total points is 10.",
"schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
"version": "1.0.0"
},
"auth": {
"type": "bearer",
"bearer": [
{
"key": "token",
"value": "{{jwt_token}}",
"type": "string"
}
]
},
"variable": [
{
"key": "base_url",
"value": "http://localhost:8002",
"type": "string"
},
{
"key": "jwt_token",
"value": "",
"type": "string"
},
{
"key": "agent_id",
"value": "1",
"type": "string"
}
],
"item": [
{
"name": "Get All Agents with Scoring",
"request": {
"method": "GET",
"header": [
{
"key": "Content-Type",
"value": "application/json",
"type": "text"
}
],
"url": {
"raw": "{{base_url}}/api/agent/scoring?includeInactive=false",
"host": ["{{base_url}}"],
"path": ["api", "agent", "scoring"],
"query": [
{
"key": "includeInactive",
"value": "false",
"description": "Set to true to include inactive agents"
}
]
},
"description": "**Get All Agents with Scoring Configurations**\n\nRetrieves all agents belonging to the authenticated user along with their scoring configurations and statistics.\n\n**Features:**\n- Lists all active agents by default\n- Shows scoring statistics for each agent\n- Includes question count, total points, and template name\n- Distinguishes between agents with and without scoring\n\n**Query Parameters:**\n- `includeInactive` (optional): Set to `true` to include inactive agents\n\n**Response includes:**\n- Agent basic info (id, name, role, type, status)\n- Scoring statistics (hasScoring, questionCount, totalPoints, maxPoints)\n- Template information\n- Summary counts (total, with scoring, without scoring)"
},
"response": []
},
{
"name": "Get Specific Agent Scoring",
"request": {
"method": "GET",
"header": [
{
"key": "Content-Type",
"value": "application/json",
"type": "text"
}
],
"url": {
"raw": "{{base_url}}/api/agent/scoring/{{agent_id}}",
"host": ["{{base_url}}"],
"path": ["api", "agent", "scoring", "{{agent_id}}"]
},
"description": "**Get Scoring Configuration for Specific Agent**\n\nRetrieves the complete scoring configuration for a specific agent, including all questions and their details.\n\n**Path Parameters:**\n- `agentId`: The ID of the agent to get scoring configuration for\n\n**Features:**\n- Returns complete scoring configuration with all questions\n- Shows question details (text, points, type, sort order)\n- Calculates total points across all questions\n- Handles agents without scoring configurations gracefully\n\n**Response includes:**\n- Agent basic information\n- Complete scoring configuration (if exists)\n- All questions with their properties\n- Calculated total points\n- Boolean flag indicating if agent has scoring"
},
"response": []
},
{
"name": "Create Agent Scoring Configuration",
"request": {
"method": "POST",
"header": [
{
"key": "Content-Type",
"value": "application/json",
"type": "text"
}
],
"body": {
"mode": "raw",
"raw": "{\n \"templateName\": \"Real Estate Lead Scoring\",\n \"description\": \"Custom scoring template for real estate lead qualification\",\n \"maxPoints\": 10.0,\n \"isTemplate\": false,\n \"questions\": [\n {\n \"question\": \"Are they thinking about selling to downsize?\",\n \"points\": 3.0,\n \"questionType\": \"yes_no\",\n \"sortOrder\": 1,\n \"isRequired\": true\n },\n {\n \"question\": \"Are they relocating or moving for work/family?\",\n \"points\": 2.5,\n \"questionType\": \"yes_no\",\n \"sortOrder\": 2,\n \"isRequired\": true\n },\n {\n \"question\": \"Do they have a specific timeline for selling?\",\n \"points\": 2.0,\n \"questionType\": \"scale\",\n \"sortOrder\": 3,\n \"isRequired\": true\n },\n {\n \"question\": \"Have they already started looking at new properties?\",\n \"points\": 2.5,\n \"questionType\": \"yes_no\",\n \"sortOrder\": 4,\n \"isRequired\": false\n }\n ]\n}",
"options": {
"raw": {
"language": "json"
}
}
},
"url": {
"raw": "{{base_url}}/api/agent/scoring/{{agent_id}}",
"host": ["{{base_url}}"],
"path": ["api", "agent", "scoring", "{{agent_id}}"]
},
"description": "**Create or Update Agent Scoring Configuration**\n\nCreates a new scoring configuration for an agent or updates an existing one. This is the main API for setting up lead scoring questions.\n\n**Path Parameters:**\n- `agentId`: The ID of the agent to create/update scoring for\n\n**Request Body Fields:**\n- `templateName` (optional): Display name for this scoring template\n- `description` (optional): Description of what this scoring is for\n- `maxPoints` (optional): Maximum total points allowed (default: 10.0)\n- `isTemplate` (optional): Whether this should be saved as a reusable template\n- `questions` (required): Array of question objects\n\n**Question Object Fields:**\n- `question` (required): The question text\n- `points` (required): Points for this question (decimal allowed)\n- `questionType` (optional): 'yes_no', 'scale', or 'text' (default: 'yes_no')\n- `sortOrder` (optional): Display order (auto-assigned if not provided)\n- `isRequired` (optional): Whether this question must be answered (default: true)\n\n**Validation:**\n- Total question points cannot exceed maxPoints\n- At least one question is required\n- Agent ownership is verified\n\n**Features:**\n- Automatically updates existing configurations\n- Supports decimal point values (e.g., 2.5 points)\n- Transaction-safe (all-or-nothing updates)\n- Returns complete updated configuration"
},
"response": []
},
{
"name": "Update Agent Scoring Configuration",
"request": {
"method": "POST",
"header": [
{
"key": "Content-Type",
"value": "application/json",
"type": "text"
}
],
"body": {
"mode": "raw",
"raw": "{\n \"templateName\": \"Updated Real Estate Scoring\",\n \"description\": \"Updated scoring template with new questions\",\n \"maxPoints\": 10.0,\n \"questions\": [\n {\n \"question\": \"Are they motivated to sell within 90 days?\",\n \"points\": 4.0,\n \"questionType\": \"yes_no\",\n \"sortOrder\": 1,\n \"isRequired\": true\n },\n {\n \"question\": \"Do they have equity in their current home?\",\n \"points\": 3.0,\n \"questionType\": \"yes_no\",\n \"sortOrder\": 2,\n \"isRequired\": true\n },\n {\n \"question\": \"Have they been pre-approved for their next purchase?\",\n \"points\": 3.0,\n \"questionType\": \"yes_no\",\n \"sortOrder\": 3,\n \"isRequired\": false\n }\n ]\n}",
"options": {
"raw": {
"language": "json"
}
}
},
"url": {
"raw": "{{base_url}}/api/agent/scoring/{{agent_id}}",
"host": ["{{base_url}}"],
"path": ["api", "agent", "scoring", "{{agent_id}}"]
},
"description": "**Update Existing Agent Scoring Configuration**\n\nThis is the same endpoint as create, but demonstrates updating an existing scoring configuration. The system automatically detects if a configuration exists and updates it.\n\n**Key Features:**\n- Same endpoint handles both create and update\n- Existing questions are completely replaced\n- Configuration metadata can be updated\n- Point totals are re-validated\n\n**Note:** This example shows updating an existing configuration with different questions and point values."
},
"response": []
},
{
"name": "Get Scoring Templates",
"request": {
"method": "GET",
"header": [
{
"key": "Content-Type",
"value": "application/json",
"type": "text"
}
],
"url": {
"raw": "{{base_url}}/api/agent/scoring-templates",
"host": ["{{base_url}}"],
"path": ["api", "agent", "scoring-templates"]
},
"description": "**Get Available Scoring Templates**\n\nRetrieves all available scoring templates that can be used as starting points for creating agent scoring configurations.\n\n**Features:**\n- Returns both user-created templates and global templates\n- Shows complete template structure with all questions\n- Includes calculated statistics (total points, question count)\n- Templates can be copied to create new agent configurations\n\n**Response includes:**\n- Template metadata (name, description, max points)\n- Complete question list with all properties\n- Calculated statistics\n- Template creator information\n\n**Use Case:**\nTemplates allow users to create reusable scoring configurations that can be applied to multiple agents or shared across teams."
},
"response": []
},
{
"name": "Delete Agent Scoring",
"request": {
"method": "DELETE",
"header": [
{
"key": "Content-Type",
"value": "application/json",
"type": "text"
}
],
"url": {
"raw": "{{base_url}}/api/agent/scoring/{{agent_id}}",
"host": ["{{base_url}}"],
"path": ["api", "agent", "scoring", "{{agent_id}}"]
},
"description": "**Delete Agent Scoring Configuration**\n\nRemoves the scoring configuration from an agent. This is a soft delete - the configuration is deactivated but not permanently removed from the database.\n\n**Path Parameters:**\n- `agentId`: The ID of the agent to remove scoring from\n\n**Features:**\n- Soft delete (sets isActive = false)\n- Verifies agent ownership before deletion\n- Returns confirmation with deleted configuration ID\n- Preserves data for potential recovery\n\n**Security:**\n- Only the agent owner can delete scoring configurations\n- Team admin privileges are respected\n\n**Response:**\n- Confirmation of successful deletion\n- Agent information\n- ID of the deleted configuration"
},
"response": []
},
{
"name": "Create Template Example",
"request": {
"method": "POST",
"header": [
{
"key": "Content-Type",
"value": "application/json",
"type": "text"
}
],
"body": {
"mode": "raw",
"raw": "{\n \"templateName\": \"Ann's Lead Scoring Template\",\n \"description\": \"Ann's proven lead scoring questions for real estate\",\n \"maxPoints\": 10.0,\n \"isTemplate\": true,\n \"questions\": [\n {\n \"question\": \"Are they currently working with another agent?\",\n \"points\": 2.0,\n \"questionType\": \"yes_no\",\n \"sortOrder\": 1,\n \"isRequired\": true\n },\n {\n \"question\": \"What's their timeline for buying/selling?\",\n \"points\": 3.0,\n \"questionType\": \"scale\",\n \"sortOrder\": 2,\n \"isRequired\": true\n },\n {\n \"question\": \"Are they pre-approved for financing?\",\n \"points\": 2.5,\n \"questionType\": \"yes_no\",\n \"sortOrder\": 3,\n \"isRequired\": true\n },\n {\n \"question\": \"Have they visited properties in person?\",\n \"points\": 1.5,\n \"questionType\": \"yes_no\",\n \"sortOrder\": 4,\n \"isRequired\": false\n },\n {\n \"question\": \"Do they need to sell before buying?\",\n \"points\": 1.0,\n \"questionType\": \"yes_no\",\n \"sortOrder\": 5,\n \"isRequired\": false\n }\n ]\n}",
"options": {
"raw": {
"language": "json"
}
}
},
"url": {
"raw": "{{base_url}}/api/agent/scoring/{{agent_id}}",
"host": ["{{base_url}}"],
"path": ["api", "agent", "scoring", "{{agent_id}}"]
},
"description": "**Create Reusable Template**\n\nExample of creating a scoring configuration that will be saved as a template. Templates can be reused across multiple agents.\n\n**Key Difference:**\n- `isTemplate: true` - This saves the configuration as a reusable template\n- Template will appear in the templates list\n- Can be used as a starting point for other agents\n\n**Template Benefits:**\n- Consistency across agents\n- Time-saving for setup\n- Best practices sharing\n- Team standardization\n\n**This example creates \"Ann's Lead Scoring Template\" which matches the UI screenshot showing \"Ann's scores\" in the dropdown.**"
},
"response": []
},
{
"name": "Get Agent Lead Scores",
"request": {
"method": "GET",
"header": [
{
"key": "Content-Type",
"value": "application/json",
"type": "text"
}
],
"url": {
"raw": "{{base_url}}/api/agent/scoring/{{agent_id}}/scores?limit=20&offset=0",
"host": ["{{base_url}}"],
"path": ["api", "agent", "scoring", "{{agent_id}}", "scores"],
"query": [
{
"key": "limit",
"value": "20",
"description": "Number of lead scores to retrieve (default: 50)"
},
{
"key": "offset",
"value": "0",
"description": "Offset for pagination (default: 0)"
}
]
},
"description": "**Get Lead Scores for Specific Agent**\\n\\nRetrieves all lead scores calculated for a specific agent, including statistical insights.\\n\\n**Path Parameters:**\\n- `agentId`: The ID of the agent to get lead scores for\\n\\n**Query Parameters:**\\n- `limit` (optional): Number of scores to retrieve (default: 50)\\n- `offset` (optional): Offset for pagination (default: 0)\\n\\n**Features:**\\n- Returns lead scores with lead information\\n- Includes scoring configuration details\\n- Provides statistical analysis (average score, high score count)\\n- Supports pagination for large datasets\\n\\n**Response includes:**\\n- Agent basic information\\n- Array of lead scores with call details\\n- Lead information (name, phone, email)\\n- Scoring configuration used\\n- Statistical summary (total, average, high scores)\\n- Pagination information\\n\\n**Statistics:**\\n- Total number of scored calls\\n- Average score across all calls\\n- Count and percentage of high scores (≥7 points)\\n- Pagination metadata\\n\\n**Use Cases:**\\n- Analyze lead quality over time\\n- Identify high-value prospects\\n- Track agent performance\\n- Generate scoring reports"
},
"response": []
}
],
"event": [
{
"listen": "prerequest",
"script": {
"type": "text/javascript",
"exec": [
"// Auto-set JWT token if available in environment",
"if (pm.environment.get('jwt_token')) {",
" pm.request.headers.add({",

          "        key: 'Authorization',",
          "        value: 'Bearer ' + pm.environment.get('jwt_token')",
          "    });",
          "}"
        ]
      }
    }

]
}
