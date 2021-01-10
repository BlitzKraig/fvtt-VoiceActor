/**
 * VoiceActor by Blitz
 */

class VoiceActor {
    static moduleName = "VoiceActor";
}

Hooks.once('ready', async () => {
    if(!game.user.isGM){
        return;
    }

    // Will be used when custom dirs are supported
    var customDirectory = ''
    // Ensure the VA dir exists
    try {
        await FilePicker.createDirectory("data", `${customDirectory}/VoiceActor`)
    } catch (e) {
        if (!e.startsWith('EEXIST')) {
            console.log(e);
        }
    }
});

Hooks.on(`renderActorSheet`, async (app, html, data) => {
    if(!game.user.isGM){
        return;
    }
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

    // Add buttons
    title.prepend(`
    <button id="voiceactor-record" class="voiceactor-button">
    <i id="voiceactor-record-icon" style="color: white" class="fas fa-microphone"></i>
    </button>
    <button id="voiceactor-playback" class="voiceactor-button">
    <i id="voiceactor-playback-icon" style="color: white" class="fas fa-play"></i>
    </button>`);

    // Check if file exists already
    var fileName;
    if (data.actor.token.actorLink) {
        fileName = `${data.actor._id}.ogg`;
    } else {
        fileName = `${data.actor._id}-${data.actor.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ogg`
    }
    const exists = await srcExists(`${customDirectory}/VoiceActor/${fileName}`);

    if (exists) {
        // Change button color if this actor has a clip already
        title.find("#voiceactor-record #voiceactor-record-icon").css('color', 'lightgreen');
    }

    title.find("#voiceactor-record").click(async (ev) => {

        if (vaStates.recording) {
            // Stop recording if button is pressed while recording active
            vaRecorder.stop();
            return;
        }

        // Check if file exists
        var fileName;
        if (data.actor.token.actorLink) {
            fileName = `${data.actor._id}.ogg`;
        } else {
            fileName = `${data.actor._id}-${data.actor.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ogg`
        }
        const exists = await srcExists(`${customDirectory}/VoiceActor/${fileName}`);

        if (exists) {
            if (!ev.shiftKey) {
                // Notify user if record is clicked but clip exists. Bypass if SHIFT is held when clicking.
            ui.notifications.notify(game.i18n.localize("VOICEACTOR.notif.clip-exists"));
                return;
            }
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
                    await FilePicker.upload("data", `${customDirectory}/VoiceActor`, file);
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
            // Stop recording after 10 seconds. Timeout is cancelled if user stops manually
            vaRecorderTimeout = setTimeout(() => {
                vaRecorder.stop();
            }, 10000);
        }).catch(console.error);
    });

    title.find("#voiceactor-playback").click(async (ev) => {
        if (vaStates.playing) {
            // Stop playback if pressed while playing
            vaPlaybackFile.stop();
            vaStates.playing = false;
            return;
        }

        // Check if clip exists
        var fileName;
        if (data.actor.token.actorLink) {
            fileName = `${data.actor._id}.ogg`;
        } else {
            fileName = `${data.actor._id}-${data.actor.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ogg`
        }
        const exists = await srcExists(`${customDirectory}/VoiceActor/${fileName}`);

        if (exists) {

            // Used for onend and onstop
            var onFinish = (id) => {
                // Prevent caching, in case the user overwrites the clip
                vaPlaybackFile.unload();
                vaPlaybackFile = undefined;
                vaStates.playing = false;
                title.find("#voiceactor-playback #voiceactor-playback-icon").removeClass('fa-stop').addClass('fa-play');
            }
            // Play file
            vaPlaybackFile = new Howl({
                src: `${customDirectory}/VoiceActor/${fileName}`,
                volume: game.settings.get("core", "globalAmbientVolume"),
                onend: onFinish,
                onstop: onFinish
            });
            vaPlaybackFile.play();
            vaStates.playing = true;
            title.find("#voiceactor-playback #voiceactor-playback-icon").removeClass('fa-play').addClass('fa-stop');
        } else {
            ui.notifications.notify(game.i18n.localize("VOICEACTOR.notif.no-clip-for-actor"));
        }
    });
});