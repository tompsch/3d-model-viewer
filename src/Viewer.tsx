import * as THREE from 'three'
import { useEffect, useRef, Suspense, useState } from 'react';
import { Canvas, useLoader, useThree, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/Addons.js';
import { Environment, OrbitControls, useProgress } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import './App.css'
import type { Url } from './App';
import tune from './assets/tune.svg'
import arrow from './assets/arrow_up.svg'


function Model ({url, controlsRef} : {url: string | Record<string,string>, controlsRef: React.RefObject<OrbitControlsImpl | null>}) {
    const groupRef = useRef<THREE.Group>(null!);
    const { camera } = useThree();

    const gltfFileName = typeof url === 'string' ? null : Object.keys(url).find(name => name.match(/\.gltf$/i))!;
    const gltfUrl = typeof url === 'string' ? url : url[gltfFileName!];
    
    const gltf = useLoader(GLTFLoader, gltfUrl, (loader)=>{

        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('./draco/');
        loader.setDRACOLoader(dracoLoader);

        if(typeof url !== 'string') {
            loader.manager.setURLModifier((fileUrl) => {
            const fileName = fileUrl.split(/[\\/]/).pop()!;
            return url[fileName] ?? fileUrl;
        })
        }
    })
    // useEffect(()=>{
    //     return () => useLoader.clear(GLTFLoader, gltfUrl);
    // },[url])
    useEffect(()=>{
        if(!groupRef.current) return;

        const box = new THREE.Box3().setFromObject(groupRef.current)
        const size = box.getSize(new THREE.Vector3());                          // NUEVO
        const center = box.getCenter(new THREE.Vector3())

        groupRef.current.position.sub(center)

        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
        const distance = (maxDim / 2) / Math.tan(fov / 2) * 0.5;

        camera.position.set(distance, distance * 0.5, -distance);
        camera.near = distance / 100;
        camera.far = distance * 100;
        camera.updateProjectionMatrix();

        if (controlsRef.current) {
            controlsRef.current.target.set(0, 0, 0);
            controlsRef.current.update();
        }
    }, [gltf])
    
    return (<primitive ref={groupRef} object={gltf.scene}/>)
}

function CameraLight ({intensity}: {intensity: number}) {
    const lightRef = useRef<THREE.DirectionalLight>(null);
    const { camera } = useThree();

    useFrame(()=>{
        if(lightRef.current) {
            lightRef.current.position.copy(camera.position);
        }
    })
    return <directionalLight ref={lightRef} intensity={intensity} />
}

function Fallback ({setStatus}: {setStatus: React.Dispatch<React.SetStateAction<number>>}) {
    const { progress, active, total } = useProgress();
    useEffect(()=>{
        setStatus(progress);
    },[progress])
    if(!active || progress >= 100 || total === 0) return;
    return <p>{`Loading: ${Math.round(progress)}%`}</p>
}

export default function Viewer ({url, setStatus}: {url: Url, setStatus: React.Dispatch<React.SetStateAction<number>>}) {
    const controlsRef = useRef<OrbitControlsImpl>(null);
    const [enviroment, setEnviroment] = useState('./hdri/empty_warehouse_01_1k.hdr');
    const [ambientLight, setAmbientLight] = useState(0.2);
    const [directionalLight, setDirectionalLight] = useState(0.2);
    const [displayControls, setDisplayControls] = useState(true);
    const handleEnviroment = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (!e.target.value) {
            setEnviroment('');
            return;
        }
        setEnviroment(`./hdri/${e.target.value}.hdr`);
    }

    const handleAmbientLight = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmbientLight(parseFloat(e.target.value));
    }
    const handleDirectionalLight = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDirectionalLight(parseFloat(e.target.value));
    }

    const savedPosition = useRef<null | THREE.Vector3>(null);

    const CameraControls = () => {
        const { camera } = useThree();
        
        const handleOrbitChange = () => {
            savedPosition.current = camera.position.clone();
        }

        useEffect(()=>{
            if(savedPosition.current) {
                camera.position.copy(savedPosition.current);
            }
        },[])
        return (
            <OrbitControls
                    enablePan={false}
                    target={[0, 0, 0]}
                    enableDamping
                    dampingFactor={0.5}
                    minPolarAngle={Math.PI * 0}
                    maxPolarAngle={Math.PI * 1}
                    ref={controlsRef}
                    onChange={handleOrbitChange}
            />
        )
    } 
    return (
        <div id="canvas">
            <Canvas
                camera={{ position: [3, 2, 5], fov: 45 }}
                style={{ width: '100%', height: '100%' }}
            >
                {enviroment && <Environment files={enviroment} />}
                <ambientLight intensity={ambientLight} />
                <CameraLight intensity={directionalLight} />
                <group key={url?.key}>
                    <Suspense fallback={null}>
                        {url && <Model url={url.url} key={url.key} controlsRef={controlsRef}/>}
                    </Suspense>
                </group>
                <CameraControls />
            </Canvas>
            <Fallback setStatus={setStatus}/>
            <form className={displayControls ? 'show' : 'hide'}>
                <label htmlFor="enviroment">Enviroment</label>
                <select name='enviroment' onChange={handleEnviroment}>
                    <option value="empty_warehouse_01_1k">Warehouse</option>
                    <option value="studio_small_03_1k">Studio</option>
                    <option value="venice_sunset_1k">Sunset</option>
                    <option value="st_fagans_interior_1k">Apartment</option>
                    <option value="kiara_1_dawn_1k">Dawn</option>
                    <option value="">None</option>
                </select>
                <label htmlFor="ambientLight">Ambient Light</label>
                <input 
                    name="ambientLight"
                    type='range'
                    min="0"
                    max="1.5"defaultValue="0.2"
                    step="0.1"
                    onChange={handleAmbientLight}>
                </input>
                <label htmlFor="directionalLight">Directional Light</label>
                <input 
                    name="directionalLight"
                    type='range'
                    min="0"
                    max="5"defaultValue="0.2"
                    step="0.1"
                    onChange={handleDirectionalLight}>
                </input>
                <div className="controlToggle" onClick={()=>setDisplayControls(!displayControls)}>
                    {displayControls ?
                    <><img src={arrow} alt="Arrow" width="28" height="28"/></> :
                    <><img src={tune} alt="Tune" width="20" height="20"/><p>show controls</p></>
                }</div>
            </form>
        </div>
    )
}