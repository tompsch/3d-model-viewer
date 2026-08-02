import './App.css'
import { useState } from 'react';
import Viewer from './Viewer';
import InputForm from './InputForm';
import cobra from './assets/models/Bermuda Cobra Speedboat.glb?url'

export type Url = {
  url: string | Record<string,string>,
  key: string
} | null;

function TrialModal({display, urlSetter, fileNameSetter, fileSizeSetter, setError}: {display: React.Dispatch<React.SetStateAction<boolean>>, urlSetter: React.Dispatch<React.SetStateAction<Url>>, fileNameSetter: React.Dispatch<React.SetStateAction<string | null>>, fileSizeSetter: React.Dispatch<React.SetStateAction<string>>, setError: React.Dispatch<React.SetStateAction<string | null>>}) {
  const handleClose = () => {
    display(false);
  }
  const ferra = import.meta.glob<string>('./assets/models/ferra/**/*', {eager: true, query: '?url', import:'default'});
  const porsche = import.meta.glob<string>('./assets/models/porsche/**/*', {eager: true, query: '?url', import:'default'});
  const basket = import.meta.glob<string>('./assets/models/basketball court/**/*', {eager: true, query: '?url', import:'default'});
  const alpine = import.meta.glob<string>('./assets/models/alpine/**/*', {eager: true, query: '?url', import:'default'});
  const airbus = import.meta.glob<string>('./assets/models/airbus/**/*', {eager: true, query: '?url', import:'default'});

  function buildFileMap(modelUrls: Record<string, string>): Record<string, string> {
    const map: Record<string, string> = {};
    for (const [originalPath, finalUrl] of Object.entries(modelUrls)) {
      const filename = originalPath.split('/').pop()!;
      map[filename] = finalUrl;
    }
    return map;
  }

  const models = [
    {name: 'Bermuda Speedboat', url: cobra},
    {name: 'Ferrari Formula 1', url: buildFileMap(ferra), folder: ferra},
    {name: 'Porsche 911', url: buildFileMap(porsche), folder: porsche},
    {name: 'Basketball Court', url: buildFileMap(basket), folder: basket},
    {name: 'Alpine Racing A424', url: buildFileMap(alpine), folder: alpine},
    {name: 'Airbus A380', url: buildFileMap(airbus), folder: airbus}
  ]

  const handleTrial = async ({model, setError}: {model: {name: string, url: string | undefined | Record<string, string>, folder?: Record<string, string>}, setError: React.Dispatch<React.SetStateAction<string | null>>}) => {
    display(false);
    setError(null);
    if(!model.url) return;

    let gltfUrl = model.url;
    if(typeof gltfUrl !== 'string') {
      gltfUrl = Object.entries(model.url).find(([key]) => key.endsWith('.gltf'))?.[1] ?? 'noKey';
    }
    urlSetter({url: model.url, key: gltfUrl as string});
    const nameArray = gltfUrl.split('/').pop()?.replaceAll("%20", " ").split("?")[0].split(/[\-\.]/) || ['noName'];
    const name = nameArray[0] + "." + nameArray[2]
    fileNameSetter(name);
    try { 
      if(gltfUrl.includes('.gltf')) {
        if(model.folder) {
          const modelFolder = model.folder;
          let totalSize = 0;
          for (const fileName in modelFolder) {
            const fileUrl = modelFolder[fileName];
            const response = await fetch(fileUrl, { method: 'HEAD' });
            const bytes = response.headers.get('content-length');
            if (bytes) {
              totalSize += parseInt(bytes);
            }
          }
          const sizeInMB = (totalSize / 1024 / 1024).toFixed(1);
          fileSizeSetter(sizeInMB);
        }
       } else {
      const response = await fetch(gltfUrl, { method: 'HEAD' });
      const bytes = response.headers.get('content-length');
      if (bytes) {
        const sizeInMB = (parseInt(bytes) / 1024 / 1024).toFixed(1);
        fileSizeSetter(sizeInMB);
      }}
    } catch (error) {
      console.error('Error fetching file size:', error);
    }
  }
  return (
    <div className='trialModal'>
      <div className='trialModalContent'>
        <h3>Try me with these models!</h3>
        <ul>
          {models.map((model, index) => (
            <li key={index} onClick={()=>handleTrial({model, setError})}>
              {model.name}
            </li>
          ))}
        </ul>
        <button onClick={handleClose}>Close</button>
      </div>
    </div>
  )
}
function App() {
  const [fileURL, setFileURL] = useState<Url>(null);
  const [status, setStatus] = useState<number>(0);
  const [trialModal, setTrialModal] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string>('0');
  const [error, setError] = useState<string | null>(null);



  let text = 'no file'
  if(status > 0) {
    text = 'loading'
    if(status >= 100) {
      text = 'loaded'
    }
  } 
  return (
    <>
      <header>
        <h1>3D Model Viewer</h1>
        <h2>Preview & inspect 3D files</h2>
      </header>
      <main>
        <div className={fileURL ? 'status uploaded': 'status noUpload'}>
          <div className={`circle ${(status > 0 && status < 100) ? 'yellow' : (status >= 100 && 'green')}`}></div>
          <p>{text}</p>  
        </div>
        <section className={fileURL ? 'canvasSection': 'noCanvas'}>
          {fileURL && <Viewer url={fileURL} setStatus={setStatus} key={fileURL.key} />}
        </section>
        <section className={fileURL ? 'shrinkedForm' : 'regularForm'}>
          <InputForm 
            setter={setFileURL}
            viewingModel={fileURL ? true : false}
            fileName={fileName}
            fileNameSetter={setFileName}
            fileSize={fileSize}
            setFileSize={setFileSize}
            error={error}
            setError={setError}
          />
        </section>
        <section className={!fileURL ? 'trial' : 'shrinkedTrial'}>
          <h3 onClick={()=>{setTrialModal(true)}}>Try me with loaded models!</h3>
          {trialModal && 
            <TrialModal 
              display={setTrialModal}
              urlSetter={setFileURL}
              fileNameSetter={setFileName}
              fileSizeSetter={setFileSize}
              setError={setError}
            />}
        </section>
      </main>
      <footer className={fileURL ? 'shrinkedFooter' : 'regularFooter'}>
        <div><h3>Tomás Puebla Sch</h3></div>
        <div><h4><a href='http://tompsch.dev'>tompsch.dev</a></h4></div>
        <div><h4><a href='mailto:hello@tompsch.dev'>Contact me!</a></h4></div>
      </footer>
    </>
  )
}

export default App
