/**
 * GoHighLevel API Client - READ + WRITE
 *
 * This client wraps the GHL v2 API for full CRM operations.
 * READ: contacts, pipelines, opportunities, conversations, calendars, tags, etc.
 * WRITE: create/update contacts, move pipeline stages, manage tags, create opportunities,
 *        manage workflows, create/update funnels, and more.
 *
 * All keys are loaded from the local .env file. Keys never leave this machine.
 */

import fetch from 'node-fetch';

const GHL_BASE_URL = 'https://services.leadconnectorhq.com';

export class GHLClient {
  constructor(apiKey, locationId) {
    this.apiKey = apiKey;
    this.locationId = locationId;
    this.headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Version': '2021-07-28',
      'Content-Type': 'application/json',
    };
  }

  // ========== BASE REQUEST METHODS ==========

  async _request(endpoint, params = {}) {
    const url = new URL(`${GHL_BASE_URL}${endpoint}`);
    params.locationId = this.locationId;

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GHL API Error ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  async _post(endpoint, body = {}) {
    const response = await fetch(`${GHL_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GHL API Error ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  async _put(endpoint, body = {}) {
    const response = await fetch(`${GHL_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GHL API Error ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  async _delete(endpoint) {
    const response = await fetch(`${GHL_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GHL API Error ${response.status}: ${errorText}`);
    }

    // Some DELETE endpoints return empty body
    const text = await response.text();
    return text ? JSON.parse(text) : { success: true };
  }

  // ===================================================
  // READ OPERATIONS
  // ===================================================

  // ========== CONTACTS (READ) ==========

  async getContacts({ limit = 20, query, startAfterId } = {}) {
    return this._request('/contacts/', { limit, query, startAfterId });
  }

  async getContact(contactId) {
    return this._request(`/contacts/${contactId}`);
  }

  async searchContacts(query, limit = 20) {
    return this._request('/contacts/', { query, limit });
  }

  // ========== PIPELINES & OPPORTUNITIES (READ) ==========

  async getPipelines() {
    return this._request('/opportunities/pipelines');
  }

  async getOpportunities({ pipelineId, stageId, limit = 20, startAfterId, query } = {}) {
    const params = { limit };
    if (pipelineId) params.pipelineId = pipelineId;
    if (stageId) params.stageId = stageId;
    if (startAfterId) params.startAfterId = startAfterId;
    if (query) params.query = query;
    return this._request('/opportunities/search', params);
  }

  async getOpportunity(opportunityId) {
    return this._request(`/opportunities/${opportunityId}`);
  }

  // ========== CONVERSATIONS (READ) ==========

  async getConversations({ limit = 20, startAfterId } = {}) {
    return this._request('/conversations/search', { limit, startAfterId });
  }

  async getConversation(conversationId) {
    return this._request(`/conversations/${conversationId}`);
  }

  async getMessages(conversationId, { limit = 20 } = {}) {
    return this._request(`/conversations/${conversationId}/messages`, { limit });
  }

  // ========== CALENDARS (READ) ==========

  async getCalendars() {
    return this._request('/calendars/');
  }

  async getCalendarEvents(calendarId, { startTime, endTime } = {}) {
    return this._request(`/calendars/events`, { calendarId, startTime, endTime });
  }

  // ========== CAMPAIGNS & WORKFLOWS (READ) ==========

  async getCampaigns() {
    return this._request('/campaigns/');
  }

  async getWorkflows() {
    return this._request(`/workflows/`);
  }

  // ========== USERS (READ) ==========

  async getUsers() {
    return this._request('/users/');
  }

  // ========== CUSTOM VALUES & FIELDS (READ) ==========

  async getCustomFields() {
    return this._request(`/locations/${this.locationId}/customFields`);
  }

  async getCustomValues() {
    return this._request(`/locations/${this.locationId}/customValues`);
  }

  // ========== TAGS (READ) ==========

  async getTags() {
    return this._request(`/locations/${this.locationId}/tags`);
  }

  // ========== FUNNELS (READ) ==========

  async getFunnels({ limit = 20, offset = 0 } = {}) {
    return this._request(`/funnels/funnel/list`, { locationId: this.locationId, limit, offset });
  }

  async getFunnel(funnelId) {
    return this._request(`/funnels/funnel/${funnelId}`);
  }

  async getFunnelPages(funnelId, { limit = 20, offset = 0 } = {}) {
    return this._request(`/funnels/funnel/${funnelId}/pages`, { limit, offset });
  }

  // ========== FORMS (READ) ==========

  async getForms() {
    return this._request(`/forms/`);
  }

  async getFormSubmissions(formId, { limit = 20, startAfterId } = {}) {
    return this._request(`/forms/submissions`, { formId, limit, startAfterId });
  }

  // ========== SURVEYS (READ) ==========

  async getSurveys() {
    return this._request(`/surveys/`);
  }

  // ========== TRIGGERS (READ) ==========

  async getTriggers() {
    return this._request(`/triggers/`);
  }

  // ===================================================
  // WRITE OPERATIONS
  // ===================================================

  // ========== CONTACTS (WRITE) ==========

  async createContact(data) {
    // data: { firstName, lastName, email, phone, tags[], customFields[], source, ... }
    return this._post('/contacts/', {
      ...data,
      locationId: this.locationId,
    });
  }

  async updateContact(contactId, data) {
    // data: { firstName, lastName, email, phone, tags[], customFields[], ... }
    return this._put(`/contacts/${contactId}`, data);
  }

  async deleteContact(contactId) {
    return this._delete(`/contacts/${contactId}`);
  }

  async addContactTag(contactId, tags) {
    // tags: ["tag1", "tag2"]
    return this._post(`/contacts/${contactId}/tags`, { tags });
  }

  async removeContactTag(contactId, tags) {
    return this._delete(`/contacts/${contactId}/tags`, { tags });
  }

  async addContactNote(contactId, body) {
    return this._post(`/contacts/${contactId}/notes`, { body });
  }

  async getContactNotes(contactId) {
    return this._request(`/contacts/${contactId}/notes`);
  }

  async addContactTask(contactId, { title, body, dueDate, completed = false } = {}) {
    return this._post(`/contacts/${contactId}/tasks`, {
      title,
      body,
      dueDate,
      completed,
    });
  }

  async getContactTasks(contactId) {
    return this._request(`/contacts/${contactId}/tasks`);
  }

  async bulkUpdateContacts(contactIds, data) {
    // Bulk operation: update multiple contacts at once
    const results = [];
    for (const id of contactIds) {
      try {
        const result = await this.updateContact(id, data);
        results.push({ id, success: true, result });
      } catch (e) {
        results.push({ id, success: false, error: e.message });
      }
    }
    return { results };
  }

  // ========== OPPORTUNITIES (WRITE) ==========

  async createOpportunity(data) {
    // data: { pipelineId, stageId, name, contactId, monetaryValue, source, ... }
    return this._post('/opportunities/', {
      ...data,
      locationId: this.locationId,
    });
  }

  async updateOpportunity(opportunityId, data) {
    // data: { stageId, name, monetaryValue, status, ... }
    return this._put(`/opportunities/${opportunityId}`, data);
  }

  async deleteOpportunity(opportunityId) {
    return this._delete(`/opportunities/${opportunityId}`);
  }

  async moveOpportunityStage(opportunityId, stageId) {
    return this._put(`/opportunities/${opportunityId}`, { stageId });
  }

  async updateOpportunityStatus(opportunityId, status) {
    // status: "open", "won", "lost", "abandoned"
    return this._put(`/opportunities/${opportunityId}/status`, { status });
  }

  // ========== PIPELINES (WRITE) ==========

  async createPipeline(data) {
    // data: { name, stages: [{ name }] }
    return this._post('/opportunities/pipelines', {
      ...data,
      locationId: this.locationId,
    });
  }

  async updatePipeline(pipelineId, data) {
    return this._put(`/opportunities/pipelines/${pipelineId}`, data);
  }

  // ========== TAGS (WRITE) ==========

  async createTag(name) {
    return this._post(`/locations/${this.locationId}/tags`, { name });
  }

  async updateTag(tagId, name) {
    return this._put(`/locations/${this.locationId}/tags/${tagId}`, { name });
  }

  async deleteTag(tagId) {
    return this._delete(`/locations/${this.locationId}/tags/${tagId}`);
  }

  // ========== CUSTOM FIELDS (WRITE) ==========

  async createCustomField(data) {
    // data: { name, dataType, placeholder, position }
    // dataType: "TEXT", "LARGE_TEXT", "NUMERICAL", "PHONE", "MONETORY", "CHECKBOX", "SINGLE_OPTIONS", "MULTIPLE_OPTIONS", "FLOAT", "DATE", "TEXTBOX_LIST", "FILE_UPLOAD", "SIGNATURE"
    return this._post(`/locations/${this.locationId}/customFields`, data);
  }

  async updateCustomField(customFieldId, data) {
    return this._put(`/locations/${this.locationId}/customFields/${customFieldId}`, data);
  }

  async deleteCustomField(customFieldId) {
    return this._delete(`/locations/${this.locationId}/customFields/${customFieldId}`);
  }

  // ========== CUSTOM VALUES (WRITE) ==========

  async createCustomValue(data) {
    // data: { name, value }
    return this._post(`/locations/${this.locationId}/customValues`, data);
  }

  async updateCustomValue(customValueId, data) {
    return this._put(`/locations/${this.locationId}/customValues/${customValueId}`, data);
  }

  async deleteCustomValue(customValueId) {
    return this._delete(`/locations/${this.locationId}/customValues/${customValueId}`);
  }

  // ========== CALENDARS (WRITE) ==========

  async createCalendar(data) {
    // data: { name, description, slug, ... }
    return this._post('/calendars/', {
      ...data,
      locationId: this.locationId,
    });
  }

  async updateCalendar(calendarId, data) {
    return this._put(`/calendars/${calendarId}`, data);
  }

  async deleteCalendar(calendarId) {
    return this._delete(`/calendars/${calendarId}`);
  }

  async createAppointment(data) {
    // data: { calendarId, contactId, startTime, endTime, title, ... }
    return this._post('/calendars/events/appointments', {
      ...data,
      locationId: this.locationId,
    });
  }

  async updateAppointment(eventId, data) {
    return this._put(`/calendars/events/appointments/${eventId}`, data);
  }

  // ========== WORKFLOWS (WRITE) ==========

  async createWorkflow(data) {
    // data: { name }
    return this._post(`/workflows/`, {
      ...data,
      locationId: this.locationId,
    });
  }

  // ========== TRIGGER LINKS ==========

  async createTriggerLink(data) {
    // data: { name, redirectTo }
    return this._post(`/links/`, {
      ...data,
      locationId: this.locationId,
    });
  }

  async updateTriggerLink(linkId, data) {
    return this._put(`/links/${linkId}`, data);
  }

  async deleteTriggerLink(linkId) {
    return this._delete(`/links/${linkId}`);
  }

  // ========== BULK OPERATIONS ==========

  async bulkTagContacts(contactIds, tags) {
    const results = [];
    for (const id of contactIds) {
      try {
        await this.addContactTag(id, tags);
        results.push({ id, success: true });
      } catch (e) {
        results.push({ id, success: false, error: e.message });
      }
    }
    return { results, tagged: results.filter(r => r.success).length, failed: results.filter(r => !r.success).length };
  }

  async bulkMoveOpportunities(opportunityIds, stageId) {
    const results = [];
    for (const id of opportunityIds) {
      try {
        await this.moveOpportunityStage(id, stageId);
        results.push({ id, success: true });
      } catch (e) {
        results.push({ id, success: false, error: e.message });
      }
    }
    return { results, moved: results.filter(r => r.success).length, failed: results.filter(r => !r.success).length };
  }

  async bulkAddNotes(contactIds, noteBody) {
    const results = [];
    for (const id of contactIds) {
      try {
        await this.addContactNote(id, noteBody);
        results.push({ id, success: true });
      } catch (e) {
        results.push({ id, success: false, error: e.message });
      }
    }
    return { results, noted: results.filter(r => r.success).length, failed: results.filter(r => !r.success).length };
  }
}
