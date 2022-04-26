# 0.2.0 - 2022/04/26

* Updated for full compatibility with v9
* Added module setting for dark buttons for increased system compatibility
* Fixed overwriting issue - Module now records a fresh clip with a suffix counter. Be warned, if you overwrite the same clip a bunch of times, all of those clips will exist in your VA directory. You can safely delete the extras manually, the newest clip has the highest suffix number.
* Fixed caching issues, a side effect of the change above. Overwritten clips will now be available for playback instantly.
* Added support for Forbidden Lands (possibly some other modules too, if they do not use an `actor` property and instead make the `_id` directly available under `data`)

# 0.1.2 - 2021/08/09

* Fixed broken audio files, republished

# 0.1.0 - 2021/05/22

* Fixed playback on 0.8+

# 0.0.9 - 2021/02/24

* Added check for insecure sites. Updated readme with workarounds.

# 0.0.8 - 2021/01/14

* Added support to record/playback in journal entries

# 0.0.7 - 2021/01/13

* Added option to allow players to record to their owned actors
* Added option to allow players to playback from limited/observer actors

# 0.0.6 - 2021/01/11

* Added forge support
* Updated max clip time to 30 seconds
* Fixed some styling issues
* Reduced minimum core version
* Switched to Interface/SoundBoard volume slider from Ambient

# 0.0.4 - 2021/01/10

* Added broadcast audio via shift-click

# 0.0.3 - 2021/01/10

* Disallowed non-gm interaction
* Added more readme details

# 0.0.2 - 2021/01/10

* Fixed localization

# 0.0.1 - 2021/01/10

* Initial Release
