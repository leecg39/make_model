import type { AIModel, ModelImage } from '@/types/model';

const MOCK_MODELS_STORAGE_KEY = 'mock-models-v1';

function isClient(): boolean {
  return typeof window !== 'undefined';
}

function readStorage(): AIModel[] {
  if (!isClient()) {
    return [];
  }

  const raw = localStorage.getItem(MOCK_MODELS_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(models: AIModel[]): void {
  if (!isClient()) {
    return;
  }

  localStorage.setItem(MOCK_MODELS_STORAGE_KEY, JSON.stringify(models));
}

export function getStoredMockModels(): AIModel[] {
  return readStorage();
}

export function upsertStoredMockModel(model: AIModel): void {
  const models = readStorage();
  const index = models.findIndex((item) => item.id === model.id);

  if (index >= 0) {
    models[index] = model;
  } else {
    models.unshift(model);
  }

  writeStorage(models);
}

export function updateStoredMockModelImage(
  modelId: string,
  imageUrl: string,
  displayOrder: number,
  isThumbnail: boolean
): ModelImage {
  const models = readStorage();
  const modelIndex = models.findIndex((item) => item.id === modelId);

  if (modelIndex < 0) {
    throw new Error('모델을 찾을 수 없습니다.');
  }

  const targetModel = models[modelIndex];
  const currentImages = targetModel.images || [];
  const createdAt = new Date().toISOString();
  const modelImage: ModelImage = {
    id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    model_id: modelId,
    image_url: imageUrl,
    display_order: displayOrder,
    is_thumbnail: isThumbnail,
    created_at: createdAt,
  };

  const nextImages = [...currentImages, modelImage]
    .sort((a, b) => a.display_order - b.display_order)
    .map((image) => ({
      ...image,
      is_thumbnail: isThumbnail ? image.id === modelImage.id : image.is_thumbnail,
    }));

  const hasThumbnail = nextImages.some((image) => image.is_thumbnail);
  const normalizedImages = hasThumbnail
    ? nextImages
    : nextImages.map((image, index) => ({ ...image, is_thumbnail: index === 0 }));

  const thumbnail = normalizedImages.find((image) => image.is_thumbnail) || normalizedImages[0] || null;
  models[modelIndex] = {
    ...targetModel,
    images: normalizedImages,
    thumbnail_url: thumbnail ? thumbnail.image_url : targetModel.thumbnail_url,
    updated_at: createdAt,
  };

  writeStorage(models);
  return modelImage;
}
