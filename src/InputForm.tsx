import { useState, useRef } from 'react'
import './App.css'
import type { Url } from './App';
import upload from "./assets/upload.svg"
import folder from "./assets/folder.svg"
import ar_view from "./assets/ar_view.svg"
import drop from "./assets/rotate-3d.svg"

export default function InputForm ({setter, viewingModel}: {setter: React.Dispatch<React.SetStateAction<Url>>, viewingModel: boolean}) {
    const fileInput = useRef<HTMLInputElement>(null);
    const folderInput = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [folderInputCheckbox, setFolderInputCheckbox] = useState<boolean>(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [fileSize, setFileSize] = useState<string>('0');

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
            setFileName(file.name)
            setFileSize((file.size / 1024 / 1024).toFixed(1))
            setter(
                {
                    url: url,
                    key: url
                }
            );
            return;
        }
        const urlMap: Record<string, string> = {};

        let multipleFileSize = 0;
        for (const file of files) {
            // if (!file.name.match(/\.gltf$/i)) 
            urlMap[file.name] = URL.createObjectURL(file);
            multipleFileSize += file.size; 
        }
        setFileSize((multipleFileSize / 1024 / 1024).toFixed(1));

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
        setFileName(gltfFiles[0].name)
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
    const FileInput = () => {
        return(
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
        )
    }
    const FolderInput = () => {
        return(
            <input
                        ref={folderInput}
                        type="file"
                        id="folderInput"
                        className='fileFolderInput'
                        name="folderInput"
                        onChange={handleChange}
                        {...{webkitdirectory: ''}}
            />
        )
    }
        return(
            !viewingModel ? <form>
                <div className={`dropZone${isDragging ? ' dragging' : ''}${folderInputCheckbox ? ' noDrag' : ''}`}
                    onClick={()=>{
                        !folderInputCheckbox ? fileInput.current?.click() : folderInput.current?.click()}}
                    onDragOver={!folderInputCheckbox ? handleDragOver : undefined}
                    onDragLeave={!folderInputCheckbox ? handleDragLeave : undefined}
                    onDrop={!folderInputCheckbox ? handleDrop : undefined}
                >
                    <img src={!folderInputCheckbox ? drop : folder} width={60} height={60}/>
                    <label htmlFor='fileInput' className={folderInputCheckbox ? 'fileFolderInput' : ''}>
                        Select 3D files
                    </label>
                    <FileInput />
                    <label htmlFor='folderInput' className={!folderInputCheckbox ? 'fileFolderInput' : ''}>
                        Select a folder with 3D files
                    </label>
                    <FolderInput />
                    
                    <p>{!folderInputCheckbox ? 'Drag here or click to upload' : 'Click to upload'}</p>
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
        :
        <form>
            <div className='newInputContainer'>
                <div className='fileInputContainer' onClick={()=>fileInput.current?.click()}>
                    <img src={upload} />
                    <label htmlFor='fileInput'>
                        Select file
                    </label>
                    <FileInput />   
                </div>
                <div className='folderInputContainer' onClick={()=>folderInput.current?.click()}>
                    <img src={folder} />
                    <label htmlFor='folderInput'>
                        Select folder
                    </label>
                    <FolderInput />
                </div>
                <div className='fileNameContainer'>
                    <img src={ar_view} />
                    <p>{fileName}</p>
                    <span>{fileSize + ' MB'}</span>    
                </div>
            </div>
        </form>
        )
}