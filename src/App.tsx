import './App.css'
import { useState } from 'react';
import Viewer from './Viewer';
import InputForm from './InputForm';

function App() {
  const [fileURL, setFileURL] = useState<string | null>(null);
  return (
    <>
      <header>
        <h1>Online 3D Model Viewer</h1>
        <h2>Preview & inspect 3D models</h2>
      </header>
      <main>
        <section className={fileURL ? 'canvasSection': 'noCanvas'}>
          {<Viewer url={fileURL}/>}
        </section>
        <section className={fileURL ? 'shrinkedForm' : 'regularForm'}>
          <InputForm setter={setFileURL}/>
        </section>
      </main>
    </>
  )
}

export default App
