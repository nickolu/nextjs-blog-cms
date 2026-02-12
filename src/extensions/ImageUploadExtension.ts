import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { uploadToCloudinary, isCloudinaryConfigured } from '../lib/cloudinary';
import { getSettings } from '../lib/settings';

export interface ImageUploadOptions {
  enabled: boolean;
  postTitle?: string;
  onUploadStart?: () => void;
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: string) => void;
}

interface ImageUploadState {
  uploading: boolean;
  enabled: boolean;
}

const imageUploadPluginKey = new PluginKey<ImageUploadState>('imageUpload');

export const ImageUploadExtension = Extension.create<ImageUploadOptions>({
  name: 'imageUpload',

  addOptions() {
    return {
      enabled: true,
      postTitle: undefined,
      onUploadStart: undefined,
      onUploadSuccess: undefined,
      onUploadError: undefined,
    };
  },

  addProseMirrorPlugins() {
    const extension = this;

    return [
      new Plugin<ImageUploadState>({
        key: imageUploadPluginKey,

        state: {
          init() {
            return {
              uploading: false,
              enabled: extension.options.enabled && isCloudinaryConfigured(),
            };
          },

          apply(tr, value) {
            const setEnabled = tr.getMeta('setImageUploadEnabled');
            if (setEnabled !== undefined) {
              return { ...value, enabled: setEnabled };
            }

            const setUploading = tr.getMeta('setImageUploading');
            if (setUploading !== undefined) {
              return { ...value, uploading: setUploading };
            }

            return value;
          },
        },

        props: {
          handlePaste(view, event, slice) {
            const state = imageUploadPluginKey.getState(view.state);

            // Only handle if enabled and not currently uploading
            if (!state?.enabled || state?.uploading) {
              return false;
            }

            // Get clipboard data
            const items = event.clipboardData?.items;
            if (!items) return false;

            // Find image items
            const imageItems = Array.from(items).filter(item =>
              item.type.startsWith('image/')
            );

            if (imageItems.length === 0) return false;

            // Prevent default paste behavior
            event.preventDefault();

            // Upload images sequentially
            imageItems.forEach(async (item, index) => {
              const file = item.getAsFile();
              if (!file) return;

              try {
                // Set uploading state
                const tr = view.state.tr.setMeta('setImageUploading', true);
                view.dispatch(tr);

                // Call onUploadStart callback
                extension.options.onUploadStart?.();

                // Determine folder
                let folder = undefined;
                const settings = getSettings();
                if (settings.cloudinary.usePostFolders && extension.options.postTitle) {
                  const slug = extension.options.postTitle
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-|-$/g, '');
                  folder = `${settings.cloudinary.folder}/${slug}`;
                }

                // Upload to Cloudinary
                const response = await uploadToCloudinary(file, { folder });

                // Insert image at current cursor position
                const { from } = view.state.selection;
                const node = view.state.schema.nodes.image.create({
                  src: response.secure_url,
                  alt: file.name,
                });

                const transaction = view.state.tr.insert(from, node);
                view.dispatch(transaction);

                // Call onUploadSuccess callback
                extension.options.onUploadSuccess?.(response.secure_url);

              } catch (error) {
                console.error('Image upload failed:', error);
                extension.options.onUploadError?.(
                  error instanceof Error ? error.message : 'Upload failed'
                );
              } finally {
                // Reset uploading state
                const tr = view.state.tr.setMeta('setImageUploading', false);
                view.dispatch(tr);
              }
            });

            return true; // Handled
          },
        },
      }),
    ];
  },
});
