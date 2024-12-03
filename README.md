<p align="center"><img src="https://imgur.com/Hsjadq7.gif" title="megaphJam emote by @wannabe_mailman" width="10%"></img></p>

# <p align="center">MIDIphonix</p>
## <p align="center">Control FL Studio with Twitch chat commands</p>

MIDIphonix is a locally-run bot that listens for Twitch chat commands and translates them into real-time, local MIDI messages for controlling FL Studio. It requires a specific FL project file (.flp) set up with MIDI routing to match the codebase (coming soon).

See *[Available commands](#Available-commands)* below and try it out on https://twitch.tv/megaphonix (when I’m live)

## Credits/Prerequisites
* [Node.js](https://nodejs.org/)
* [tmi.js](https://www.npmjs.com/package/tmi.js) for Twitch integration
* [node-midi](https://www.npmjs.com/package/midi) for MIDI integration
* Windows only: [loopMIDI](https://www.tobias-erichsen.de/software/loopmidi.html)
    * macOS: [Use Audio MIDI Setup to enable IAC Driver and create two virtual ports.](https://support.apple.com/guide/audio-midi-setup/transfer-midi-information-between-apps-ams1013/mac)

## Installation
1. Install [Node.js](https://nodejs.org/)
2. Extract MIDIphonix source code to a folder of your choice
3. Rename `credentials.js.example` file to `credentials.js`
4. Replace values in `credentials.js` with your own preferences, following the [Twitch Developers guide](https://dev.twitch.tv/docs/irc/get-started/#specify-the-configuration-settings) (this will also guide you through setting up the bot account and OAuth token)
5. Open Command Prompt (Windows) or Terminal (macOS) and navigate to the `midiphonix` folder path (`cd [path]`)
6. Type `npm install` to install dependencies/prerequisites
7. Type `node bot.js` on Windows, or `node bot_MACOS.js` on macOS, and hit Enter. The bot should start running in the Command Prompt; use Ctrl-C to exit the bot process.
    * ***THIS IS WHERE THE LOCAL PROCESS RESIDES - CLOSING THIS WINDOW SHUTS DOWN THE BOT***

## FYI

* ***MIDIphonix is a work-in-progress, so it may be buggy and is not fully feature-complete. See [To-do](#To-do) for list of features currently in the works.***
* Broadcaster should enable "Low Latency" mode for optimal responsiveness.
  * Navigate to [Creator Dashboard](https://dashboard.twitch.tv/) -> Settings (on lefthand menu) -> Stream -> Latency mode: **Low latency** ([screenshot](https://imgur.com/9rh6cwZ.jpg))
* Viewers should also enable "Low Latency" for optimal responsiveness. Viewers have reported message-to-action latency as low as ~4 seconds - probably best suited for long-form, ambient compositions.
  * On the live video player, click the gear icon -> Advanced -> Low Latency (ON) ([screenshot](https://imgur.com/rsz3uNL.jpg))
* Spamming commands works best in a third-party chat client like [Chatterino](https://chatterino.com/). Simply type your message and hold down Ctrl+Enter (Windows) / Cmd+Enter (macOS) to send rapid-fire. Command spam is encouraged!

## Available commands
See here: https://mgphx.me/MIDIphonix

## To-do
* Create a periodic reminder to enable Low Latency in video player
* Stackable commands?
  * i.e. "#kick #snare #hihat"
  * This will be challenging
* Playing infinite notes (on/off messages)
  * Maybe not a good idea for 24/7 unattended streams
* Replace samples
  * i.e. #snare A, #snare B, etc.
