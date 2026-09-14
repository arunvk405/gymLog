/**
 * This function was adapted from the one in the react-easy-crop's documentation
 */
export const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener('load', () => resolve(image))
        image.addEventListener('error', (error) => reject(error))
        image.setAttribute('crossOrigin', 'anonymous') // needed to avoid cross-origin issues
        image.src = url
    })

export async function getCroppedImg(imageSrc, pixelCrop, maxDimension = 400) {
    if (!imageSrc) return null

    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
        return null
    }

    const targetCrop = pixelCrop && pixelCrop.width && pixelCrop.height ? pixelCrop : {
        x: 0,
        y: 0,
        width: image.naturalWidth || image.width || 300,
        height: image.naturalHeight || image.height || 300
    }

    // Determine output dimensions (scale down large crops to avoid huge base64 strings)
    let outputWidth = targetCrop.width
    let outputHeight = targetCrop.height

    if (outputWidth > maxDimension || outputHeight > maxDimension) {
        const scale = Math.min(maxDimension / outputWidth, maxDimension / outputHeight)
        outputWidth = Math.max(1, Math.round(outputWidth * scale))
        outputHeight = Math.max(1, Math.round(outputHeight * scale))
    }

    // set canvas size to match the target crop
    canvas.width = outputWidth
    canvas.height = outputHeight

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // draw expected image area to canvas
    ctx.drawImage(
        image,
        targetCrop.x,
        targetCrop.y,
        targetCrop.width,
        targetCrop.height,
        0,
        0,
        outputWidth,
        outputHeight
    )

    // As Base64 string (optimized JPEG ~20-40KB)
    return canvas.toDataURL('image/jpeg', 0.85)
}

