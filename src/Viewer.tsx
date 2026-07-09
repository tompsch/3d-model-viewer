import * as THREE from 'three'
import { useEffect, useRef, Suspense } from 'react';
import { Canvas, useLoader, useThree, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/Addons.js';
import { Environment, OrbitControls, Html, useProgress } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import './App.css'
import type { Url } from './App';


function Model ({url, controlsRef} : {url: string | Record<string,string>, controlsRef: React.RefObject<OrbitControlsImpl | null>}) {
    const groupRef = useRef<THREE.Group>(null!);
    const { camera, size } = useThree();

    const gltfFileName = typeof url === 'string' ? null : Object.keys(url).find(name => name.match(/\.gltf$/i))!;
    const gltfUrl = typeof url === 'string' ? url : url[gltfFileName!];
    const gltf = useLoader(GLTFLoader, gltfUrl, (loader)=>{

        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/draco/');
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
    // })
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
    }, [gltf, size])
    
    return (<primitive ref={groupRef} object={gltf.scene}/>)
}

function CameraLight () {
    const lightRef = useRef<THREE.DirectionalLight>(null);
    const { camera } = useThree();

    useFrame(()=>{
        if(lightRef.current) {
            lightRef.current.position.copy(camera.position);
        }
    })
    return <directionalLight ref={lightRef} intensity={0.2} />
}

function Fallback ({setStatus}: {setStatus: React.Dispatch<React.SetStateAction<number>>}) {
    const { progress, active } = useProgress();
    useEffect(()=>{
        setStatus(progress);
    },[progress])
    // console.log(Math.round(progress))
    // return (<Html center><p>{`Loading: ${Math.round(progress)}%`}</p></Html>)
    if(!active || progress === 100) return;
    return <p>{`Loading: ${Math.round(progress)}%`}</p>
}

export default function Viewer ({url, setStatus}: {url: Url, setStatus: React.Dispatch<React.SetStateAction<number>>}) {
    const controlsRef = useRef<OrbitControlsImpl>(null);
    return (
        <div id="canvas">
            <Canvas
                camera={{ position: [3, 2, 5], fov: 45 }}
                style={{ width: '100%', height: '100%' }}
            >
                <Environment preset="warehouse" />
                <ambientLight intensity={0.2} />
                <CameraLight />
                {/* <Suspense fallback={<Fallback />}> */}
                <Suspense fallback={null}>
                    {url && <Model url={url.url} key={url.key} controlsRef={controlsRef}/>}
                </Suspense>
                <OrbitControls
                    enablePan={false}
                    target={[0, 0, 0]}
                    enableDamping
                    dampingFactor={0.5}
                    minPolarAngle={Math.PI * 0}
                    maxPolarAngle={Math.PI * 1}
                    ref={controlsRef}
                />
            </Canvas>
            <Fallback setStatus={setStatus}/>
        </div>
    )
}