# BuddyPress MCP Server

A Model Context Protocol (MCP) server that provides comprehensive integration with BuddyPress REST API v2. This server enables AI assistants like Claude to interact with BuddyPress sites, managing activities, members, groups, profiles, messages, and more.

## Features

### Activity Management
- List, create, update, and delete activity items
- Favorite/unfavorite activities
- Filter by user, group, scope, and search terms

### Member Management
- List and search members
- Get member profiles
- Update member information
- Delete members

### Group Management
- List, create, update, and delete groups
- Manage group membership
- Handle group invites and membership requests
- Filter groups by status, type, and user

### XProfile (Extended Profiles)
- List profile field groups and fields
- Get and update user profile data
- Manage custom profile fields

### Friends & Social
- List friendships
- Create and manage friend requests
- Delete friendships

### Messages
- List message threads
- Send new messages
- Manage conversations
- Filter by inbox/sentbox

### Notifications
- List user notifications
- Mark notifications as read/unread
- Delete notifications

### Components
- List active BuddyPress components

## Installation

1. **Clone or create the directory:**
   ```bash
   mkdir buddypress-mcp
   cd buddypress-mcp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the TypeScript code:**
   ```bash
   npm run build
   ```

## Configuration

Set the following environment variables:

```bash
export BUDDYPRESS_URL="http://yourdomain.com"
export BUDDYPRESS_USERNAME="your-username"
export BUDDYPRESS_PASSWORD="your-application-password"
```

### Creating an Application Password

For WordPress/BuddyPress authentication:

1. Go to your WordPress admin dashboard
2. Navigate to Users → Profile
3. Scroll to "Application Passwords" section
4. Create a new application password
5. Use this password (not your regular password) for authentication

## Usage with Claude Desktop

Add this configuration to your Claude Desktop config file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "buddypress": {
      "command": "node",
      "args": [
        "/path/to/buddypress-mcp/dist/index.js"
      ],
      "env": {
        "BUDDYPRESS_URL": "http://buddypress.local",
        "BUDDYPRESS_USERNAME": "admin",
        "BUDDYPRESS_PASSWORD": "your-application-password"
      }
    }
  }
}
```

After adding the configuration, restart Claude Desktop.

## Available Tools

### Activity Tools
- `buddypress_list_activities` - List activity stream items
- `buddypress_get_activity` - Get single activity
- `buddypress_create_activity` - Create new activity
- `buddypress_update_activity` - Update activity
- `buddypress_delete_activity` - Delete activity
- `buddypress_favorite_activity` - Favorite/unfavorite activity

### Member Tools
- `buddypress_list_members` - List members
- `buddypress_get_member` - Get single member
- `buddypress_update_member` - Update member profile
- `buddypress_delete_member` - Delete member

### Group Tools
- `buddypress_list_groups` - List groups
- `buddypress_get_group` - Get single group
- `buddypress_create_group` - Create new group
- `buddypress_update_group` - Update group
- `buddypress_delete_group` - Delete group
- `buddypress_list_group_members` - List group members
- `buddypress_add_group_member` - Add member to group
- `buddypress_remove_group_member` - Remove member from group

### XProfile Tools
- `buddypress_list_xprofile_groups` - List field groups
- `buddypress_get_xprofile_group` - Get field group
- `buddypress_list_xprofile_fields` - List profile fields
- `buddypress_get_xprofile_field` - Get profile field
- `buddypress_get_xprofile_data` - Get user profile data
- `buddypress_update_xprofile_data` - Update user profile data

### Friends Tools
- `buddypress_list_friends` - List friendships
- `buddypress_create_friendship` - Create friend request
- `buddypress_delete_friendship` - Delete friendship

### Messages Tools
- `buddypress_list_messages` - List message threads
- `buddypress_get_message` - Get message thread
- `buddypress_create_message` - Send new message
- `buddypress_delete_message` - Delete message thread

### Notifications Tools
- `buddypress_list_notifications` - List notifications
- `buddypress_get_notification` - Get single notification
- `buddypress_update_notification` - Update notification status
- `buddypress_delete_notification` - Delete notification

### Components Tool
- `buddypress_list_components` - List active components

## Example Usage

Once configured, you can ask Claude to interact with your BuddyPress site:

```
"Show me the latest 10 activities on my BuddyPress site"

"Create a new activity post with the content 'Hello from MCP!'"

"List all groups and show me their member counts"

"Get the profile data for user ID 5"

"Send a message to users 3 and 4 with subject 'Meeting' and content 'Let's meet tomorrow'"

"Show me all unread notifications for user 2"
```

## Development

### Build
```bash
npm run build
```

### Watch Mode
```bash
npm run watch
```

### Run
```bash
npm start
```

## Security Notes

1. **Application Passwords:** Always use WordPress Application Passwords instead of your main password
2. **HTTPS:** Use HTTPS in production environments
3. **Permissions:** Ensure the authenticated user has appropriate permissions
4. **Environment Variables:** Never commit credentials to version control

## API Reference

This MCP server uses BuddyPress REST API v2. For detailed API documentation, visit:
- [BuddyPress REST API Documentation](https://developer.buddypress.org/bp-rest-api/)

## Troubleshooting

### Authentication Errors
- Verify your application password is correct
- Check that the user has necessary permissions
- Ensure the BuddyPress REST API is accessible

### Connection Errors
- Verify the BUDDYPRESS_URL is correct
- Check that the site is accessible
- Ensure no firewall or security plugins are blocking API requests

### Tool Not Found
- Restart Claude Desktop after configuration changes
- Check the config file syntax is valid JSON
- Verify the path to the built JavaScript file is correct

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License

## Support

For issues and questions:
- BuddyPress: https://buddypress.org/support/
- MCP SDK: https://github.com/anthropics/model-context-protocol

## Version History

### 1.0.0
- Initial release
- Support for Activity, Members, Groups, XProfile, Friends, Messages, Notifications
- Full CRUD operations for major endpoints
- Comprehensive filtering and pagination
