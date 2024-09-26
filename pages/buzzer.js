import {useEffect, useState} from 'react'
import io from 'Socket.IO-client'

import QUESTION_CONFIG from '../lib/questions'
import clsx from 'clsx'

import styles from '../styles/Buzzer.module.css'


let socket

const Admin = () => {
    const [state, setState] = useState()
    const [buzzed, setBuzzed] = useState() 
    const [winner, setWinner] = useState('')

    useEffect(() => {
        socketInitializer()
    }, [])

    const socketInitializer = async () => {
        await fetch('/api/socket')
        socket = io()

        socket.on('connect', () => {
            console.log('connected')
        })

        socket.on('set-state', msg => {
            setState(msg)
            if (!msg.teamOnTurn >= 0) {
                setBuzzed(false)
            }
            console.log(msg)
        })
    }

    if (!state) {
        return <div>Loading...</div>
    }


    const buzz = (team) => {
        if (buzzed) {
            return
        }
        setBuzzed(true)
        setWinner(team)
        socket.emit('set-team-turn', team)
    }

    console.log(buzzed)
    if (state.teamOnTurn >= 0) {
        return <div className={clsx(styles.full, state.teamOnTurn == 0 ? styles.team1 : styles.team2)}>
            {state.teamOnTurn == 0 ? '◄' : '►'}
            {state.teams[winner].name}
            {state.teamOnTurn == 0 ? '◄' : '►'}
        </div>
    } else if (state.buzzerOpened) {
        return <div className={clsx(styles.main)}>
            <div
                className={clsx(styles.buzzArea, styles.team1)}
                onTouchStart={() => buzz(0)}
            >
                {state.teams[0].name}
            </div>
            <div
                className={clsx(styles.buzzArea, styles.team2)}
                onTouchStart={() => buzz(1)}
            >
                {state.teams[1].name}
            </div>
        </div>
    } else {
        return <div className={clsx(styles.main)}>
            Vennligst vent...
        </div>
    }
}

export default Admin
