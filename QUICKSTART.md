# Quick Start Guide

## Step 1: Install Dependencies

```bash
cd buddypress-mcp
npm install
```

## Step 2: Build the Server

```bash
npm run build
```

## Step 3: Configure Environment

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your BuddyPress site details:

```env
BUDDYPRESS_URL=http://yourdomain.com
BUDDYPRESS_USERNAME=admin
BUDDYPRESS_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx
```

## Step 4: Get Application Password

1. Log into your WordPress admin
2. Go to **Users → Profile**
3. Scroll to **Application Passwords**
4. Enter "BuddyPress MCP" as the name
5. Click **Add New Application Password**
6. Copy the generated password and paste it into your `.env` file

## Step 5: Configure Claude Desktop

**macOS:** Open `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows:** Open `%APPDATA%\Claude\claude_desktop_config.json`

Add this configuration:

```json
{
  "mcpServers": {
    "buddypress": {
      "command": "node",
      "args": [
        "/FULL/PATH/TO/buddypress-mcp/dist/index.js"
      ],
      "env": {
        "BUDDYPRESS_URL": "http://buddypress.local",
        "BUDDYPRESS_USERNAME": "admin",
        "BUDDYPRESS_PASSWORD": "xxxx xxxx xxxx xxxx xxxx xxxx"
      }
    }
  }
}
```

**Important:** Replace `/FULL/PATH/TO/` with the actual full path to your buddypress-mcp folder.

## Step 6: Restart Claude Desktop

Close and reopen Claude Desktop completely.

## Step 7: Test It!

Open Claude Desktop and try these commands:

1. **List activities:**
   ```
   Show me the latest activities from my BuddyPress site
   ```

2. **Create an activity:**
   ```
   Create a new activity post with the content "Testing MCP integration!"
   ```

3. **List members:**
   ```
   Show me all members on my BuddyPress site
   ```

4. **List groups:**
   ```
   Show me all groups and their member counts
   ```

## Troubleshooting

### "Tool not found" error
- Make sure you restarted Claude Desktop after adding the config
- Check that the path in `claude_desktop_config.json` is correct and absolute
- Verify the `dist/index.js` file exists (run `npm run build` if not)

### Authentication errors
- Verify your Application Password is correct (copy/paste carefully)
- Make sure the username matches your WordPress admin username
- Test the API manually: `curl -u username:password http://yoursite.com/wp-json/buddypress/v2/components`

### Connection errors
- Check that your BuddyPress site is accessible
- Verify the URL in your config is correct
- If using localhost, make sure the site is running

### "Command not found: node"
- Install Node.js from https://nodejs.org/
- Verify installation: `node --version`
- Restart your terminal after installation

## What's Next?

Check out the full README.md for:
- Complete list of available tools
- Advanced usage examples
- API reference
- Security best practices

## Example Queries for Claude

Once configured, try asking Claude:

- "What are the latest 5 activities on my BuddyPress site?"
- "Create a new public group called 'Developers' with the description 'A group for developers'"
- "Show me the profile data for user ID 2"
- "List all my unread notifications"
- "Send a message to user 3 with subject 'Hello' and message 'How are you?'"
- "What BuddyPress components are active on my site?"
- "Add user 5 to group 2"
- "Show me all friends of user 4"
