const { withProjectBuildGradle } = require("expo/config-plugins");

/**
 * Adds the local Maven repository for @react-native-async-storage/async-storage v3.x
 * which ships its KMP artifact (org.asyncstorage.shared_storage:storage-android)
 * as a bundled local repo inside the npm package.
 */
function withAsyncStorageMaven(config) {
  return withProjectBuildGradle(config, (config) => {
    const contents = config.modResults.contents;

    const mavenLine =
      'maven { url "$rootDir/../node_modules/@react-native-async-storage/async-storage/android/local_repo" }';

    if (contents.includes("async-storage/android/local_repo")) {
      return config;
    }

    config.modResults.contents = contents.replace(
      /allprojects\s*\{[\s\S]*?repositories\s*\{/,
      (match) => `${match}\n    ${mavenLine}`
    );

    return config;
  });
}

module.exports = withAsyncStorageMaven;
