// Preview build only. Production activation remains an explicit release change.
export const learningLabEnabled = import.meta.env.DEV || import.meta.env.VITE_LEARNING_LAB_PREVIEW === 'true';
