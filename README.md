# Discord.JS Bot Client (djs-client)

A simple Discord.JS bot client that can be used to create a bot for Discord.

## Installation

```bash
npm install @therealbenpai/djs-client
```

## Usage

```javascript
const { Client } = require('@therealbenpai/djs-client');

const client = new Client('PREFIX', 'TOKEN', 'CLIENT_ID', {
    buttonsDir: '';
    commandsDir: '';
    contextMenusDir: '';
    eventsDir: '';
    modalComponentsDir: '';
    predefinedMessagesDir: '';
    selectMenusDir: '';
    triggersDir: '';
})

client.start();
```
