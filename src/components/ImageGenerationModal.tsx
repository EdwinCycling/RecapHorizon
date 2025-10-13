import React from 'react';
import { X, Copy, Check } from 'lucide-react';

interface ImageGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isGenerating: boolean;
  imageInstructions?: string;
  onCopyInstructions: () => void;
  instructionsCopied: boolean;
  t: (key: string) => string;
}

export const ImageGenerationModal: React.FC<ImageGenerationModalProps> = ({
  isOpen,
  onClose,
  isGenerating,
  imageInstructions,
  onCopyInstructions,
  instructionsCopied,
  t
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-600">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('imageGeneration') || 'Afbeelding Generatie'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isGenerating ? (
            // Loading State
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                {t('generatingImage') || 'Afbeelding instructies genereren...'}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                Dit kan een paar seconden duren...
              </p>
            </div>
          ) : imageInstructions ? (
            // Result State
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {t('aiImageInstruction') || 'AI Afbeelding Instructie'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {t('aiImageInstructionDescription') || 'Hieronder een instructie voor het maken van een bijbehorende afbeelding. Kopieer en plak deze bij een AI-tool voor het genereren van afbeeldingen.'}
                </p>
              </div>

              {/* Instructions Box */}
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-4 border border-gray-200 dark:border-slate-600">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Afbeelding Instructie:
                  </span>
                  <button
                    onClick={onCopyInstructions}
                    className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition-colors ${
                      instructionsCopied
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800'
                    }`}
                  >
                    {instructionsCopied ? (
                      <>
                        <Check size={16} />
                        Gekopieerd!
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        {t('copyImageInstruction') || 'Kopieer'}
                      </>
                    )}
                  </button>
                </div>
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {imageInstructions}
                </p>
              </div>

              {/* Suggestion */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  <strong>{t('aiImageInstructionExample') || 'Bijvoorbeeld met'}:</strong> Google Gemini Banana, of andere AI afbeelding generators.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {!isGenerating && (
          <div className="flex justify-end p-6 border-t border-gray-200 dark:border-slate-600">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Sluiten
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerationModal;