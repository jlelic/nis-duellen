import '../node_modules/animate.css/animate.css'

import {useEffect, useState} from 'react'
import io from 'Socket.IO-client'

import styles from '../styles/Home.module.css'

import QUESTION_CONFIG from '../lib/questions'
import clsx from 'clsx'

let socket
let inited = false

const Home = () => {
    const [input, setInput] = useState('')
    const [state, setState] = useState()
    const [showBigX, setShowBigX] = useState(false)

    useEffect(() => {
        if(!inited) {
            inited = true
            socketInitializer()
        }
    }, [])

    const socketInitializer = async () => {
        await fetch('/api/socket')
        socket = io()

        socket.on('connect', () => {
            console.log('connected')
        })

        socket.on('set-state', msg => {
            console.log(msg)
            setState(msg)
        })

        socket.on('update-input', msg => {
            setInput(msg)
        })

        socket.on('ding', () => {
            console.log('ding')
            const audio = new Audio('ding.wav')
            audio.play()
        })

        socket.on('buzz', () => {
            setShowBigX(true)
            setTimeout(() => setShowBigX(false), 1000)
            const audioBuzzer = new Audio('buzzer.wav')
            audioBuzzer.play()
        })
    }

    if (!state) {
        return <div>Loading...</div>
    }

    const questionNum = state.questionNum
    const question = QUESTION_CONFIG.questions[questionNum]
    const { answers } = question
    const questionState = state.questions[questionNum]

    if (!questionState.showQuestion) {
        return <div className={styles.main}>
            {state.questionNum != 0 && <div className={styles.question}>
                Etter runde {state.questionNum}
            </div>
            }
            <div>
                <div className={clsx(styles.scoreBoard, styles.team, styles.team1, styles.box)}>
                    <div>
                        {state.teams[0].name}
                    </div>
                    <div className={styles.points}>
                        {state.teams[0].score}
                    </div>
                </div>
                <div className={clsx(styles.scoreBoard, styles.team, styles.team2, styles.box)}>
                    <div>
                        {state.teams[1].name}
                    </div>
                    <div className={styles.points}>
                        {state.teams[1].score}
                    </div>
                </div>
            </div>
        </div>

    }

    return (
        <div className={styles.main}>
            <div>
                <div className={clsx(
                    styles.question,
                    question.multiline && styles.multiline,
                    'animate__animated animate__fadeIn'
                )}>
                    {question.question}
                </div>
                <div>
                    <div className={styles.table}>
                        {[0, 1, 2, 3, 4, 5, 6, 7].map(answerId => {
                            const answer = answers[answerId] || { answer: '', points: 0 }
                            const answered =questionState.showAnswers[answerId]
                            if (answered) {
                                return <div key={questionNum + 'a'+answerId} className={clsx(styles.answer, 'animate__animated animate__fadeIn')}>
                                    <div>{answer.answer}</div>
                                    <div
                                        className={clsx(styles.points, styles.box)}>{answer.points != 0 && answer.points}</div>
                                </div>
                            } else if(answer.answer.length) {
                                return <div key={questionNum + 'u'+answerId} className={clsx(styles.answer, styles.unanswered)}>
                                    <div className={clsx(styles.questionMark, styles.box)}>{answerId+1}</div>
                                </div>
                            } else {
                                return <div key={questionNum + 'e'+answerId} className={clsx(styles.answer, styles.empty)}>
                                </div>
                            }
                        })}
                    </div>
                </div>
            </div>

            <div className={clsx(styles.xs)}>
                {
                    [1,2,3].map(i =>
                        <div key={'x'+i} className={styles.x}>
                            {questionState.xs >= i && 'X'}
                        </div>
                    )
                }
            </div>

            <div className={clsx(styles.bank, styles.box)}>
                {state.bank}
            </div>

            <div>
                <div className={clsx(styles.team, styles.team1, styles.box, state.teamOnTurn === 0 && styles.active)}>
                    <div>
                        {state.teams[0].name}
                    </div>
                    <div className={styles.points}>
                        {state.teams[0].score}
                    </div>
                </div>
                <div className={clsx(styles.team, styles.team2, styles.box, state.teamOnTurn === 1 && styles.active)}>
                    <div>
                        {state.teams[1].name}
                    </div>
                    <div className={styles.points}>
                        {state.teams[1].score}
                    </div>
                </div>
            </div>

            {showBigX && <div className={clsx(styles.bigX, 'animate__animated animate__zoomIn')}>
                {'X '.repeat(questionState.xs).trim()}
            </div>}
        </div>
    )
}

export default Home
