// src/lib/cloudinary.ts
// Cloudinary configuration and utilities for image management

import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export default cloudinary

/**
 * Upload an image to Cloudinary
 */
export async function uploadImage(
  file: File | string,
  options: {
    folder?: string
    publicId?: string
    transformation?: object
  } = {}
): Promise<{
  success: boolean
  url?: string
  publicId?: string
  error?: string
}> {
  try {
    const { folder = 'sanaathrumylens', publicId, transformation } = options

    // Convert File to base64 if needed
    let fileData: string
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      fileData = `data:${file.type};base64,${buffer.toString('base64')}`
    } else {
      fileData = file
    }

    const uploadOptions: any = {
      folder,
      resource_type: 'image',
      transformation: transformation || [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ],
    }

    if (publicId) {
      uploadOptions.public_id = publicId
    }

    const result = await cloudinary.uploader.upload(fileData, uploadOptions)

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    }
  } catch (error: any) {
    console.error('Cloudinary upload error:', error)
    return {
      success: false,
      error: error.message || 'Failed to upload image',
    }
  }
}

/**
 * Delete an image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    await cloudinary.uploader.destroy(publicId)
    return { success: true }
  } catch (error: any) {
    console.error('Cloudinary delete error:', error)
    return {
      success: false,
      error: error.message || 'Failed to delete image',
    }
  }
}

/**
 * Get optimized URL for an image
 */
export function getOptimizedUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    crop?: string
    quality?: string | number
    format?: string
  } = {}
): string {
  const { width, height, crop = 'fill', quality = 'auto:good', format = 'auto' } = options

  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      {
        width,
        height,
        crop,
        quality,
        fetch_format: format,
      },
    ],
  })
}

/**
 * Generate a blurred placeholder URL
 */
export function getPlaceholderUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      { width: 20, height: 20, crop: 'fill', quality: 'auto:low', blur: 100 },
    ],
  })
}

/**
 * Extract public ID from Cloudinary URL
 */
export function extractPublicId(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    const filename = pathParts[pathParts.length - 1]
    const publicId = filename.split('.')[0]
    const folder = pathParts.slice(pathParts.indexOf('upload') + 1, -1).join('/')
    return folder ? `${folder}/${publicId}` : publicId
  } catch {
    return null
  }
}

/**
 * Upload multiple images
 */
export async function uploadMultipleImages(
  files: (File | string)[],
  options: {
    folder?: string
    transformation?: object
  } = {}
): Promise<Array<{
  success: boolean
  url?: string
  publicId?: string
  error?: string
}>> {
  return Promise.all(files.map(file => uploadImage(file, options)))
}
