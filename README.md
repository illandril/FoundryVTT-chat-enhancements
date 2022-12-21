# Illandril's Chat Enhancements
![Latest Version](https://img.shields.io/badge/dynamic/json?color=4b0000&label=Latest%20Version&query=$.version&url=https%3A%2F%2Fgithub.com%2Fillandril%2FFoundryVTT-chat-enhancements%2Freleases%2Flatest%2Fdownload%2Fmodule.json)
![Latest Release Download Count](https://img.shields.io/github/downloads/illandril/FoundryVTT-chat-enhancements/latest/module.zip?color=4b0000&label=Downloads)
![Forge Installs](https://img.shields.io/badge/dynamic/json?color=4b0000&label=Forge%20Installs&query=package.installs&url=http%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fillandril-chat-enhancements&suffix=%25)
![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json?color=4b0000&label=Foundry%20Version&query=$.compatibility.minimum&url=https%3A%2F%2Fgithub.com%2Fillandril%2FFoundryVTT-chat-enhancements%2Freleases%2Flatest%2Fdownload%2Fmodule.json)

This is a module for Foundry Virtual Tabletop that adds a few enhancements to the chat.

![Screenshot showing the chat of "Joe (GM)" speaking as Jacreth Stewart](/screenshots/example-a.png?raw=true)

It currently does the following:
1. Shows the name of the player next to the name of the actor for any IC messages
1. Shows the name of the actor you are currently controlling
1. Allows you to quickly select any actor you own's token (as long as it's on the same scene) by right-clicking the name of the actor you are currently controlling
1. ~Replaces Actor names with Token names. Note: In the event the token associated with a chat message no longer exists, it will use the actor's prototype token's name. In the event the actor no longer exists, it will show "???" to all players, and the original chat message's alias (usually the actor's name) to the GM.~ (This is now done by Foundry directly)
1. Hovering over the speaker's name in a chat message act as if you hovered over the speaker's token
1. Double-clicking the speaker's name in a chat message pans the canvas to show that token (if the token is visible)


Note: If you only want to see who you are speaking as, and want to be able to turn off the other features of this module, I am planning to add settings in the future to pick and choose features ([see issue #14](https://github.com/illandril/FoundryVTT-chat-enhancements/issues/14))... but until then, MrVauxs has created a module that is a paired-down version of this module: https://github.com/MrVauxs/speaking-as
