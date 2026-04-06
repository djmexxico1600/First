'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { artistUploadSchema, type ArtistUploadInput } from '@/lib/validators';
import { Button, Input } from '@/components/index';
import { getUploadUrl, createArtistUpload } from '@/lib/r2/actions';

export function ArtistUploadForm() {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ArtistUploadInput>({
    resolver: zodResolver(artistUploadSchema),
  });

  const fileInput = watch('fileType');

  const onSubmit = async (data: ArtistUploadInput) => {
    try {
      setErrorMessage(null);
      setUploadSuccess(false);

      // Get file from input
      const fileInputElement = document.getElementById('file-input') as HTMLInputElement;
      const file = fileInputElement?.files?.[0];

      if (!file) {
        setErrorMessage('Please select a file');
        return;
      }

      // Validate file size (50MB max)
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        setErrorMessage('File must be less than 50MB');
        return;
      }

      setIsUploading(true);

      // Get presigned upload URL
      const { uploadUrl, key } = await getUploadUrl(
        file.name,
        file.type,
        'audio'
      );

      // Upload to R2
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      });

      await new Promise((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            resolve(null);
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      // Create artist upload record in database
      await createArtistUpload(key, {
        title: data.title as string,
        artist: data.artist as string,
        genre: data.genre as string,
        upc: (data.upc as string) || undefined,
      });

      setUploadSuccess(true);
      setUploadProgress(100);
      reset();

      // Clear success message after 5 seconds
      setTimeout(() => setUploadSuccess(false), 5000);
    } catch (error) {
      console.error('Upload error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Track Info */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Track Information</h3>

          <Input
            label="Track Title"
            placeholder="e.g., Midnight Vibes"
            {...register('title')}
            error={errors.title?.message}
          />

          <Input
            label="Artist Name"
            placeholder="Your stage name"
            {...register('artist')}
            error={errors.artist?.message}
          />

          <Input
            label="Genre (Optional)"
            placeholder="e.g., Trap, Hip-Hop"
            {...register('genre')}
            error={errors.genre?.message}
          />

          <Input
            label="UPC (Optional)"
            placeholder="Universal Product Code for distribution"
            {...register('upc')}
            error={errors.upc?.message}
          />
        </div>

        {/* File Upload */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Audio File</h3>

          <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-cyan-400/50 transition">
            <p className="text-slate-400 mb-2">📁 Select audio file to upload</p>
            <p className="text-xs text-slate-500 mb-4">MP3, WAV, FLAC • Max 50MB</p>
            <input
              id="file-input"
              type="file"
              accept="audio/*"
              {...register('fileType')}
              className="hidden"
            />
            <label htmlFor="file-input">
              <button
                type="button"
                className="px-6 py-2 rounded border border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 transition cursor-pointer"
              >
                Choose File
              </button>
            </label>
            {fileInput && (
              <p className="mt-3 text-sm text-green-400">✓ File selected</p>
            )}
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Uploading...</span>
              <span className="text-cyan-400">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div
                className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Success Message */}
        {uploadSuccess && (
          <div className="p-4 rounded bg-green-900/20 border border-green-500/30 text-green-300">
            ✓ Upload successful! Your track is queued for review.
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="p-4 rounded bg-red-900/20 border border-red-500/30 text-red-300">
            {errorMessage}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          isLoading={isSubmitting || isUploading}
          fullWidth
          disabled={isUploading}
        >
          {isUploading ? `Uploading... ${uploadProgress}%` : 'Upload Track'}
        </Button>

        <p className="text-xs text-slate-500">
          ℹ️ After upload, our team will review your track and add it to the distribution queue.
        </p>
      </form>
    </div>
  );
}
