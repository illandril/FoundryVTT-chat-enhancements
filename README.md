# Illandril's Chat Enhancements
This is a module for Foundry Virtual Tabletop that adds a few enhancements to the chat.

![Screenshot showing the chat of "Joe (GM)" speaking as Jacreth Stewart](/screenshots/example-a.png?raw=true)

It currently does the following:
1. Shows the name of the player next to the name of the actor for any IC messages
1. Shows the name of the actor you are currently controlling
1. Replaces Actor names with Token names. Note: In the event the token associated with a chat message no longer exists, it will use the actor's prototype token's name. In the event the actor no longer exists, it will show "???" to all players, and the original chat message's alias (usually the actor's name) to the GM.
1. Hovering over a chat message act as if you hovered over the speaker's token 

# Installation
1. Open the Configuration and Setup for your FoundryVTT server
1. Open the Add-on Modules Tab
1. Click the Install Module button
1. In the Manifest URL input, specify https://github.com/illandril/FoundryVTT-chat-enhancements/releases/latest/download/module.json
1. Click Install
1. Launch your world
1. Log in as the GM
1. Open the Settings tab
1. Click Manage Modules
1. Check the checkbox for Illandril's Chat Enhancements
