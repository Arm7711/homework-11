import * as Models from './models/index.js';

(async function syncAllModels() {
  try {
    const modelsToSync = [
      Models.User,
      Models.Restaurant,
      Models.Products
    ];

    for (const model of modelsToSync) {
      await model.sync({ alter: true });
      console.log(`${model.name} synchronized successfully`);
    }

    console.log('All models synced.');
  } catch (err) {
    console.error('Model synchronization failed:', err);
  }
})();
