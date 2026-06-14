import { useState, useRef } from 'react'
import './App.css'

export default function InputForm ({setter}: {setter: React.Dispatch<React.SetStateAction<string | null>>}) {
    const fileInput = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const processFile = (file: File) => {
        if(!file.name.match(/\.(glb|gltf)$/i)) {
            setError("Unsupported format. Use .gbl or .gltf.");
            return;
        }
        if(file.size > 50 * 1024 * 1024) {
            setError('File exceeds 50 MB limit.')
            return;
        }
        setError(null);
        const url = URL.createObjectURL(file);
        setter(url);
    }
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            processFile(e.target.files[0])
        }
        }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    }
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        if(e.currentTarget.contains(e.relatedTarget as Node)) return;
        setIsDragging(false);
    }
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if(e.dataTransfer?.files[0]) {
            processFile(e.dataTransfer.files[0])
        }
    }
        return(
            <form>
                <div className={`dropZone${isDragging ? ' dragging' : ''}`}
                    onClick={()=>fileInput.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <label htmlFor='model'>Select a 3D file</label>
                    <input ref={fileInput} type="file" id="model" name="model" onChange={handleChange} accept=".glb,.gltf"/>
                    <p>Drag a file here or click to select</p>
                </div>
                {error && <p className='error'>{error}</p>}
            </form>
        )
}