/**
 * VoiceActor by Blitz
 */

class VoiceActor {
    static moduleName = "VoiceActor";

    static getClip = async (data, customDirectory, isJournal) => {
        // Get files
        var vaDir = await FilePicker.browse(VoiceActor.isForge() ? 'forgevtt' : 'data', `${customDirectory}/VoiceActor${isJournal?'/Journal':''}`)
        // Check if file exists already
        var fileName;
        if (isJournal) {
            fileName = `${data.entity._id}.ogg`;
        } else {
            if (data.actor.token.actorLink) {
                fileName = `${data.actor._id}.ogg`;
            } else {
                fileName = `${data.actor._id}-${data.actor.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ogg`
            }
        }

        return VoiceActor.getFile(vaDir.files, fileName);
    }

    static getFile = (filesArray, filename) => {
        let file = filesArray.find(el => el.includes(filename))
        return file || false;
    }

    static isForge = () => {
        if (typeof ForgeVTT !== 'undefined') {
            return ForgeVTT.usingTheForge;
        } else {
            return false;
        }
    }
}

Hooks.once('ready', async () => {

    game.settings.register("VoiceActor", "playersRecordOwned", {
        name: "VOICEACTOR.settings.players-record-owned.name",
        hint: "VOICEACTOR.settings.players-record-owned.hint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("VoiceActor", "playersPlaybackLimited", {
        name: "VOICEACTOR.settings.players-playback-limited.name",
        hint: "VOICEACTOR.settings.players-playback-limited.hint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    if (game.user.isGM) {
        // Will be used when custom dirs are supported
        var customDirectory = ''
        // Ensure the VA dir exists
        try {
            await FilePicker.createDirectory(VoiceActor.isForge() ? 'forgevtt' : 'data', `${customDirectory}/VoiceActor`)
        } catch (e) {
            if (!e.startsWith('EEXIST')) {
                console.log(e);
            }
        }
        try {
            await FilePicker.createDirectory(VoiceActor.isForge() ? 'forgevtt' : 'data', `${customDirectory}/VoiceActor/Journal`)
        } catch (e) {
            if (!e.startsWith('EEXIST')) {
                console.log(e);
            }
        }
    }
});

var onRender = async (app, html, data) => {

    var customDirectory = ''

    // Get window-title from html so we can prepend our buttons
    let title = html.find('.window-title');

    // Store recording and playback states
    var vaStates = {
        recording: false,
        playing: false
    }

    // Audio file to be played back
    var vaPlaybackFile;

    // MediaRecorder
    var vaRecorder;

    // timeout to sop vaRecorder after 10 seconds if not stopped manually
    var vaRecorderTimeout;

    var isJournal = false;
    if (data.options.classes.indexOf("journal-sheet") > -1) {
        isJournal = true;
    }

    let buttons = ``;
    game.settings.get("VoiceActor", "playersRecordOwned");
    if (game.user.isGM || (data.owner && game.settings.get("VoiceActor", "playersRecordOwned") && game.user.hasPermission("FILES_UPLOAD"))) {
        buttons += `<button id="voiceactor-record" class="voiceactor-button" title="${game.i18n.localize("VOICEACTOR.ui.button-tooltip-record")}">
        <i id="voiceactor-record-icon" style="color: white" class="fas fa-microphone"></i>
        </button>`;
    }

    if (game.user.isGM || data.owner || game.settings.get("VoiceActor", "playersPlaybackLimited")) {
        buttons += `<button id="voiceactor-playback" class="voiceactor-button" title="${game.i18n.localize("VOICEACTOR.ui.button-tooltip-playback")}">
        <i id="voiceactor-playback-icon" style="color: white" class="fas fa-play"></i>
        </button>`
    }

    // Add buttons
    title.prepend(buttons);

    let clip = await VoiceActor.getClip(data, customDirectory, isJournal);

    if (clip) {
        // Change button color if this actor has a clip already
        title.find("#voiceactor-record #voiceactor-record-icon").css('color', 'lightgreen');
    }

    title.find("#voiceactor-record").click(async (ev) => {

        if (vaStates.recording) {
            // Stop recording if button is pressed while recording active
            vaRecorder.stop();
            return;
        }

        let clip = await VoiceActor.getClip(data, customDirectory, isJournal);

        if (clip) {
            if (!ev.shiftKey) {
                // Notify user if record is clicked but clip exists. Bypass if SHIFT is held when clicking.
                ui.notifications.notify(game.i18n.localize("VOICEACTOR.notif.clip-exists"));
                return;
            } else {
                if (VoiceActor.isForge()) {
                    ui.notifications.notify(game.i18n.localize("VOICEACTOR.notif.forge-cache"))
                }
            }
        }

        var fileName;

        if (isJournal) {
            fileName = `${data.entity._id}.ogg`;
        } else {
            if (data.actor.token.actorLink) {
                fileName = `${data.actor._id}.ogg`;
            } else {
                fileName = `${data.actor._id}-${data.actor.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ogg`
            }
        }

        if(!navigator.mediaDevices){
            ui.notifications.error(game.i18n.localize("VOICEACTOR.notif.no-media-devices"));
        }
        // Record clip
        navigator.mediaDevices.getUserMedia({
            audio: true
        }).then(async stream => {
            vaStates.recording = true;
            title.find("#voiceactor-record #voiceactor-record-icon").removeClass('fa-microphone').addClass('fa-stop');
            title.find("#voiceactor-record #voiceactor-record-icon").css('color', 'red');
            const chunks = [];
            vaRecorder = new MediaRecorder(stream);
            vaRecorder.ondataavailable = async e => {
                chunks.push(e.data);
                if (vaRecorder.state == 'inactive') {
                    const blob = new Blob(chunks, {
                        type: 'audio/ogg'
                    });
                    const file = new File([blob], fileName, {
                        type: 'audio/ogg'
                    })
                    await FilePicker.upload(VoiceActor.isForge() ? 'forgevtt' : 'data', `${customDirectory}/VoiceActor${isJournal?'/Journal':''}`, file);
                    vaStates.recording = false;

                    title.find("#voiceactor-record #voiceactor-record-icon").removeClass('fa-stop').addClass('fa-microphone');
                    title.find("#voiceactor-record #voiceactor-record-icon").css('color', 'lightgreen');
                    delete vaRecorder;
                    clearTimeout(vaRecorderTimeout);
                    delete vaRecorderTimeout;
                    delete stream;
                }
            };
            vaRecorder.start();
            // Stop recording after 30 seconds. Timeout is cancelled if user stops manually
            vaRecorderTimeout = setTimeout(() => {
                vaRecorder.stop();
            }, 30000);
        }).catch((e)=>{
            console.log(e);
        });
    });

    title.find("#voiceactor-playback").click(async (ev) => {
        if (vaStates.playing) {
            // Stop playback if pressed while playing
            vaPlaybackFile.stop();
            vaStates.playing = false;
            return;
        }

        let clip = await VoiceActor.getClip(data, customDirectory, isJournal);

        let hasHowler = typeof Howl != 'undefined'
        if (clip) {
            // Used for onend and onstop
            var onFinish = (id) => {
                // Prevent caching, in case the user overwrites the clip
                if (vaPlaybackFile) {
                    if(hasHowler){
                        vaPlaybackFile.unload();
                    }
                    vaPlaybackFile = undefined;
                }
                vaStates.playing = false;
                title.find("#voiceactor-playback #voiceactor-playback-icon").removeClass('fa-stop').addClass('fa-play');
            }
            // Play file
            let payload = {
                src: clip,
                volume: game.settings.get("core", "globalInterfaceVolume"),
                onend: onFinish,
                onstop: onFinish
            }
            if(hasHowler){
                vaPlaybackFile = new Howl(payload);
                vaPlaybackFile.play();
            } else {
                vaPlaybackFile = new Sound(payload.src);
                vaPlaybackFile.on('end', onFinish);
                vaPlaybackFile.on('stop', onFinish)
                await vaPlaybackFile.load();
                vaPlaybackFile.play({volume: payload.volume});
            }
            vaStates.playing = true;
            title.find("#voiceactor-playback #voiceactor-playback-icon").removeClass('fa-play').addClass('fa-stop');
            if (ev.shiftKey) {
                game.socket.emit("playAudio", payload)
                ui.notifications.notify(game.i18n.localize("VOICEACTOR.notif.broadcasted"));
            }


        } else {
            ui.notifications.notify(game.i18n.localize("VOICEACTOR.notif.no-clip-for-actor"));
        }
    });
};

Hooks.on(`renderActorSheet`, onRender);

Hooks.on(`renderJournalSheet`, onRender);