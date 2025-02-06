import React from 'react'
import { useChat } from '../context/ChatProvider'

type Props = {}

function Home({ }: Props) {
    const { messages } = useChat()
    return (
        <div className='w-full'>
            <div className='flex flex-col justify-center items-center h-screen'>
                <h1 className='text-4xl font-bold'>Home</h1>

                {messages.map((message, index) => (
                    <div key={index}>{message}</div>
                ))}

            </div>
        </div>
    )
}

export default Home