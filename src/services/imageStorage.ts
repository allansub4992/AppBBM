import { supabase } from '@/lib/supabase';

const BUCKET_NAME = 'receipt-photos';

/**
 * Convert base64 data URL to Blob
 */
function base64ToBlob(base64: string): Blob {
    const parts = base64.split(',');
    const contentType = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const byteString = atob(parts[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: contentType });
}

/**
 * Generate unique filename for receipt photo
 */
function generateFileName(userId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${userId}/${timestamp}_${random}.jpg`;
}

/**
 * Upload receipt image to Supabase Storage
 * @param base64Image - Base64 encoded image data URL
 * @param userId - User ID for organizing files
 * @returns Public URL of uploaded image or null if failed
 */
export async function uploadReceiptImage(
    base64Image: string,
    userId: string
): Promise<{ url: string | null; error: string | null }> {
    try {
        const blob = base64ToBlob(base64Image);
        const fileName = generateFileName(userId);

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, blob, {
                contentType: 'image/jpeg',
                upsert: false,
            });

        if (error) {
            console.error('Supabase upload error:', error);
            return { url: null, error: error.message };
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(data.path);

        return { url: urlData.publicUrl, error: null };
    } catch (err: any) {
        console.error('Upload error:', err);
        return { url: null, error: err.message || 'Upload failed' };
    }
}

/**
 * Delete receipt image from Supabase Storage
 * @param imageUrl - Public URL of the image to delete
 */
export async function deleteReceiptImage(imageUrl: string): Promise<boolean> {
    try {
        // Extract file path from URL
        const urlParts = imageUrl.split(`${BUCKET_NAME}/`);
        if (urlParts.length < 2) return false;

        const filePath = urlParts[1];

        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([filePath]);

        if (error) {
            console.error('Delete error:', error);
            return false;
        }

        return true;
    } catch (err) {
        console.error('Delete error:', err);
        return false;
    }
}
