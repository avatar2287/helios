export const clock = { t: 0 };

export const labelAnchors = new Map<string, HTMLElement>();

export const dayEl: { current: HTMLElement | null } = { current: null };

export const pointerGate = { dragged: false, x: 0, y: 0 };

/** Camera rig consumes this once and eases back to the system view. */
export const cameraCmd = { reset: false };
