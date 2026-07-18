import './App.css'
import { useEffect, useState } from 'react';
import Viewer from './Viewer';
import InputForm from './InputForm';

export type Url = {
  url: string | Record<string,string>,
  key: string
} | null;

function App() {
  const [fileURL, setFileURL] = useState<Url>(null);
  const [status, setStatus] = useState<number>(0);

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
          {fileURL && <Viewer url={fileURL} setStatus={setStatus}/>}
        </section>
        <section className={fileURL ? 'shrinkedForm' : 'regularForm'}>
          <InputForm setter={setFileURL} viewingModel={fileURL ? true : false}/>
          {/* <InputForm setter={setFileURL} viewingModel={true}/> */}
        </section>
      </main>
      <footer className={fileURL ? 'shrinkedFooter' : 'regularFooter'}>
        <div><h3>Tomás Puebla Schildknecht</h3></div>
        <div><h4><a href='http://tompsch.dev'>tompsch.dev</a></h4></div>
        <div><h4><a href='mailto:hello@tompsch.dev'>Contact me!</a></h4></div>
      </footer>
    </>
  )
}

export default App
