// The prototype's TV page: the real launcher in its browser preview, driven by the prototype shell (../../index.html).
// Imports run in this order.
import "./prototype/environment"; // the simulated TV: languages and HDMI ports, before anything reads them
import "./devContinueWatching"; // the launcher's own browser-preview data
import "./prototype/storage"; // the setup from the URL becomes the saved settings, so load() starts from it
import "./index"; // the launcher itself
import "./prototype/bridge"; // reports the setup to the shell, which keeps it in its URL
