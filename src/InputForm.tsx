import { useState, useRef } from 'react'
import './App.css'
import type { Url } from './App';

export default function InputForm ({setter}: {setter: React.Dispatch<React.SetStateAction<Url>>}) {
    const fileInput = useRef<HTMLInputElement>(null);
    const folderInput = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [folderInputCheckbox, setFolderInputCheckbox] = useState<boolean>(false);

    const processFiles = (files: FileList) => {
        if (files.length === 1) {
            const file = files[0];
            if(!file.name.match(/\.(glb|gltf)$/i)) {
                setError("Unsupported sigle-file format. Use .gbl or .gltf.");
                return;
            }
            if(file.name.match(/\.(gltf)$/i)) {
                setError(".gltf format needs additional files. Please import all the related files together.");
                return;
            }
            if(file.size > 50 * 1024 * 1024) {
                setError('File exceeds 50 MB limit.')
                return;
            }
            setError(null);
            const url = URL.createObjectURL(file);
            setter(
                {
                    url: url,
                    key: url
                }
            );
            return;
        }
        const urlMap: Record<string, string> = {};

        for (const file of files) {
            // if (!file.name.match(/\.gltf$/i)) 
            urlMap[file.name] = URL.createObjectURL(file);
        }

        const gltfFiles = Array.from(files).filter(f => f.name.match(/\.gltf$/i));

        if (gltfFiles.length === 0) {
            setError('No .gltf file found.');
            return;
        }
        if (gltfFiles.length > 1) {
            setError('Only one .gltf file is allowed.');
            return;
        }
        const key = URL.createObjectURL(gltfFiles[0]);
        setter({
            url: urlMap,
            key: key
        });
    }
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            // console.log(e.target.files)
            processFiles(e.target.files)
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
            processFiles(e.dataTransfer.files)
        }
    }
    const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFolderInputCheckbox(e.target.checked)
    }
        return(
            <form>
                <div className={`dropZone${isDragging ? ' dragging' : ''}${folderInputCheckbox ? ' noDrag' : ''}`}
                    onClick={()=>{
                        !folderInputCheckbox ? fileInput.current?.click() : folderInput.current?.click()}}
                    onDragOver={!folderInputCheckbox ? handleDragOver : undefined}
                    onDragLeave={!folderInputCheckbox ? handleDragLeave : undefined}
                    onDrop={!folderInputCheckbox ? handleDrop : undefined}
                >
                    <label htmlFor='fileInput' className={folderInputCheckbox ? 'fileFolderInput' : ''}>
                        Select 3D files
                    </label>
                    <label htmlFor='folderInput' className={!folderInputCheckbox ? 'fileFolderInput' : ''}>
                        Select a folder with 3D files
                    </label>
                    <input
                        ref={fileInput}
                        type="file"
                        id="fileInput"
                        className='fileFolderInput'
                        name="fileInput"
                        onChange={handleChange}
                        // accept=".glb,.gltf"
                        multiple
                        />
                    <input
                        ref={folderInput}
                        type="file"
                        id="folderInput"
                        className='fileFolderInput'
                        name="folderInput"
                        onChange={handleChange}
                        {...{webkitdirectory: ''}}
                        />
                    <p>{!folderInputCheckbox ? 'Drag here or click to select' : 'Click to select'}</p>
                    <p> ( .glb | .gltf )</p>
                    <div className='checkbox'>
                        <label htmlFor='webkitdirectory' onClick={(e)=>e.stopPropagation()}>
                            Have a folder?
                        </label>
                        <input type='checkbox' name='webkitdirectory' id='webkitdirectory' onChange={handleCheckbox} onClick={(e)=>e.stopPropagation()}/>
                    </div>
                </div>
                {error && <p className='error'>{error}</p>}
            </form>
        )
}