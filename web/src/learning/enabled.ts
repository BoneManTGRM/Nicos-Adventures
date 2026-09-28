import { isLearningVersionHost } from './previewHost';

// Local qualification may explicitly enable the feature. Workers tutor builds
// additionally require a version URL, even if accidentally sent to production.
const versionBuild = import.meta.env.VITE_LEARNING_LAB_VERSION_BUILD === 'true';
export const learningLabEnabled = import.meta.env.VITE_LEARNING_LAB_RELEASE === 'true' || import.meta.env.DEV || (
  import.meta.env.VITE_LEARNING_LAB_PREVIEW === 'true' &&
  (!versionBuild || (typeof location !== 'undefined' && isLearningVersionHost(location.hostname)))
);
