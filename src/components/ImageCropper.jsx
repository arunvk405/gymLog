import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { getCroppedImg } from '../utils/image'
import { X, Check } from 'lucide-react'

const ImageCropper = ({ image, onCropComplete, onCancel }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

    const onCropChange = useCallback((crop) => {
        setCrop(crop)
    }, [])

    const onZoomChange = useCallback((zoom) => {
        setZoom(zoom)
    }, [])

    const onCropCompleteInternal = useCallback((_croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleDone = async () => {
        try {
            const croppedImage = await getCroppedImg(image, croppedAreaPixels)
            onCropComplete(croppedImage)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div className="panel fade-in" style={{
                width: '100%',
                maxWidth: '450px',
                background: 'var(--panel-color)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.2rem',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
                margin: 0
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Adjust Photo</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Fit your photo inside the circle</p>
                    </div>
                    <button
                        className="secondary"
                        onClick={onCancel}
                        style={{ padding: '8px', borderRadius: '12px', minWidth: '40px', height: '40px' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '1',
                    background: '#000',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)'
                }}>
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteInternal}
                        onZoomChange={onZoomChange}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.5px' }}>ZOOM</span>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(e.target.value)}
                            style={{
                                flex: 1,
                                accentColor: 'var(--accent-color)',
                                cursor: 'pointer'
                            }}
                        />
                    </div>

                    <button
                        onClick={handleDone}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '1rem',
                            fontSize: '0.95rem'
                        }}
                    >
                        <Check size={20} /> APPLY CHANGES
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ImageCropper
