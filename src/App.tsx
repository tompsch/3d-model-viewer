import './App.css'
import { useState } from 'react';
import Viewer from './Viewer';
import InputForm from './InputForm';
import cobra from './assets/models/Cobra Keyshot.glb?url'

export type Url = {
  url: string | Record<string,string>,
  key: string
} | null;

function TrialModal({display, urlSetter, fileNameSetter, fileSizeSetter}: {display: React.Dispatch<React.SetStateAction<boolean>>, urlSetter: React.Dispatch<React.SetStateAction<Url>>, fileNameSetter: React.Dispatch<React.SetStateAction<string | null>>, fileSizeSetter: React.Dispatch<React.SetStateAction<string>>}) {
  const handleClose = () => {
    display(false);
  }
  const ferra = import.meta.glob<string>('./assets/models/ferra/**/*', {eager: true, query: '?url', import:'default'});
  const porsche = import.meta.glob<string>('./assets/models/porsche/**/*', {eager: true, query: '?url', import:'default'});
  const basket = import.meta.glob<string>('./assets/models/basketball court/**/*', {eager: true, query: '?url', import:'default'});
  const alpine = import.meta.glob<string>('./assets/models/alpine/**/*', {eager: true, query: '?url', import:'default'});
  const airbus = import.meta.glob<string>('./assets/models/airbus/**/*', {eager: true, query: '?url', import:'default'});

  const getGltfUrl = (folder: Record<string, string>) => {
    const gltfUrl = Object.entries(folder).find(([key]) => key.endsWith('.gltf'))?.[1];
    return gltfUrl;
  }


  const models = [
    {name: 'Bermuda Speedboat', url: cobra},
    {name: 'Ferrari Formula 1', url: getGltfUrl(ferra), folder: ferra},
    {name: 'Porsche 911', url: getGltfUrl(porsche), folder: porsche},
    {name: 'Basketball Court', url: getGltfUrl(basket), folder: basket},
    {name: 'Alpine Racing A424', url: getGltfUrl(alpine), folder: alpine},
    {name: 'Airbus A380', url: getGltfUrl(airbus), folder: airbus}
  ]

  const handleTrial = async (model: {name: string, url: string | undefined, folder?: Record<string, string>}) => {
    display(false);
    if(!model.url) return;

    urlSetter({url: model.url, key: model.url});
    const name = model.url.split('/').pop()?.replaceAll("%20", " ").split("?")[0] || null;
    fileNameSetter(name);
    try { 
      if(model.url.includes('.gltf')) {
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
      const response = await fetch(model.url, { method: 'HEAD' });
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
            <li key={index} onClick={()=>handleTrial(model)}>
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
          />
          {/* <InputForm setter={setFileURL} viewingModel={true}/> */}
        </section>
        <section className={!fileURL ? 'trial' : 'shrinkedTrial'}>
          <h3 onClick={()=>{setTrialModal(true)}}>Try me with loaded models!</h3>
          {trialModal && 
            <TrialModal 
              display={setTrialModal}
              urlSetter={setFileURL}
              fileNameSetter={setFileName}
              fileSizeSetter={setFileSize}
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
