export interface CharacterPrompt {
  id: string;
  character: string;
  prompt: string;
}

export interface TechnicalFeature {
  id: string;
  feature: string;
  description: string;
  stepByStepLogic: string[];
}

export interface RecommendedBackend {
  name: string;
  reason: string;
  keySetup: string;
}

export interface OriginalGameReference {
  name: string;
  description: string;
  gameplayMechanics: string;
}

export interface GameBlueprint {
  gameName: string;
  successRate: number; // 0 - 100%
  successFactorRationale: string;
  vibePrompt: string;
  recommendedBackend: RecommendedBackend;
  fourSuccesses: string[];
  fourErrors: string[];
  fourCharacterPrompts: CharacterPrompt[];
  technicalLogic: TechnicalFeature[];
  originalGameReference: OriginalGameReference;
  _isFallback?: boolean;
  _fallbackReason?: string;
}

export interface GeneratorRequest {
  gameName: string;
  customGenre?: string;
  targetPlatform?: string;
  artStyle?: string;
  customDetails?: string;
}
