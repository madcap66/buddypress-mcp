#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';

// Configuration
const BUDDYPRESS_URL = process.env.BUDDYPRESS_URL || 'http://buddypress.local';
const BUDDYPRESS_USERNAME = process.env.BUDDYPRESS_USERNAME || '';
const BUDDYPRESS_PASSWORD = process.env.BUDDYPRESS_PASSWORD || '';

// Helper function to make authenticated API requests
async function buddypressRequest(
  endpoint: string,
  method: string = 'GET',
  body?: any
): Promise<any> {
  const url = `${BUDDYPRESS_URL}/wp-json/buddypress/v1${endpoint}`;
  const auth = Buffer.from(`${BUDDYPRESS_USERNAME}:${BUDDYPRESS_PASSWORD}`).toString('base64');

  const options: any = {
    method,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`BuddyPress API Error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

// Define all tools
const tools: Tool[] = [
  // ============= ACTIVITY TOOLS =============
  {
    name: 'buddypress_list_activities',
    description: 'List activity stream items with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number (default: 1)' },
        per_page: { type: 'number', description: 'Items per page (default: 20)' },
        search: { type: 'string', description: 'Search term' },
        user_id: { type: 'number', description: 'Filter by user ID' },
        group_id: { type: 'number', description: 'Filter by group ID' },
        scope: { type: 'string', description: 'Activity scope (all, friends, groups, favorites, mentions)' },
        display_comments: { type: 'boolean', description: 'Include comments' },
      },
    },
  },
  {
    name: 'buddypress_get_activity',
    description: 'Get a single activity item by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Activity ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'buddypress_create_activity',
    description: 'Create a new activity item',
    inputSchema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'Activity content' },
        user_id: { type: 'number', description: 'User ID (default: current user)' },
        component: { type: 'string', description: 'Component (activity, groups, members, etc.)' },
        type: { type: 'string', description: 'Activity type (activity_update, activity_comment, etc.)' },
        primary_item_id: { type: 'number', description: 'Primary item ID (e.g., group ID)' },
        secondary_item_id: { type: 'number', description: 'Secondary item ID' },
      },
      required: ['content'],
    },
  },
  {
    name: 'buddypress_update_activity',
    description: 'Update an existing activity item',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Activity ID' },
        content: { type: 'string', description: 'New activity content' },
      },
      required: ['id'],
    },
  },
  {
    name: 'buddypress_delete_activity',
    description: 'Delete an activity item',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Activity ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'buddypress_favorite_activity',
    description: 'Favorite or unfavorite an activity item',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Activity ID' },
      },
      required: ['id'],
    },
  },

  // ============= MEMBERS TOOLS =============
  {
    name: 'buddypress_list_members',
    description: 'List BuddyPress members with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number (default: 1)' },
        per_page: { type: 'number', description: 'Items per page (default: 20)' },
        search: { type: 'string', description: 'Search term' },
        user_ids: { type: 'string', description: 'Comma-separated user IDs' },
        member_type: { type: 'string', description: 'Member type' },
        exclude: { type: 'string', description: 'Comma-separated user IDs to exclude' },
      },
    },
  },
  {
    name: 'buddypress_get_member',
    description: 'Get a single member by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'User ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'buddypress_update_member',
    description: 'Update member profile information',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'User ID' },
        name: { type: 'string', description: 'Display name' },
        description: { type: 'string', description: 'User biography' },
        member_type: { type: 'string', description: 'Member type' },
      },
      required: ['id'],
    },
  },
  {
    name: 'buddypress_delete_member',
    description: 'Delete a member',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'User ID' },
        reassign: { type: 'number', description: 'User ID to reassign content to' },
      },
      required: ['id'],
    },
  },

  // ============= GROUPS TOOLS =============
  {
    name: 'buddypress_list_groups',
    description: 'List BuddyPress groups with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number (default: 1)' },
        per_page: { type: 'number', description: 'Items per page (default: 20)' },
        search: { type: 'string', description: 'Search term' },
        status: { type: 'string', description: 'Group status (public, private, hidden)' },
        user_id: { type: 'number', description: 'Filter groups by user membership' },
        group_type: { type: 'string', description: 'Group type' },
      },
    },
  },
  {
    name: 'buddypress_get_group',
    description: 'Get a single group by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Group ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'buddypress_create_group',
    description: 'Create a new group',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Group name' },
        description: { type: 'string', description: 'Group description' },
        status: { type: 'string', description: 'Group status (public, private, hidden)' },
        enable_forum: { type: 'boolean', description: 'Enable group forum' },
        creator_id: { type: 'number', description: 'Creator user ID (default: current user)' },
      },
      required: ['name'],
    },
  },
  {
    name: 'buddypress_update_group',
    description: 'Update an existing group',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Group ID' },
        name: { type: 'string', description: 'Group name' },
        description: { type: 'string', description: 'Group description' },
        status: { type: 'string', description: 'Group status (public, private, hidden)' },
      },
      required: ['id'],
    },
  },
  {
    name: 'buddypress_delete_group',
    description: 'Delete a group',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Group ID' },
      },
      required: ['id'],
    },
  },

  // ============= GROUP MEMBERSHIP TOOLS =============
  {
    name: 'buddypress_list_group_members',
    description: 'List members of a specific group',
    inputSchema: {
      type: 'object',
      properties: {
        group_id: { type: 'number', description: 'Group ID' },
        page: { type: 'number', description: 'Page number (default: 1)' },
        per_page: { type: 'number', description: 'Items per page (default: 20)' },
        roles: { type: 'string', description: 'Filter by roles (admin, mod, member, banned)' },
      },
      required: ['group_id'],
    },
  },
  {
    name: 'buddypress_add_group_member',
    description: 'Add a member to a group',
    inputSchema: {
      type: 'object',
      properties: {
        group_id: { type: 'number', description: 'Group ID' },
        user_id: { type: 'number', description: 'User ID' },
        role: { type: 'string', description: 'Member role (member, mod, admin)' },
      },
      required: ['group_id', 'user_id'],
    },
  },
  {
    name: 'buddypress_remove_group_member',
    description: 'Remove a member from a group',
    inputSchema: {
      type: 'object',
      properties: {
        group_id: { type: 'number', description: 'Group ID' },
        user_id: { type: 'number', description: 'User ID' },
      },
      required: ['group_id', 'user_id'],
    },
  },

  // ============= XPROFILE TOOLS =============
  {
    name: 'buddypress_list_xprofile_groups',
    description: 'List XProfile field groups',
    inputSchema: {
      type: 'object',
      properties: {
        fetch_fields: { type: 'boolean', description: 'Include fields in response' },
      },
    },
  },
  {
    name: 'buddypress_get_xprofile_group',
    description: 'Get a single XProfile field group',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Field group ID' },
        fetch_fields: { type: 'boolean', description: 'Include fields in response' },
      },
      required: ['id'],
    },
  },
  {
    name: 'buddypress_list_xprofile_fields',
    description: 'List XProfile fields',
    inputSchema: {
      type: 'object',
      properties: {
        profile_group_id: { type: 'number', description: 'Filter by field group ID' },
        fetch_field_data: { type: 'boolean', description: 'Include field data' },
      },
    },
  },
  {
    name: 'buddypress_get_xprofile_field',
    description: 'Get a single XProfile field',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Field ID' },
        fetch_field_data: { type: 'boolean', description: 'Include field data' },
      },
      required: ['id'],
    },
  },
  {
    name: 'buddypress_get_xprofile_data',
    description: 'Get XProfile data for a specific user and field',
    inputSchema: {
      type: 'object',
      properties: {
        field_id: { type: 'number', description: 'Field ID' },
        user_id: { type: 'number', description: 'User ID' },
      },
      required: ['field_id', 'user_id'],
    },
  },
  {
    name: 'buddypress_update_xprofile_data',
    description: 'Update XProfile data for a specific user and field',
    inputSchema: {
      type: 'object',
      properties: {
        field_id: { type: 'number', description: 'Field ID' },
        user_id: { type: 'number', description: 'User ID' },
        value: { type: 'string', description: 'Field value' },
      },
      required: ['field_id', 'user_id', 'value'],
    },
  },

  // ============= FRIENDS TOOLS =============
  {
    name: 'buddypress_list_friends',
    description: 'List friendships',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: { type: 'number', description: 'User ID to get friends for' },
        is_confirmed: { type: 'boolean', description: 'Filter by confirmed status' },
        page: { type: 'number', description: 'Page number (default: 1)' },
        per_page: { type: 'number', description: 'Items per page (default: 20)' },
      },
    },
  },
  {
    name: 'buddypress_create_friendship',
    description: 'Create a friendship request',
    inputSchema: {
      type: 'object',
      properties: {
        initiator_id: { type: 'number', description: 'Initiator user ID' },
        friend_id: { type: 'number', description: 'Friend user ID' },
      },
      required: ['initiator_id', 'friend_id'],
    },
  },
  {
    name: 'buddypress_delete_friendship',
    description: 'Delete a friendship',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Friendship ID' },
      },
      required: ['id'],
    },
  },

  // ============= MESSAGES TOOLS =============
  {
    name: 'buddypress_list_messages',
    description: 'List message threads',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: { type: 'number', description: 'User ID to get messages for' },
        box: { type: 'string', description: 'Message box (inbox, sentbox, notices)' },
        type: { type: 'string', description: 'Message type (all, read, unread)' },
        page: { type: 'number', description: 'Page number (default: 1)' },
        per_page: { type: 'number', description: 'Items per page (default: 20)' },
      },
    },
  },
  {
    name: 'buddypress_get_message',
    description: 'Get a single message thread',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Thread ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'buddypress_create_message',
    description: 'Create a new message',
    inputSchema: {
      type: 'object',
      properties: {
        sender_id: { type: 'number', description: 'Sender user ID (default: current user)' },
        recipients: { type: 'array', items: { type: 'number' }, description: 'Array of recipient user IDs' },
        subject: { type: 'string', description: 'Message subject' },
        message: { type: 'string', description: 'Message content' },
      },
      required: ['recipients', 'subject', 'message'],
    },
  },
  {
    name: 'buddypress_delete_message',
    description: 'Delete a message thread',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Thread ID' },
      },
      required: ['id'],
    },
  },

  // ============= NOTIFICATIONS TOOLS =============
  {
    name: 'buddypress_list_notifications',
    description: 'List notifications',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: { type: 'number', description: 'User ID to get notifications for' },
        is_new: { type: 'boolean', description: 'Filter by unread status' },
        page: { type: 'number', description: 'Page number (default: 1)' },
        per_page: { type: 'number', description: 'Items per page (default: 20)' },
      },
    },
  },
  {
    name: 'buddypress_get_notification',
    description: 'Get a single notification',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Notification ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'buddypress_update_notification',
    description: 'Update notification (mark as read/unread)',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Notification ID' },
        is_new: { type: 'boolean', description: 'Mark as unread (true) or read (false)' },
      },
      required: ['id'],
    },
  },
  {
    name: 'buddypress_delete_notification',
    description: 'Delete a notification',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Notification ID' },
      },
      required: ['id'],
    },
  },

  // ============= COMPONENTS TOOL =============
  {
    name: 'buddypress_list_components',
    description: 'List active BuddyPress components',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

// Create server instance
const server = new Server(
  {
    name: 'buddypress-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: any;

    // Ensure args is defined
    if (!args) {
      throw new Error('Missing required arguments');
    }

    // Activity Tools
    if (name === 'buddypress_list_activities') {
      const params = new URLSearchParams();
      if (args.page) params.append('page', String(args.page));
      if (args.per_page) params.append('per_page', String(args.per_page));
      if (args.search) params.append('search', String(args.search));
      if (args.user_id) params.append('user_id', String(args.user_id));
      if (args.group_id) params.append('group_id', String(args.group_id));
      if (args.scope) params.append('scope', String(args.scope));
      if (args.display_comments !== undefined) params.append('display_comments', String(args.display_comments));
      result = await buddypressRequest(`/activity?${params}`);
    }
    else if (name === 'buddypress_get_activity') {
      result = await buddypressRequest(`/activity/${args.id}`);
    }
    else if (name === 'buddypress_create_activity') {
      result = await buddypressRequest('/activity', 'POST', args);
    }
    else if (name === 'buddypress_update_activity') {
      const { id, ...body } = args as any;
      result = await buddypressRequest(`/activity/${id}`, 'PUT', body);
    }
    else if (name === 'buddypress_delete_activity') {
      result = await buddypressRequest(`/activity/${args.id}`, 'DELETE');
    }
    else if (name === 'buddypress_favorite_activity') {
      result = await buddypressRequest(`/activity/${args.id}/favorite`, 'PUT');
    }

    // Members Tools
    else if (name === 'buddypress_list_members') {
      const params = new URLSearchParams();
      if (args.page) params.append('page', String(args.page));
      if (args.per_page) params.append('per_page', String(args.per_page));
      if (args.search) params.append('search', String(args.search));
      if (args.user_ids) params.append('include', String(args.user_ids));
      if (args.member_type) params.append('member_type', String(args.member_type));
      if (args.exclude) params.append('exclude', String(args.exclude));
      result = await buddypressRequest(`/members?${params}`);
    }
    else if (name === 'buddypress_get_member') {
      result = await buddypressRequest(`/members/${args.id}`);
    }
    else if (name === 'buddypress_update_member') {
      const { id, ...body } = args as any;
      result = await buddypressRequest(`/members/${id}`, 'PUT', body);
    }
    else if (name === 'buddypress_delete_member') {
      const { id, reassign } = args as any;
      const params = reassign ? `?reassign=${reassign}` : '';
      result = await buddypressRequest(`/members/${id}${params}`, 'DELETE');
    }

    // Groups Tools
    else if (name === 'buddypress_list_groups') {
      const params = new URLSearchParams();
      if (args.page) params.append('page', String(args.page));
      if (args.per_page) params.append('per_page', String(args.per_page));
      if (args.search) params.append('search', String(args.search));
      if (args.status) params.append('status', String(args.status));
      if (args.user_id) params.append('user_id', String(args.user_id));
      if (args.group_type) params.append('group_type', String(args.group_type));
      result = await buddypressRequest(`/groups?${params}`);
    }
    else if (name === 'buddypress_get_group') {
      result = await buddypressRequest(`/groups/${args.id}`);
    }
    else if (name === 'buddypress_create_group') {
      result = await buddypressRequest('/groups', 'POST', args);
    }
    else if (name === 'buddypress_update_group') {
      const { id, ...body } = args as any;
      result = await buddypressRequest(`/groups/${id}`, 'PUT', body);
    }
    else if (name === 'buddypress_delete_group') {
      result = await buddypressRequest(`/groups/${args.id}`, 'DELETE');
    }

    // Group Membership Tools
    else if (name === 'buddypress_list_group_members') {
      const { group_id, ...params } = args as any;
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', String(params.page));
      if (params.per_page) queryParams.append('per_page', String(params.per_page));
      if (params.roles) queryParams.append('roles', String(params.roles));
      result = await buddypressRequest(`/groups/${group_id}/members?${queryParams}`);
    }
    else if (name === 'buddypress_add_group_member') {
      const { group_id, user_id, role } = args as any;
      result = await buddypressRequest(`/groups/${group_id}/members`, 'POST', { user_id, role });
    }
    else if (name === 'buddypress_remove_group_member') {
      const { group_id, user_id } = args as any;
      result = await buddypressRequest(`/groups/${group_id}/members/${user_id}`, 'DELETE');
    }

    // XProfile Tools
    else if (name === 'buddypress_list_xprofile_groups') {
      const params = new URLSearchParams();
      if (args.fetch_fields !== undefined) params.append('fetch_fields', String(args.fetch_fields));
      result = await buddypressRequest(`/xprofile/groups?${params}`);
    }
    else if (name === 'buddypress_get_xprofile_group') {
      const params = new URLSearchParams();
      if (args.fetch_fields !== undefined) params.append('fetch_fields', String(args.fetch_fields));
      result = await buddypressRequest(`/xprofile/groups/${args.id}?${params}`);
    }
    else if (name === 'buddypress_list_xprofile_fields') {
      const params = new URLSearchParams();
      if (args.profile_group_id) params.append('profile_group_id', String(args.profile_group_id));
      if (args.fetch_field_data !== undefined) params.append('fetch_field_data', String(args.fetch_field_data));
      result = await buddypressRequest(`/xprofile/fields?${params}`);
    }
    else if (name === 'buddypress_get_xprofile_field') {
      const params = new URLSearchParams();
      if (args.fetch_field_data !== undefined) params.append('fetch_field_data', String(args.fetch_field_data));
      result = await buddypressRequest(`/xprofile/fields/${args.id}?${params}`);
    }
    else if (name === 'buddypress_get_xprofile_data') {
      result = await buddypressRequest(`/xprofile/${args.field_id}/data/${args.user_id}`);
    }
    else if (name === 'buddypress_update_xprofile_data') {
      const { field_id, user_id, value } = args as any;
      result = await buddypressRequest(`/xprofile/${field_id}/data/${user_id}`, 'PUT', { value });
    }

    // Friends Tools
    else if (name === 'buddypress_list_friends') {
      const params = new URLSearchParams();
      if (args.user_id) params.append('user_id', String(args.user_id));
      if (args.is_confirmed !== undefined) params.append('is_confirmed', String(args.is_confirmed));
      if (args.page) params.append('page', String(args.page));
      if (args.per_page) params.append('per_page', String(args.per_page));
      result = await buddypressRequest(`/friends?${params}`);
    }
    else if (name === 'buddypress_create_friendship') {
      result = await buddypressRequest('/friends', 'POST', args);
    }
    else if (name === 'buddypress_delete_friendship') {
      result = await buddypressRequest(`/friends/${args.id}`, 'DELETE');
    }

    // Messages Tools
    else if (name === 'buddypress_list_messages') {
      const params = new URLSearchParams();
      if (args.user_id) params.append('user_id', String(args.user_id));
      if (args.box) params.append('box', String(args.box));
      if (args.type) params.append('type', String(args.type));
      if (args.page) params.append('page', String(args.page));
      if (args.per_page) params.append('per_page', String(args.per_page));
      result = await buddypressRequest(`/messages?${params}`);
    }
    else if (name === 'buddypress_get_message') {
      result = await buddypressRequest(`/messages/${args.id}`);
    }
    else if (name === 'buddypress_create_message') {
      result = await buddypressRequest('/messages', 'POST', args);
    }
    else if (name === 'buddypress_delete_message') {
      result = await buddypressRequest(`/messages/${args.id}`, 'DELETE');
    }

    // Notifications Tools
    else if (name === 'buddypress_list_notifications') {
      const params = new URLSearchParams();
      if (args.user_id) params.append('user_id', String(args.user_id));
      if (args.is_new !== undefined) params.append('is_new', String(args.is_new));
      if (args.page) params.append('page', String(args.page));
      if (args.per_page) params.append('per_page', String(args.per_page));
      result = await buddypressRequest(`/notifications?${params}`);
    }
    else if (name === 'buddypress_get_notification') {
      result = await buddypressRequest(`/notifications/${args.id}`);
    }
    else if (name === 'buddypress_update_notification') {
      const { id, ...body } = args as any;
      result = await buddypressRequest(`/notifications/${id}`, 'PUT', body);
    }
    else if (name === 'buddypress_delete_notification') {
      result = await buddypressRequest(`/notifications/${args.id}`, 'DELETE');
    }

    // Components Tool
    else if (name === 'buddypress_list_components') {
      result = await buddypressRequest('/components');
    }

    else {
      throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('BuddyPress MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
