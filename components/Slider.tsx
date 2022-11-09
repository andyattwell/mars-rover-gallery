import Image from 'next/image'
import React, { useCallback } from "react";

type Photo = {
  img_src: string
}

type Props = {
  photo: Photo|null,
  index: number|null,
  onChangePhoto: (newIndex:number) => void,
}

export default function Slider({ photo, index, onChangePhoto }: Props) { 
 
  const Photo = () => {
    return (
      photo ? <Image src={photo.img_src} alt="Mars rover photo" width={600} height={450}/> : <></>
    )
  }

  const changePhoto = (newIndex: number) => {
    onChangePhoto(newIndex);
  }

  const NextBtn = () => {
    return (index !== null && index < 24 ? <button className='btn btn-secondary' onClick={(e) => {e.preventDefault(); changePhoto(index + 1)}}>&gt;</button> : <></>)
  }

  const PrevBtn = () => {
    return (index !== null && index > 0 ? <button className='btn btn-secondary' onClick={(e) => {e.preventDefault(); changePhoto(index - 1)}}>&lt;</button> : <></>)
  }

  return (<>
    <PrevBtn />
    <Photo />
    <NextBtn />
  </>)
}