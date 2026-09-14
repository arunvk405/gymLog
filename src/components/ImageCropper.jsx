import React, { useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Cropper from 'react-easy-crop'
import { getCroppedImg } from '../utils/image'
import { X, Check } from 'lucide-react'

const ImageCropper = ({ image, imageSrc, onCropComplete, onCancel }) => {
    const src = image || imageSrc

    useEffect(() => {
        const originalOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = originalOverflow
        }
    }, [])

    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

    const onCropChange = useCallback((newCrop) => {
        setCrop(newCrop)
    }, [])

    const onZoomChange = useCallback((newZoom) => {
        setZoom(newZoom)
    }, [])

    const onCropCompleteInternal = useCallback((_croppedArea, pixels) => {
        setCroppedAreaPixels(pixels)
    }, [])

    const handleDone = async () => {
        if (!src) return
        try {
            const croppedImage = await getCroppedImg(src, croppedAreaPixels)
            if (croppedImage) {
                onCropComplete(croppedImage)
            }
        } catch (e) {
            console.error("Cropping failed:", e)
        }
    }

    if (typeof document === 'undefined') return null

    return createPortal(
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'calc(1rem + env(safe-area-inset-top, 0px)) calc(1rem + env(safe-area-inset-right, 0px)) calc(1rem + env(safe-area-inset-bottom, 0px)) calc(1rem + env(safe-area-inset-left, 0px))',
            overflowY: 'auto'
        }}>
            <div className="panel" style={{
                width: '100%',
                maxWidth: '440px',
                background: 'var(--panel-color, #1e293b)',
                borderRadius: '24px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                margin: 'auto',
                color: 'var(--text-primary, #ffffff)',
                maxHeight: '92vh'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Adjust Photo</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>Fit your photo inside the circle</p>
                    </div>
                    <button
                        type="button"
                        className="secondary"
                        onClick={onCancel}
                        style={{ padding: '8px', borderRadius: '12px', minWidth: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '280px',
                    maxHeight: '42vh',
                    minHeight: '200px',
                    background: '#090d16',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color, rgba(255,255,255,0.1))'
                }}>
                    {src ? (
                        <Cropper
                            image={src}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            cropShape="round"
                            showGrid={false}
                            onCropChange={onCropChange}
                            onCropComplete={onCropCompleteInternal}
                            onZoomChange={onZoomChange}
                        />
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                            No image selected
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)', fontWeight: 800, letterSpacing: '0.5px' }}>ZOOM</span>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.05}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            style={{
                                flex: 1,
                                accentColor: 'var(--accent-color, #38bdf8)',
                                cursor: 'pointer'
                            }}
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleDone}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '0.9rem',
                            fontSize: '0.95rem',
                            fontWeight: 800,
                            borderRadius: '14px',
                            background: 'var(--accent-color, #38bdf8)',
                            color: '#ffffff',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 14px rgba(56, 189, 248, 0.35)'
                        }}
                    >
                        <Check size={20} /> APPLY CHANGES
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}

export default ImageCropper

