// The simulated TV over the launcher's browser preview: as many HDMI ports as the shell asks for and fewer programmes
// to resume. When the shell sets a number of devices, the first ports have a device on (with the preview's name where
// it has one) and the others are empty; otherwise the ports keep the preview's devices.
import { launcherRuntime as runtime } from "../app/initializeLauncherRuntime";
import type { InputSource } from "../contracts/launcher";

import { prototypeState } from "./state";

const { demo } = prototypeState;

const simulated = (sources: readonly InputSource[]): readonly InputSource[] => {
  const ports = Array.from({ length: demo.hdmiPorts }, (_, index) => {
    const number = index + 1;
    const preview = sources.find((source) => source.type === "HDMI" && source.number === number);
    if (demo.devices === null) {
      return preview || Object.freeze({ type: "HDMI", number, connected: false });
    }
    const device = number <= demo.devices;
    const name = device && preview?.editName ? { editName: preview.editName } : {};
    return Object.freeze({ type: "HDMI", number, connected: device, ...name });
  });
  return [...ports, ...sources.filter((source) => source.type !== "HDMI")];
};

const platforms = runtime.platforms;
const previewInputs = platforms?.inputs;
if (platforms && previewInputs) {
  runtime.platforms = {
    ...platforms,
    inputs: (platform) => {
      const preview = previewInputs(platform);
      return { ...preview, read: (done) => preview.read((sources) => done(sources && simulated(sources))) };
    },
  };
}

const service = runtime.continueWatching;
if (service) {
  const preview = service.getSnapshot();
  const snapshot = Object.freeze({ ...preview, items: Object.freeze(preview.items.slice(0, demo.continueItems)) });
  runtime.continueWatching = { ...service, getSnapshot: () => snapshot };
}
