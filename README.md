# Voice Actor for FVTT

![VoiceActor Release](https://github.com/BlitzKraig/fvtt-VoiceActor/workflows/VoiceActor%20Release/badge.svg)
![Latest Release Download Count](https://img.shields.io/github/downloads/BlitzKraig/fvtt-VoiceActor/latest/voiceactor-release.zip)

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Q5Q01YIEJ)

# Important note for servers accessed over HTTP/IP

Chrome and Firefox will not ask you to grant microphone permissions if you do not have an SSL enabled site, they will just refuse automatically, breaking the module.

If you only want the GM to record via the module, use `localhost` to access Foundry if possible.

If this is not possible due to external hosting etc., I have discovered a workaround for Chrome, and a slightly worse workaround for Firefox.

## *PROCEED AT YOUR OWN RISK*

These workarounds should be safe, but I am not a security expert.
I would advise running via localhost, or setting up SSL for your server.

## Chrome (Secure-ish workaround)

* Navigate to `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
* Enable the flag and add your foundry IP and port: `http://ip.address.here:30000`
* Relaunch, and Chrome will now ask for mic permissions when you try to record to an actor

## Firefox (Less secure workaround)

* Navigate to `about:config`
* Search for `insecure`
* Set `media.devices.insecure.enabled` to `true`
* Set `media.getusermedia.insecure.enabled` to `true`
* Refresh foundry page, Firefox will now ask for mic permission when you try to record to an actor

## The difference

Chrome lets you whitelist the server directly, meaning the security holes this potentially exposes can't be taken advantage of by other insecure sites.
Firefox only lets you blanket allow insecure `getusermedia` and `devices`, meaning an insecure site could theoretically try to take advantage of this.

Because they are both permissions-based, you need to actually allow the site to use them, so the risk is pretty low. HOWEVER, **you do this at your own risk!**
I would advise looking into setting up an HTTPS foundry server.

# Now that's out of the way, on to the module!

## What's it for?

This module is my very late and unofficial D20 day contribution!
I wrote it in a couple of hours, hoping it would help me dip my feet back into Foundry module development.
It's pretty simple, a little hacky, and contains some less than stellar coding practices... BUT, it's also pretty useful!

In a nutshell, I find myself constantly asking my players "What did I make this guy sound like again?..." whenever we revisit an NPC.
This module should help with that problem, allowing the GM to record a sample of an NPC's voice directly in their sheet, or in a journal entry, and play it back privately whenever they want.

## What does it do?

Adds two new buttons to the titlebar of an actor sheet and journal entry, allowing you to record and play-back a clip.

Records directly from whatever your browsers input source is, and saves the file to a VoiceActor directory in your userdata root.

Clips can be 30 seconds max, and can be ended early by clicking the stop button.

Linked actors will have a single recorded clip, saved using their actor ID.

Journal entries will have a single recorded clip, saved using their entry ID in a Journal/ directory inside the VoiceActor/ directory

Unlinked actors will have a clip saved based on their ID and actor name.
This means unlinked actors with the same name will share the same clip, but changing an actors name in their unlinked sheet after spawning will allow you to record a clip for that actor specifically (and any other actors of that 'type' with the same name)

e.g. If you change one unlinked Goblin's name to "Boblin" in his actor sheet, he can have his own special clip recorded. All of the goblins named "Goblin" will share a single clip.

## How do I use it?

Install & enable the module

Double click a token to open their actor sheet (or open a journal entry)

Note the 2 new buttons at the top left of the window

Click the microphone button to record (up to 10 seconds)

Click again to stop recording

Click play to playback the recorded audio (does not broadcast, only plays for the GM)

Shift-click play to broadcast to all players (note that this isn't what the module is designed for, but it was easy enough to implement, so I've jammed it in there in case you want to give your NPCs a repeatable greeting, or give your ogres a nice roar)

Shift-click the microphone button to record a new clip, overwriting the previous clip for that actor

## What else should I know?

Linked actor tokens will save their clip using the actor ID. This means your BBEG NPC can have a clip recorded, and will play back that same clip on every spawned token.

Unlinked actor tokens will save their clip using the actor ID AND the actor name. This means, for example, all of your "Commoner"s will share a clip, except tokens you spawn and then change the name of. Maybe there's a memorable NPC that uses the Commoner statblock - no problem! Spawn a Commoner, double click the token, change the token name to your NPC's name, then record your clip!

## Manifest

`https://raw.githubusercontent.com/BlitzKraig/fvtt-VoiceActor/master/module.json`

## Future Ideas

Custom upload directory

## Feedback

This module is open for feedback and suggestions! I would love to improve it and implement new features.

For bugs/feedback, create an issue on GitHub, or contact me on Discord at Blitz#6797

## [Release Notes](./CHANGELOG.md)
