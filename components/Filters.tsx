import Image from 'next/image'
import React, { useCallback } from "react";
import { SyntheticEvent } from "react";
import styles from '../styles/Home.module.css'

type Rover = {
  name: string,
  cameras: string[]
}

export type FilterType = {
  sol?: string,
  earth_date?: string,
  camera?: string
  rover?: string
  isSolDate?: number
}

type Props = {
  onSubmit: (params: FilterType) => void,
  onClear?: () => void
}

export default function Filters({ onSubmit, onClear }: Props) { 
  const rovers = [
    {
      name: 'curiosity',
      cameras: ['FHAZ', 'RHAZ', 'MAST', 'CHEMCAM', 'MAHLI', 'MARDI', 'NAVCAM']
    },
    {
      name: 'opportunity',
      cameras: ['FHAZ', 'RHAZ', 'NAVCAM', 'PANCAM', 'MINITES']
    },
    {
      name: 'spirit',
      cameras: ['FHAZ', 'RHAZ', 'NAVCAM', 'PANCAM', 'MINITES']
    }
  ]
  const [rover, setRover] = React.useState<Rover|undefined>()
  const [manifest, setManifest] = React.useState<any>()
  const [cameras, setCameras] = React.useState([])
  const [camera, setCamera] = React.useState<string>()
  const [earthdate, setEarthdate] = React.useState<string>()
  const [minDate, setMinDate] = React.useState()
  const [maxDate, setMaxDate] = React.useState()
  const [sol, setSol] = React.useState(2890)
  const [maxSol, setMaxSol] = React.useState()
  const [isSolDate, setIsSolDate] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  const [userFavorites, setUserFavorites] = React.useState<FilterType[]>([])
  const [hasLoaded, setHasLoaded] = React.useState(false)
  const [showFavorites, setShowFavorites] = React.useState(false)

  const loadUserFilters = useCallback(() => {
    let uF = []
    if (localStorage.getItem('user-filters')) {
      uF = JSON.parse(localStorage.getItem('user-filters') || '')
    }
    setUserFavorites(uF)
  }, [])

  // Load favorite filters from localStorage
  React.useEffect(() => {
    if (!hasLoaded) {
      loadUserFilters()
      setHasLoaded(true)
    }
  }, [loadUserFilters, hasLoaded])


  const saveFilters = () => {
    let currentData = [...userFavorites]
    if (!rover || !earthdate || !sol) {
      return false
    }
    currentData.push({
      rover: rover.name || '',
      camera, 
      earth_date: !isSolDate ? earthdate : undefined, 
      sol: isSolDate ? sol.toString() : '',
      isSolDate
    })
    localStorage.setItem('user-filters', JSON.stringify(currentData))
    loadUserFilters()
  }

  const submitHandler = (event:SyntheticEvent) => {
    event.preventDefault()
    if (!rover) {
      return
    }
    let p:FilterType = { rover: rover.name, camera: camera }
    if (isSolDate) {
      p.sol = sol.toString()
    } else {
      p.earth_date = earthdate
    }
    onSubmit(p)
  }

  const loadFavorite = async (fav: FilterType) => {
    if (fav.rover) {
      setIsSolDate(fav.isSolDate || 0)
      if (fav.isSolDate) {
        setSol(parseInt(fav.sol || '0'))
        setEarthdate(undefined)
      } else {
        setEarthdate(fav.earth_date)
        setSol(0)
      }
      setCamera(fav.camera)
      const r = rovers.find((r) => { return r.name === fav.rover });
      setRover(r);
      const manifest = await getRoverManifest(fav.rover);
      onSubmit(fav)
    }
    
  }

  const deleteFavorite = (index: number) => {
    const favs = [...userFavorites]
    favs.splice(index,1)
    setUserFavorites(favs)
  }

  const getRoverManifest = async (rover:string) => {
    setLoading(true)
    const data = await fetch('/api/rover/' + rover)
    const json = await data.json()
    setManifest(json)
    setMinDate(json.landing_date)
    setMaxDate(json.max_date)
    setMaxSol(json.max_sol)
    setLoading(false)
    return json
  }

  const roverHandler = async (name: string) => {
    
    const r = rovers.find((r) => { return r.name === name }) || rovers[0];
    setRover(r);

    const json = await getRoverManifest(name)
    setEarthdate(json.max_date)
    let p:FilterType = { 
      rover: r.name,
      earth_date: json.max_date,
      camera: camera
    }
    onSubmit(p)
  }

  const DateInput = () => {
    return !isSolDate ? 
      <input 
      type="date" 
      id="earthdate" 
      name="earthdate" 
      className="form-control" 
      disabled={!!isSolDate} 
      value={earthdate} 
      min={minDate}
      max={maxDate}
      onChange={(e) => { 
        setEarthdate(e.target.value) 
      }}></input>
    : <input 
      type="number" 
      id="sol" 
      name="sol" 
      className="form-control" 
      value={sol} 
      disabled={!isSolDate} 
      min="1"
      max={maxSol}
      onChange={(e) => { 
        setSol(parseInt(e.target.value) || 0) 
      }}></input>
  }

  const clearFilters = () => {
    setRover(undefined)
    setManifest({})
    setCamera('')
    setEarthdate(new Date().toISOString().split('T')[0])
    setSol(0)
    setIsSolDate(0)
    onClear && onClear()
  }

  const ExtraFilters = () => {
    if (rover && !loading){
      return <>
        
        <div className="col-12 col-md-3 mb-2">
          
          <div className={styles.formradio}>
            <input type="radio" name="solDate" id="solDate" value="0" checked={!isSolDate} onChange={() => setIsSolDate(0) }/>
            <label htmlFor="earthdate" className="form-label mr-2">Earh Day: </label>
          </div>
          
          <div className={styles.formradio}>
            <input type="radio" name="solDate" id="solDate" value="0" checked={!!isSolDate} onChange={() => setIsSolDate(1) }/>
            <label htmlFor="sol" className="form-label">Sol: </label>
          </div>

          <DateInput />
          
        </div>
        
        <div className="col-12 col-md-2 mb-2">
          <label htmlFor="camera" className="form-label">Camera: </label>
          <select value={camera} name="camera" className="form-select" onChange={(e) => { setCamera(e.target.value) }}>
            <option value=""></option>
            {cameras?.map((cam, index) => (
              <option key={index}>
                {cam}
              </option>
            ))}
          </select>
        </div>

        <div className="col-12 col-md-2">
          <div className={"btn-toolbar " + styles.submitbtn} role="toolbar">
            <div className='btn-group me-2' role="group">
              <input type="submit" value="Submit" className={'btn btn-primary '} onClick={(e) => {e.preventDefault(); submitHandler(e);}}/>
              <button className="btn btn-secondary" onClick={clearFilters}>Clear</button>
            </div>
          </div>
        </div>
      </>
    }
    return !loading ? <div className="col-6"><p className="mt-4">Select a rover</p></div> : <div className='col-6'><Loader /></div>
  }

  const Favorites = () => {
    return <div className="col-12 col-md-2 text-md-end">
      <div className={"dropdown " + styles.submitbtn}>
        <div className='btn-group' role="group">
          <button className="btn btn-warning" onClick={(e) => {e.preventDefault(); saveFilters() }}>Save</button>
        
          <button className={"btn btn-secondary dropdown-toggle " + (showFavorites ? 'show' : '')} type="button" data-bs-toggle="dropdown" aria-expanded="false" onClick={() => { setShowFavorites(!showFavorites) }}>
            Favorites
          </button>
          <ul className={"dropdown-menu " + styles.fovoritesDropdown + (showFavorites && userFavorites.length > 0 ? ' show' : '')} aria-labelledby="dropdownMenuButton1">
            {userFavorites.map((fav: FilterType, i) => {
              return <li key={i} className="">
                <div className="dropdown-item">
                  <a href="#" className={ styles.favoriteTag } onClick={() => { loadFavorite(fav); setShowFavorites(false) }}>{ fav.rover } - { !fav.isSolDate ? fav.earth_date : 'Sol ' + fav.sol } - { fav.camera }</a>
                  <a href='#' className="btn btn-danger" onClick={() => { deleteFavorite(i) }}>X</a>
                </div>
              </li>
            })}
          </ul>
        </div>
      </div>
    </div>
  }

  const Loader = () => {
    return loading ? <Image src={'/loading.gif'} alt="Loading..." width={20} height={20} className="mt-5"/> : <></>
  }

  // Update camera options according to availability to date
  React.useEffect(() => {
    let cams = []
    if (isSolDate) {
      cams = manifest?.photos?.find((set: any) => set.sol === sol)?.cameras
    } else {
      cams = manifest?.photos?.find((set: any) => set.earth_date === earthdate)?.cameras
    }
    setCameras(cams)
  }, [manifest, earthdate, sol, isSolDate])
  
  return (
    <>
      <form className="row">

        <div className="col-12 col-md-3 mb-2">
          <label htmlFor="rover" className="form-label">Rover: </label>
          <select name="rover" value={rover ? rover.name : ''} className={'form-select ' + styles.roverSelect} onChange={(e) => { roverHandler(e.target.value) }}>
            <option value=""></option>
            {rovers.map((rov, index) => (
              <option key={index}>
                {rov.name}
              </option>
            ))}
          </select>
        </div>
        <ExtraFilters />
        <Favorites />
      </form>
    </>
  );
}