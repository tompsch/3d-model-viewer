import './App.css'
import { use, useEffect, useState } from 'react';
import Viewer from './Viewer';
import InputForm from './InputForm';

export type Url = {
  url: string | Record<string,string>,
  key: string
} | null;

function App() {
  const [fileURL, setFileURL] = useState<Url>(null);

  return (
    <>
      <header>
        <h1>Online 3D Model Viewer</h1>
        <h2>Preview & inspect 3D files</h2>
      </header>
      <main>
        <section className={fileURL ? 'canvasSection': 'noCanvas'}>
          {fileURL && <Viewer url={fileURL}/>}
        </section>
        <section className={fileURL ? 'shrinkedForm' : 'regularForm'}>
          <InputForm setter={setFileURL}/>
        </section>
      </main>
    </>
  )
}

export default App
