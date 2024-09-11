import React from 'react';
import { LoaderCircle } from 'lucide-react';


const CircleLoading = () => {
    return (
        <div className='circle-loading'>
            <LoaderCircle size={22} />
        </div>
    )
}

export default CircleLoading;