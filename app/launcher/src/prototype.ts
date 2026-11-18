// The prototype's TV page: the launcher in its browser preview, driven by the prototype shell (../../index.html).
// Imports run in this order.
import "./prototype/environment"; // the simulated TV's languages, before anything reads them
import "./dev/installDevelopmentPreview"; // the launcher's own browser preview: sample apps, inputs and programmes
import "./prototype/preview"; // the simulated TV: its HDMI ports, the devices on them, its programmes
import "./prototype/storage"; // the setup from the URL becomes the saved settings, so load() starts from it
import "./index"; // the launcher itself
import "./prototype/bridge"; // reports the setup to the shell, which keeps it in its URL
