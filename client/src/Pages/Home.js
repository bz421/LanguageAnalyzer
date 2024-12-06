import React, {useState, useEffect} from 'react'

export default function Home() {
    const [msg, setMsg] = useState('')

    const getMessage = async () => {
      await fetch('/hello').then(
          res => res.json()
      ).then(
          data => {
              setMsg(data.message)
              console.log(data.message)
          }
      )
  }

    useEffect(() => {
        getMessage()
    }, [])
    return (
        <div style={{'display': 'flex', 'flexDirection' : 'column', 'justifyContent': 'center', 'alignItems' : 'center'}}>
            <h1>Backend says</h1>
            <p>{msg}</p>
        </div>
    )
}