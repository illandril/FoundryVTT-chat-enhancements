# Illandril's Chat Enhancements

| [![Illandril](https://avatars.githubusercontent.com/illandril?size=64)](https://github.com/illandril) | [![Author](https://img.shields.io/badge/Joe%20Spandrusyszyn-Illandril?style=flat&labelColor=520&color=250&label=Illandril)](https://github.com/illandril) [![License](https://img.shields.io/github/license/illandril/FoundryVTT-chat-enhancements?style=flat&labelColor=520&color=250&label=license)](https://github.com/illandril/FoundryVTT-chat-enhancements/blob/main/LICENSE) <br> [![Version](https://img.shields.io/github/v/release/illandril/FoundryVTT-chat-enhancements?style=flat&labelColor=520&color=250&label=version)](https://github.com/illandril/FoundryVTT-chat-enhancements/releases) [![Open Issues](https://img.shields.io/github/issues/illandril/FoundryVTT-chat-enhancements?style=flat&labelColor=520&color=250&logo=github&label=issues)](https://github.com/illandril/FoundryVTT-chat-enhancements/issues) [![Latest Release Download Count](https://img.shields.io/github/downloads/illandril/FoundryVTT-chat-enhancements/latest/module.zip?style=flat&labelColor=520&color=250&label=downloads)](#) <br> [![Foundry Minimum Version](https://img.shields.io/badge/dynamic/json?style=flat&labelColor=520&color=250&label=Min.%20Foundry%20&prefix=v&query=$.compatibility.minimum&url=https%3A%2F%2Fgithub.com%2Fillandril%2FFoundryVTT-chat-enhancements%2Freleases%2Flatest%2Fdownload%2Fmodule.json)](https://foundryvtt.com/packages/illandril-chat-enhancements) [![Foundry Verified Version](https://img.shields.io/badge/dynamic/json?style=flat&labelColor=520&color=250&label=Verified%20on&prefix=v&query=$.compatibility.verified&url=https%3A%2F%2Fgithub.com%2Fillandril%2FFoundryVTT-chat-enhancements%2Freleases%2Flatest%2Fdownload%2Fmodule.json)](https://foundryvtt.com/packages/illandril-chat-enhancements) [![Forge Installs](https://img.shields.io/badge/dynamic/json?style=flat&labelColor=520&color=250&label=Forge%20Installs&query=package.installs&url=http%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fillandril-chat-enhancements&suffix=%25)](https://forge-vtt.com/bazaar/package/illandril-chat-enhancements) |
| --- | :--- |

This is a module for Foundry Virtual Tabletop that adds a few enhancements to the chat.

![Screenshot showing the chat of "Joe (GM)" speaking as Jacreth Stewart](/screenshots/example-a.png?raw=true)

It currently does the following:
1. Shows the name of the player next to the name of the actor for any IC messages
1. Shows the name of the actor you are currently controlling
1. Allows you to quickly select any actor you own's token (as long as it's on the same scene) by right-clicking the name of the actor you are currently controlling
1. Hovering over the speaker's name in a chat message act as if you hovered over the speaker's token
1. Double-clicking the speaker's name in a chat message pans the canvas to show that token (if the token is visible)
1. An option to prune the chat log down whenver a GM opens Foundry if it is above a configurable threshold
